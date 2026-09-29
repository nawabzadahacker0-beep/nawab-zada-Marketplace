"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AdminChatsPage() {
  const [chats, setChats] = useState<any[]>([]);

  useEffect(() => {
    getDocs(collection(db, "chats")).then(snap => {
      setChats(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Live Chat Conversations Monitor</h2>
      <div className="space-y-4">
        {chats.map(c => (
          <div key={c.id} className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-2">
            <h4 className="font-semibold text-sm">Chat ID: {c.id}</h4>
            <p className="text-xs text-muted-foreground">Participants: {c.participants?.join(", ")}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
