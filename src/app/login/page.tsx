"use client";

import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-md p-8 rounded-2xl text-center space-y-6 shadow-xl">
        <h1 className="text-2xl font-bold tracking-tight">Nawab Zada Marketplace</h1>
        <p className="text-sm text-muted-foreground">Sign in with your Google account to access the platform securely.</p>
        {error === 'blocked' && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20 font-medium">
            Your account has been blocked by admin.
          </div>
        )}
        <button
          onClick={signInWithGoogle}
          className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-xl hover:opacity-90 transition shadow-lg"
        >
          Sign In with Google
        </button>
      </div>
    </div>
  );
}
