"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { DollarSign, Clock, CheckCircle, Users } from "lucide-react";

export default function OwnerDashboard() {
  const [stats, setStats] = useState({ totalDeals: 0, pendingDeals: 0, completedDeals: 0, commission: 0, users: 0 });

  useEffect(() => {
    async function fetchStats() {
      const dealsSnap = await getDocs(collection(db, "deals"));
      const usersSnap = await getDocs(collection(db, "users"));
      let pending = 0, completed = 0, comm = 0;
      dealsSnap.forEach(d => {
        const data = d.data();
        if (data.status === 'pending_payment') pending++;
        if (data.status === 'completed') {
          completed++;
          comm += data.commission || 0;
        }
      });
      setStats({ totalDeals: dealsSnap.size, pendingDeals: pending, completedDeals: completed, commission: comm, users: usersSnap.size });
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Owner Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border p-6 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-semibold">Total Deals</span>
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-3xl font-bold">{stats.totalDeals}</h3>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-semibold">Pending Deals</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-3xl font-bold">{stats.pendingDeals}</h3>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-semibold">Completed Deals</span>
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-3xl font-bold">{stats.completedDeals}</h3>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-semibold">Total Commission (10%)</span>
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="text-3xl font-bold">Rs. {stats.commission}</h3>
        </div>
        <div className="bg-card border border-border p-6 rounded-xl space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-sm font-semibold">Total Users</span>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-3xl font-bold">{stats.users}</h3>
        </div>
      </div>
    </div>
  );
}
