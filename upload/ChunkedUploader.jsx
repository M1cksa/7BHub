import { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB chunks
const MAX_PARALLEL_UPLOADS = 3;
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 2000;
const CHUNK_UPLOAD_TIMEOUT = 60000; // 60s timeout

export default function useChunkedUploader() {
  const [uploads, setUploads] = useState(new Map());
  const abortControllersRef = useRef({});

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const uploadChunkWithRetry = async (uploadId, index, chunkBlob, totalChunks, signal, retries = 0) => {
    const uploadPromise = async () => {
      if (signal?.aborted) throw new Error('Upload cancelled');

      const formData = new FormData();
      formData.append('uploadId', uploadId);
      formData.append('chunkIndex', index.toString());
      formData.append('totalChunks', totalChunks.toString());
      formData.append('chunk', chunkBlob, `chunk_${index}.bin`);

      const response = await base44.functions.invoke('uploadChunk', formData);

      if (!response?.data?.success) {
        throw new Error(response?.data?.error || 'Chunk upload failed');
      }

      return response.data;
    };

    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), CHUNK_UPLOAD_TIMEOUT)
      );

      return await Promise.race([uploadPromise(), timeoutPromise]);
    } catch (error) {
      if (error.message === 'Upload cancelled' || signal?.aborted) {
        throw error;
      }
      
      if (retries < MAX_RETRIES) {
        const delay = RETRY_DELAY_BASE * Math.pow(2, retries);
        console.warn(`⚠️ Chunk ${index + 1} retry ${retries + 1}/${MAX_RETRIES}:`, error.message);
        await sleep(delay);
        return uploadChunkWithRetry(uploadId, index, chunkBlob, totalChunks, signal, retries + 1);
      }
      
      throw new Error(`Chunk ${index + 1} failed: ${error.message}`);
    }
  };

  const uploadFile = async (file, metadata = {}, onProgress) => {
    const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let uploadedBytes = 0;
    const startTime = Date.now();
    
    abortControllersRef.current[uploadId] = new AbortController();

    const updateProgress = (additionalBytes = 0) => {
      uploadedBytes += additionalBytes;
      const progress = (uploadedBytes / file.size) * 100;
      const elapsedSeconds = (Date.now() - startTime) / 1000;
      const uploadSpeed = uploadedBytes / elapsedSeconds;
      const remainingBytes = file.size - uploadedBytes;
      const eta = remainingBytes / uploadSpeed;

      if (onProgress) {
        onProgress({
          uploadId,
          progress: Math.min(progress, 99),
          uploadedBytes,
          totalBytes: file.size,
          uploadSpeed,
          eta,
          status: progress < 100 ? 'uploading' : 'processing'
        });
      }

      setUploads(prev => {
        const next = new Map(prev);
        next.set(uploadId, {
          uploadId,
          fileName: file.name,
          progress: Math.min(progress, 99),
          uploadedBytes,
          totalBytes: file.size,
          status: progress < 100 ? 'uploading' : 'processing'
        });
        return next;
      });
    };

    try {
      console.log(`Starting chunked upload: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) in ${totalChunks} chunks`);

      // Create chunk tasks
      const chunkTasks = [];
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunkBlob = file.slice(start, end);
        
        if (chunkBlob.size === 0) {
          throw new Error(`Chunk ${i} is empty`);
        }
        
        chunkTasks.push({ index: i, blob: chunkBlob, size: chunkBlob.size });
      }

      console.log(`📦 Created ${totalChunks} chunks`);

      // Upload chunks in parallel batches with error recovery
      const uploadedChunks = [];
      const failedChunks = [];
      
      for (let i = 0; i < chunkTasks.length; i += MAX_PARALLEL_UPLOADS) {
        // Check if cancelled
        if (abortControllersRef.current[uploadId]?.signal.aborted) {
          throw new Error('Upload cancelled');
        }

        const batch = chunkTasks.slice(i, i + MAX_PARALLEL_UPLOADS);
        console.log(`🚀 Batch ${Math.floor(i / MAX_PARALLEL_UPLOADS) + 1}/${Math.ceil(totalChunks / MAX_PARALLEL_UPLOADS)}`);

        const batchResults = await Promise.allSettled(
          batch.map(task => 
            uploadChunkWithRetry(uploadId, task.index, task.blob, totalChunks, abortControllersRef.current[uploadId]?.signal)
              .then(result => {
                updateProgress(task.size);
                return { index: task.index, success: true, result };
              })
              .catch(error => {
                console.error(`❌ Chunk ${task.index + 1} failed:`, error.message);
                return { index: task.index, success: false, error: error.message };
              })
          )
        );

        batchResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value.success) {
            uploadedChunks.push(result.value.result);
          } else {
            const errorData = result.status === 'fulfilled' ? result.value : { index: -1, error: result.reason?.message || 'Unknown error' };
            failedChunks.push(errorData);
          }
        });
      }

      if (failedChunks.length > 0) {
        throw new Error(`Upload failed: ${failedChunks.length} chunks failed`);
      }

      console.log(`✅ All ${uploadedChunks.length} chunks uploaded`);

      // Update status to processing
      if (onProgress) {
        onProgress({
          uploadId,
          progress: 90,
          uploadedBytes: file.size,
          totalBytes: file.size,
          status: 'processing'
        });
      }

      // Finalize upload
      console.log('Finalizing upload...');
      const finalizeResponse = await base44.functions.invoke('finalizeChunkedUpload', {
        uploadId,
        totalChunks,
        fileName: file.name,
        mimeType: file.type
      });

      if (!finalizeResponse.data?.success) {
        throw new Error(finalizeResponse.data?.error || 'Finalize failed');
      }

      console.log('Upload complete:', finalizeResponse.data.file_url);

      // Complete
      if (onProgress) {
        onProgress({
          uploadId,
          progress: 100,
          uploadedBytes: file.size,
          totalBytes: file.size,
          status: 'complete',
          videoUrl: finalizeResponse.data.file_url
        });
      }

      setUploads(prev => {
        const next = new Map(prev);
        next.set(uploadId, {
          uploadId,
          fileName: file.name,
          progress: 100,
          status: 'complete',
          videoUrl: finalizeResponse.data.file_url
        });
        return next;
      });

      return { 
        success: true, 
        video_url: finalizeResponse.data.file_url, 
        uploadId 
      };

    } catch (error) {
      console.error('Chunked upload error:', error);

      // Cleanup chunks on error
      try {
        console.log(`[${uploadId}] Cleaning up failed upload...`);
        await base44.functions.invoke('cleanupUpload', { uploadId }).catch(() => {});
      } catch (cleanupError) {
        console.warn('Cleanup failed:', cleanupError);
      }

      if (error.message === 'Upload cancelled') {
        if (onProgress) {
          onProgress({ uploadId, status: 'cancelled' });
        }
        setUploads(prev => {
          const next = new Map(prev);
          next.set(uploadId, {
            uploadId,
            fileName: file.name,
            status: 'cancelled'
          });
          return next;
        });
      } else {
        if (onProgress) {
          onProgress({ uploadId, status: 'error', error: error.message });
        }
        setUploads(prev => {
          const next = new Map(prev);
          next.set(uploadId, {
            uploadId,
            fileName: file.name,
            status: 'error',
            error: error.message
          });
          return next;
        });
        throw error;
      }
    } finally {
      delete abortControllersRef.current[uploadId];
    }
  };

  const cancelUpload = (uploadId) => {
    if (abortControllersRef.current[uploadId]) {
      abortControllersRef.current[uploadId].abort();
      console.log(`Upload ${uploadId} cancelled`);
    }
  };

  const clearUpload = (uploadId) => {
    setUploads(prev => {
      const next = new Map(prev);
      next.delete(uploadId);
      return next;
    });
  };

  return {
    uploadFile,
    cancelUpload,
    clearUpload,
    uploads: Array.from(uploads.values())
  };
}