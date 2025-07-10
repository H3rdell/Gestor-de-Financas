import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, signInWithCredential } from 'firebase/auth';
import { app } from '../firebase/configuracao';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCarregando(false);
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(user ? 'USER_LOGGED_IN' : 'USER_LOGGED_OUT');
      }
    });

    const handleTokenFromNative = async (event) => {
      const { token } = event.detail;
      if (token) {
        setCarregando(true);
        try {
          const credential = GoogleAuthProvider.credential(token);
          await signInWithCredential(auth, credential);
        } catch (error) {
          console.error("Erro ao autenticar com credencial nativa:", error);
          setCarregando(false); 
        }
      }
    };
    window.addEventListener('firebaseAuthTokenReceived', handleTokenFromNative);

    return () => {
      unsubscribe();
      window.removeEventListener('firebaseAuthTokenReceived', handleTokenFromNative);
    };
  }, [auth]);

  const loginComGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => signOut(auth);

  const value = { usuario, carregando, loginComGoogle, logout };

  return (
    <AuthContext.Provider value={value}>
      {!carregando && children}
    </AuthContext.Provider>
  );
