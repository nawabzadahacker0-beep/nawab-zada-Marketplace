"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { LayoutDashboard, CreditCard, ShoppingBag, Settings } from "lucide-react";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const { userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!userData || userData.role !== 'owner')) {
      router.push("/");
    }
  }, [userData, loading]);

  if (loading || !userData) return <div className="text-center py-12">Loading owner panel...</div>;

  return (
    <div className="flex-1 flex flex-col md:flex-row max-w-6xl mx-auto w-full p-4 gap-6">
      <aside className="w-full md:w-64 bg-card border border-border rounded-xl p-4 space-y-2 h-fit">
        <h3 className="font-bold text-lg mb-4 text-amber-500 px-2">Owner Panel</h3>
        <Link href="/owner" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm font-medium">
          <LayoutDashboard className="w-4 h-4" /> Dashboard
        </Link>
        <Link href="/owner/payments" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm font-medium">
          <CreditCard className="w-4 h-4" /> Payment Requests
        </Link>
        <Link href="/owner/deals" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm font-medium">
          <ShoppingBag className="w-4 h-4" /> Deals & Commission
        </Link>
        <Link href="/owner/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-secondary text-sm font-medium">
          <Settings className="w-4 h-4" /> Bank Settings
        </Link>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
