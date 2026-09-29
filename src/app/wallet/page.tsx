"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Wallet, CreditCard, Upload } from "lucide-react";

export default function WalletPage() {
  const { userData } = useAuth();
  const [bankSettings, setBankSettings] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Meezan Bank");
  const [txnId, setTxnId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "settings", "bank")).then(snap => {
      if (snap.exists()) setBankSettings(snap.data());
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !screenshot) return;
    setLoading(true);
    try {
      const storageRef = ref(storage, `payments/${Date.now()}_${screenshot.name}`);
      await uploadBytes(storageRef, screenshot);
      const screenshotUrl = await getDownloadURL(storageRef);

      await addDoc(collection(db, "paymentRequests"), {
        userId: userData.uid,
        userName: userData.name,
        amount: Number(amount),
        method,
        txnId,
        screenshotUrl,
        status: "pending",
        ip: userData.ip || "0.0.0.0",
        createdAt: serverTimestamp(),
      });

      setSuccess(true);
      setAmount("");
      setTxnId("");
      setScreenshot(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-between shadow-sm">
        <div>
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Wallet Balance</span>
          <h2 className="text-3xl font-bold mt-1 text-primary">Rs. {userData?.walletBalance || 0}</h2>
        </div>
        <div className="bg-primary/10 p-3 rounded-full text-primary">
          <Wallet className="w-8 h-8" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" /> Owner Deposit Bank Details
        </h3>
        <div className="bg-secondary p-4 rounded-lg space-y-2 text-sm">
          <p><span className="text-muted-foreground">Bank Name:</span> {bankSettings?.bankName || "Meezan Bank"}</p>
          <p><span className="text-muted-foreground">Account Number:</span> {bankSettings?.account || "12400111888873"}</p>
          <p><span className="text-muted-foreground">Account Title:</span> {bankSettings?.title || "Shahid Hussain"}</p>
          <p><span className="text-muted-foreground">JazzCash / Easypaisa:</span> {bankSettings?.jazzcash || "03001234567"}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
        <h3 className="font-bold text-lg">Submit Payment Deposit</h3>
        {success && (
          <div className="bg-primary/10 text-primary text-sm p-3 rounded-lg border border-primary/20">
            Payment request submitted successfully! Pending owner approval.
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Amount (Rs)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Payment Method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
            >
              <option value="Meezan Bank">Meezan Bank</option>
              <option value="JazzCash">JazzCash</option>
              <option value="Easypaisa">Easypaisa</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Transaction ID / Reference No</label>
            <input
              type="text"
              value={txnId}
              onChange={(e) => setTxnId(e.target.value)}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
              required
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Payment Screenshot</label>
            <label className="flex items-center gap-2 border border-border bg-secondary p-3 rounded-lg cursor-pointer text-sm text-muted-foreground hover:text-primary">
              <Upload className="w-4 h-4" />
              <span>{screenshot ? screenshot.name : "Upload screenshot"}</span>
              <input type="file" accept="image/*" onChange={(e) => e.target.files && setScreenshot(e.target.files[0])} className="hidden" required />
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </div>
  );
}
