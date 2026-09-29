"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import PostCard from "@/components/PostCard";
import PostModal from "@/components/PostModal";
import { Plus } from "lucide-react";

export default function Home() {
  const { userData } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-6 space-y-6">
      {userData && (
        <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <img src={userData.photoURL || "https://github.com/shadcn.png"} alt="" className="w-10 h-10 rounded-full object-cover border" />
            <span className="text-sm font-medium text-muted-foreground">What's on your mind, {userData.name}?</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1.5 hover:opacity-90"
          >
            <Plus className="w-4 h-4" /> Create Post
          </button>
        </div>
      )}

      <div className="space-y-4">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
        {posts.length === 0 && (
          <p className="text-center text-muted-foreground py-12">No posts available yet.</p>
        )}
      </div>

      <PostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
