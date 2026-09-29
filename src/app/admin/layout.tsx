"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { LayoutDashboard, Users, FileText, MessageSquare, CreditCard } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!userData || (userData.role !== 'admin' && userData.role !== 'owner'))) {
      router.push("/");
    }
  }, [userData, loading]);

  if (loading || !userData) return <div className="text-center py-12">Loading admin panel...</div>;

  return (
    <div className="flex-1 flex flex-col md:flex-row max-w-6xl mx-auto w-full p-4 gap-6">
      <aside className="w-full md:w-64 bg-card border border-border rounded-xl p-4 space-y-2 h-fit">
        <h3 className="font-bold text-lg mb-4 text-primary px-2">Admin Panel</h3>
        <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm font-medium">
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </Link>
        <Link href="/admin/users" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm font-medium">
          <Users className="w-4 h-4" /> Users Management
        </Link>
        <Link href="/admin/posts" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm font-medium">
          <FileText className="w-4 h-4" /> Posts Management
        </Link>
        <Link href="/admin/chats" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm font-medium">
          <MessageSquare className="w-4 h-4" /> Chats Monitor
        </Link>
        <Link href="/admin/payments" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm font-medium">
          <CreditCard className="w-4 h-4" /> Payments View
        </Link>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
