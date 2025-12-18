import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('🔍 DEBUG: Obteniendo sesión inicial...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.warn('⚠️ Error obteniendo sesión:', error.message);
        }
        
        setSession(session);
        setUser(session?.user || null);
        console.log('✅ DEBUG: Sesión inicial obtenida:', !!session);
      } catch (error) {
        console.error('❌ Error crítico en getInitialSession:', error);
        // En caso de error, asumir que no hay sesión
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          console.log('🔄 DEBUG: Auth state changed:', event);
          setSession(session);
          setUser(session?.user || null);
          setLoading(false);

          // Update user profile in database (sin bloquear la UI)
          if (session?.user) {
            updateUserProfile(session.user).catch(error => {
              console.warn('⚠️ Error actualizando perfil de usuario:', error);
              // No lanzar el error para no interrumpir el flujo de autenticación
            });
          }
        } catch (error) {
          console.error('❌ Error en onAuthStateChange:', error);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const updateUserProfile = async (user, password = null) => {
    try {
      const profileData = {
        id: user.id,
        email: user.email,
        full_name: user?.user_metadata?.full_name || user?.email,
        avatar_url: user?.user_metadata?.avatar_url || null,
        updated_at: new Date().toISOString()
      };

      // Add password hash if provided
      if (password) {
        const { data: hashData, error: hashError } = await supabase.rpc('hash_password', {
          password_text: password
        });
        
        if (!hashError && hashData) {
          profileData.password_hash = hashData;
        }
      }

      const { error } = await supabase
        .from('users')
        .upsert(profileData);

      if (error) {
        console.error('Error updating user profile:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  };

  const signUpWithEmail = async (email, password, fullName) => {
    try {
      // First, create the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;

      // If user was created successfully, update the profile with password hash
      if (data.user) {
        await updateUserProfile(data.user, password);
      }

      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    // OAuth with Gmail scopes for registration and login
    const timestamp = Date.now();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback?t=${timestamp}`,
        scopes: 'email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send'
      }
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
    return data;
  };

  const updatePassword = async (password) => {
    try {
      // Update password in Supabase Auth
      const { data, error } = await supabase.auth.updateUser({
        password
      });

      if (error) throw error;

      // Update password hash in users table
      if (user) {
        const { error: hashError } = await supabase.rpc('update_user_password', {
          user_id: user.id,
          new_password: password
        });

        if (hashError) {
          console.error('Error updating password hash:', hashError);
        }
      }

      return data;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  };

  const verifyPassword = async (password) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (!data?.password_hash) {
        throw new Error('No password hash found');
      }

      const { data: isValid, error: verifyError } = await supabase.rpc('verify_password', {
        password_text: password,
        hash_text: data.password_hash
      });

      if (verifyError) throw verifyError;

      return isValid;
    } catch (error) {
      console.error('Error verifying password:', error);
      throw error;
    }
  };

  const getUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    resetPassword,
    updatePassword,
    verifyPassword,
    getUserProfile,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};