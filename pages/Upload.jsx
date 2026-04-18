import GoogleDriveVideoUpload from '@/components/upload/GoogleDriveVideoUpload';

// Der klassische "Upload"-Flow wurde auf Google Drive umgestellt.
// Kein lokales Transcoding mehr – Videos werden direkt in Drive gespeichert.
export default function Upload() {
  return <GoogleDriveVideoUpload />;
}
