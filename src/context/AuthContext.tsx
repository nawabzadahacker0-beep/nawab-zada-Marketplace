"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User as FirebaseUser, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface AppUser {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  photoURL?: string;
  walletBalance: number;
  role: 'user' | 'admin' | 'owner';
  isBlocked: boolean;
  ip: string;
  createdAt: any;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  userData: AppUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserData = async (uid: string) => {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as AppUser;
      setUserData(data);
      return data;
    }
    return null;
  };

  const refreshUserData = async () => {
    if (firebaseUser) {
      await fetchUserData(firebaseUser.uid);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        let data = await fetchUserData(user.uid);
        if (!data) {
          let ip = "0.0.0.0";
          try {
            const res = await fetch("https://api.ipify.org?format=json");
            const json = await res.json();
            ip = json.ip;
          } catch (e) {}

          const newUser: AppUser = {
            uid: user.uid,
            name: user.displayName || "User",
            email: user.email || "",
            phone: user.phoneNumber || "",
            photoURL: user.photoURL || "",
            walletBalance: 0,
            role: "user",
            isBlocked: false,
            ip,
            createdAt: serverTimestamp(),
          };
          await setDoc(doc(db, "users", user.uid), newUser);
          setUserData(newUser);
        } else if (data.isBlocked) {
          router.push("/login?error=blocked");
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []); // <-- pathname hata diya, ab loop nahi banega

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/");
    } catch (error) {
      console.error(error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserData(null);
    setFirebaseUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ firebaseUser, userData, loading, signInWithGoogle, logout, refreshUserData }}>
      {!loading ? children : <div className="p-10 text-center">Loading...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
