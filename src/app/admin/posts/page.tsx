"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { Trash2 } from "lucide-react";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    getDocs(collection(db, "posts")).then(snap => {
      setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Delete post?")) {
      await deleteDoc(doc(db, "posts", id));
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Posts Management</h2>
      <div className="space-y-4">
        {posts.map(p => (
          <div key={p.id} className="bg-card border border-border p-4 rounded-xl flex items-center justify-between shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">{p.userName}</span>
                <span className="text-xs bg-secondary px-2 py-0.5 rounded text-muted-foreground">IP: {p.ip}</span>
              </div>
              <p className="text-sm line-clamp-1">{p.text}</p>
            </div>
            <button onClick={() => handleDelete(p.id)} className="text-destructive p-2 hover:bg-secondary rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
