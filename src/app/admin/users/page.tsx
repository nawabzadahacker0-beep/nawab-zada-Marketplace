"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    getDocs(collection(db, "users")).then(snap => {
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const toggleBlock = async (id: string, isBlocked: boolean) => {
    await updateDoc(doc(db, "users", id), { isBlocked: !isBlocked });
    setUsers(users.map(u => u.id === id ? { ...u, isBlocked: !isBlocked } : u));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">User Management</h2>
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary border-b border-border text-muted-foreground">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">IP Address</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map(u => (
              <tr key={u.id}>
                <td className="p-3 flex items-center gap-3">
                  <img src={u.photoURL || "https://github.com/shadcn.png"} alt="" className="w-8 h-8 rounded-full object-cover border" />
                  <span className="font-semibold">{u.name}</span>
                </td>
                <td className="p-3 text-muted-foreground">{u.email}</td>
                <td className="p-3 text-muted-foreground">{u.ip || "N/A"}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${u.isBlocked ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                    {u.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td className="p-3">
                  <button
                    onClick={() => toggleBlock(u.id, u.isBlocked)}
                    className="bg-secondary px-3 py-1 rounded text-xs font-medium hover:bg-border"
                  >
                    {u.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
