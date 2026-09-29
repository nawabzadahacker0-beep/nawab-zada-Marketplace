"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { useParams } from "next/navigation";
import { Send } from "lucide-react";

export default function ChatPage() {
  const { chatId } = useParams();
  const { userData } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, "chats", chatId as string, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [chatId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !text.trim()) return;
    await addDoc(collection(db, "chats", chatId as string, "messages"), {
      text,
      senderId: userData.uid,
      createdAt: serverTimestamp(),
    });
    setText("");
  };

  return (
    <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col p-4 h-[calc(100vh-4rem)]">
      <div className="bg-card border border-border rounded-t-xl p-4 font-bold border-b">Conversation</div>
      <div className="flex-1 bg-secondary/50 border-x border-border p-4 overflow-y-auto space-y-3">
        {messages.map(m => {
          const isSelf = m.senderId === userData?.uid;
          return (
            <div key={m.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-xl px-4 py-2.5 text-sm ${isSelf ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>
                {m.text}
              </div>
            </div>
          );
        })}
      </div>
      <form onSubmit={handleSend} className="bg-card border border-border rounded-b-xl p-3 flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-secondary border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
          required
        />
        <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
