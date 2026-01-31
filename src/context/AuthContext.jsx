import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 1. Start "Loading" as TRUE
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebase checks LocalStorage automatically here
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // 2. Only stop loading when Firebase answers
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const logout = () => {
    return signOut(auth);
  };

  // 3. EXPOSE 'loading' TO THE APP
  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, loading }}>
      {/* While loading, we can show a blank screen or a spinner to prevent flickering */}
      {loading ? (
        <div className="h-screen w-full flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
