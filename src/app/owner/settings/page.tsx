"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function OwnerSettingsPage() {
  const [bankName, setBankName] = useState("Meezan Bank");
  const [account, setAccount] = useState("12400111888873");
  const [title, setTitle] = useState("Shahid Hussain");
  const [jazzcash, setJazzcash] = useState("03001234567");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getDoc(doc(db, "settings", "bank")).then(snap => {
      if (snap.exists()) {
        const d = snap.data();
        setBankName(d.bankName || "");
        setAccount(d.account || "");
        setTitle(d.title || "");
        setJazzcash(d.jazzcash || "");
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await setDoc(doc(db, "settings", "bank"), { bankName, account, title, jazzcash });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h2 className="text-2xl font-bold">Edit Bank Settings</h2>
      {success && (
        <div className="bg-primary/10 text-primary text-sm p-3 rounded-lg border border-primary/20">
          Settings saved successfully!
        </div>
      )}
      <form onSubmit={handleSave} className="bg-card border border-border rounded-xl p-6 space-y-4 shadow-sm">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Bank Name</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Account Number</label>
          <input
            type="text"
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Account Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">JazzCash / Easypaisa Number</label>
          <input
            type="text"
            value={jazzcash}
            onChange={(e) => setJazzcash(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
            required
          />
        </div>
        <button type="submit" className="w-full bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:opacity-90">
          Save Settings
        </button>
      </form>
    </div>
  );
}
