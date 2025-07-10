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
    // Listener que observa mudanças no estado de autenticação do Firebase
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCarregando(false);
      
      // Comunica o status do login para o app nativo, se estiver em um WebView
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(user ? 'USER_LOGGED_IN' : 'USER_LOGGED_OUT');
      }
    });

    // Função para lidar com o token recebido do app nativo
    const handleTokenFromNative = async (event) => {
      const { token } = event.detail;

      if (token) {
        setCarregando(true);
        try {
          const credential = GoogleAuthProvider.credential(token);
          await signInWithCredential(auth, credential);
        } catch (error) {
          console.error("Erro ao autenticar com a credencial nativa:", error);
          setCarregando(false); 
        }
      }
    };

    // Adiciona o listener para o evento customizado que o app nativo vai disparar
    window.addEventListener('firebaseAuthTokenReceived', handleTokenFromNative);

    // Função de limpeza que é executada quando o componente é desmontado
    return () => {
      unsubscribe();
      window.removeEventListener('firebaseAuthTokenReceived', handleTokenFromNative);
    };
  }, [auth]);

  // Método de login para o navegador web
  const loginComGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => {
    return signOut(auth);
  };

  // Objeto com os valores a serem fornecidos pelo contexto
  const value = {
    usuario,
    carregando,
    loginComGoogle,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!carregando && children}
    </AuthContext.Provider>
  );
}
