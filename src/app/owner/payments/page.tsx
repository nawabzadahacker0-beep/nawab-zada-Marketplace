"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, increment } from "firebase/firestore";

export default function OwnerPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    getDocs(collection(db, "paymentRequests")).then(snap => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const handleApprove = async (id: string, userId: string, amount: number) => {
    await updateDoc(doc(db, "paymentRequests", id), { status: 'approved' });
    await updateDoc(doc(db, "users", userId), { walletBalance: increment(amount) });
    setPayments(payments.map(p => p.id === id ? { ...p, status: 'approved' } : p));
  };

  const handleReject = async (id: string) => {
    await updateDoc(doc(db, "paymentRequests", id), { status: 'rejected' });
    setPayments(payments.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Approve Payment Requests</h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary border-b border-border text-muted-foreground">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Method</th>
              <th className="p-3">Txn ID</th>
              <th className="p-3">Screenshot</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map(p => (
              <tr key={p.id}>
                <td className="p-3 font-semibold">{p.userName}</td>
                <td className="p-3 text-primary font-bold">Rs. {p.amount}</td>
                <td className="p-3">{p.method}</td>
                <td className="p-3 text-muted-foreground">{p.txnId}</td>
                <td className="p-3">
                  <a href={p.screenshotUrl} target="_blank" className="text-primary hover:underline text-xs">View</a>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${p.status === 'approved' ? 'bg-primary/10 text-primary' : p.status === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-500'}`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-3 space-x-2">
                  {p.status === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(p.id, p.userId, p.amount)} className="bg-primary text-primary-foreground px-2.5 py-1 rounded text-xs font-semibold">Approve</button>
                      <button onClick={() => handleReject(p.id)} className="bg-destructive/10 text-destructive px-2.5 py-1 rounded text-xs font-semibold">Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
