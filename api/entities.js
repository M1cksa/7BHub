import { base44 } from './base44Client';

// Base44 stellte `Query` als Low-Level-Builder bereit. Den brauchen wir
// mit Supabase nicht — wird bei Bedarf in Phase 2 nachgezogen.
export const Query = base44.entities.Query;

// Auth-Namespace für Komponenten, die `User.me()` verwendet haben.
export const User = base44.auth;
