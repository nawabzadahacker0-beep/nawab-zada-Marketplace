"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Users, FileText, CreditCard } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, posts: 0, pendingPayments: 0 });

  useEffect(() => {
    async function fetchStats() {
      const usersSnap = await getDocs(collection(db, "users"));
      const postsSnap = await getDocs(collection(db, "posts"));
      const paymentsSnap = await getDocs(collection(db, "paymentRequests"));
      let pending = 0;
      paymentsSnap.forEach(d => { if (d.data().status === 'pending') pending++; });
      setStats({ users: usersSnap.size, posts: postsSnap.size, pendingPayments: pending });
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-6 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-semibold">Total Users</span>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-3xl font-bold">{stats.users}</h3>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-semibold">Total Posts</span>
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-3xl font-bold">{stats.posts}</h3>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-semibold">Pending Payments</span>
            <CreditCard className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-3xl font-bold">{stats.pendingPayments}</h3>
        </div>
      </div>
    </div>
  );
}
