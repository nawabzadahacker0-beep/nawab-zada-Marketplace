"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function OwnerDealsPage() {
  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    getDocs(collection(db, "deals")).then(snap => {
      setDeals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Marketplace Deals & Commissions</h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary border-b border-border text-muted-foreground">
            <tr>
              <th className="p-3">Deal ID</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Commission (10%)</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {deals.map(d => (
              <tr key={d.id}>
                <td className="p-3 font-semibold">{d.dealId}</td>
                <td className="p-3">Rs. {d.amount}</td>
                <td className="p-3 text-primary font-bold">Rs. {d.commission}</td>
                <td className="p-3">
                  <span className="bg-secondary px-2 py-1 rounded text-xs font-semibold">{d.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
