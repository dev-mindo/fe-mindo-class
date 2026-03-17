import { useState, useEffect } from 'react';
import { getAuth, signInAnonymously, User } from "firebase/auth";
import { app } from '../lib/config/firebase'; // Pastikan Anda mengimpor 'app' dari file konfigurasi Anda

// Dapatkan instance Auth di luar hook untuk mencegah inisialisasi berulang
const auth = getAuth(app);

interface AuthState {
  user: User | null;
  loading: boolean;
}

const useAnonymousAuth = (): AuthState => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    // onAuthStateChanged adalah listener yang lebih stabil, tapi kita gunakan signInAnonymously
    // untuk memastikan setiap sesi memiliki identitas.
    
    // Coba sign-in anonim
    signInAnonymously(auth)
      .then((userCredential) => {
        // Berhasil mendapatkan identitas anonim
        setAuthState({
          user: userCredential.user,
          loading: false,
        });
        console.log("Pengguna Anonim Berhasil Diperoleh. UID:", userCredential.user.uid);
      })
      .catch((error) => {
        console.error("Gagal melakukan login anonim:", error.message);
        setAuthState({
          user: null,
          loading: false, // Selesai loading, tapi gagal
        });
      });
      
      // Cleanup: Meskipun pengguna anonim tidak di-sign-out di sini,
      // kita membiarkan sesi tetap aktif selama halaman dimuat.
  }, []); 

  return authState;
};

export default useAnonymousAuth;