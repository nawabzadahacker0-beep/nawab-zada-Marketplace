"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const { firebaseUser, refreshUserData } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const router = useRouter();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    // Simulating instant code dispatch for robust implementation
    setStep("otp");
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4 || !firebaseUser) return;
    await updateDoc(doc(db, "users", firebaseUser.uid), { phone });
    await refreshUserData();
    router.push("/");
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-md p-8 rounded-2xl space-y-6 shadow-xl">
        <h1 className="text-xl font-bold">Compulsory Verification</h1>
        <p className="text-sm text-muted-foreground">Please verify your phone number to continue using Nawab zada Marketplace.</p>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Phone Number (+92...)</label>
              <input
                type="text"
                placeholder="+923001234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:opacity-90">
              Send Code
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Enter 6-digit OTP (Mock: any 4+ digits)</label>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-primary"
                required
              />
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:opacity-90">
              Verify OTP & Continue
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
