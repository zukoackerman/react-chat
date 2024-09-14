import { createContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, db } from "../firebaseConfig.ts";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { FirebaseError } from "firebase/app";

export interface LoginProps {
  email: string;
  password: string;
}

export interface RegisterProps extends LoginProps {
  username: string;
  profileUrl: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  profile_picture_url: string;
  role: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean | undefined;
  login: (props: LoginProps) => Promise<{ success: boolean; msg?: string }>;
  logout: () => Promise<{ success: boolean; msg?: string; error?: unknown }>;
  register: (props: RegisterProps) => Promise<{ success: boolean; msg?: string; data?: FirebaseUser }>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        updateUserData(user.uid);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });
    return unsub;
  }, []);

  const updateUserData = async (userId: string) => {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as User;
      setUser(data);
    }
  };

  const login = async ({ email, password }: LoginProps) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      if (error instanceof FirebaseError) {
        let msg = error.message;
        if (msg.includes("(auth/invalid-email)")) msg = "Invalid Email";
        if (msg.includes("(auth/invalid-credential)")) msg = "Wrong Credentials";
        return { success: false, msg };
      }
      return { success: false, msg: "An unexpected error occurred" };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      if (error instanceof FirebaseError) {
        return { success: false, msg: error.message, error };
      }
      return { success: false, msg: "An unexpected error occurred", error };
    }
  };

  const register = async ({
    email,
    password,
    username,
    profileUrl,
  }: RegisterProps) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await setDoc(doc(db, "users", response.user.uid), {
        id: response.user.uid,
        name: username,
        profile_picture_url: profileUrl,
        role: 1, 
        email: email,
      });
      return { success: true, data: response.user };
    } catch (error) {
      if (error instanceof FirebaseError) {
        let msg = error.message;
        if (msg.includes("(auth/invalid-email)")) msg = "Invalid Email";
        if (msg.includes("(auth/email-already-in-use)"))
          msg = "This email is already in use";
        return { success: false, msg };
      }
      return { success: false, msg: "An unexpected error occurred" };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};
