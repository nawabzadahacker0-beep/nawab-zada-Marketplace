"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Wallet, ShieldAlert, LogOut, MessageSquare, User as UserIcon } from "lucide-react";

export default function Navbar() {
  const { userData, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-primary tracking-wider">
          nawab zada <span className="text-foreground">Marketplace</span>
        </Link>
        {userData && (
          <div className="flex items-center gap-4">
            <Link href="/wallet" className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full text-sm font-medium">
              <Wallet className="w-4 h-4 text-primary" />
              <span>Rs. {userData.walletBalance || 0}</span>
            </Link>
            <Link href={`/user/${userData.uid}`} className="flex items-center gap-2 hover:opacity-80">
              <img src={userData.photoURL || "https://github.com/shadcn.png"} alt="" className="w-8 h-8 rounded-full object-cover border" />
              <span className="hidden md:inline font-medium text-sm">{userData.name}</span>
            </Link>
            {(userData.role === 'admin' || userData.role === 'owner') && (
              <Link href="/admin" className="p-2 hover:bg-secondary rounded-full" title="Admin Panel">
                <ShieldAlert className="w-5 h-5 text-amber-500" />
              </Link>
            )}
            {userData.role === 'owner' && (
              <Link href="/owner" className="text-xs bg-amber-500 text-black px-2.5 py-1 rounded-full font-bold">
                OWNER
              </Link>
            )}
            <button onClick={logout} className="p-2 hover:bg-secondary rounded-full text-destructive" title="Logout">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
