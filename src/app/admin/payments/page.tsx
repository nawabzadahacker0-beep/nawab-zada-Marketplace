"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    getDocs(collection(db, "paymentRequests")).then(snap => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Payment Requests View</h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary border-b border-border text-muted-foreground">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Method</th>
              <th className="p-3">Txn ID</th>
              <th className="p-3">Status</th>
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
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${p.status === 'approved' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-500'}`}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
