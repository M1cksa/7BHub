import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';
import { base44 } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      // Timeout: nach 5s aufgeben statt endlos zu laden
      const timeout = setTimeout(() => {
        if (mounted) setIsLoadingAuth(false);
      }, 5000);

      try {
        setAppPublicSettings({ id: 'default', public_settings: {} });
        setIsLoadingPublicSettings(false);

        // Gespeichertes Profil sofort zeigen (kein Netzwerk-Warten)
        const stored = localStorage.getItem('app_user');
        if (stored && stored !== 'undefined') {
          try {
            const cached = JSON.parse(stored);
            setUser(cached);
            setIsAuthenticated(true);
          } catch {}
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          const profile = await base44.auth.me();
          if (mounted) {
            setUser(profile || { id: session.user.id, email: session.user.email });
            setIsAuthenticated(true);
          }
        } else {
          if (mounted) {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('app_user');
          }
        }
      } catch (err) {
        console.error('Auth bootstrap error:', err);
      } finally {
        clearTimeout(timeout);
        if (mounted) setIsLoadingAuth(false);
      }
    };

    bootstrap();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        try {
          const profile = await base44.auth.me();
          setUser(profile);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Auth state profile fetch failed:', err);
          setUser({ id: session.user.id, email: session.user.email });
          setIsAuthenticated(true);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect && typeof window !== 'undefined') {
      window.location.href = '/SignIn';
    }
  };

  const navigateToLogin = () => {
    if (typeof window === 'undefined') return;
    const returnTo = encodeURIComponent(window.location.href);
    window.location.href = `/SignIn?return_to=${returnTo}`;
  };

  const checkAppState = async () => {
    const profile = await base44.auth.me();
    setUser(profile);
    setIsAuthenticated(!!profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        logout,
        navigateToLogin,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
