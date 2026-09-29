"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { doc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, query, onSnapshot, orderBy, serverTimestamp, deleteDoc } from "firebase/firestore";
import Link from "next/link";
import { Heart, MessageCircle, Trash2, Send } from "lucide-react";

export default function PostCard({ post }: { post: any }) {
  const { userData } = useAuth();
  const [likes, setLikes] = useState<string[]>(post.likes || []);
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const isLiked = userData ? likes.includes(userData.uid) : false;

  useEffect(() => {
    const q = query(collection(db, "posts", post.id, "comments"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [post.id]);

  const handleLike = async () => {
    if (!userData) return;
    const postRef = doc(db, "posts", post.id);
    if (isLiked) {
      setLikes(likes.filter(id => id !== userData.uid));
      await updateDoc(postRef, { likes: arrayRemove(userData.uid) });
    } else {
      setLikes([...likes, userData.uid]);
      await updateDoc(postRef, { likes: arrayUnion(userData.uid) });
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData || !newComment.trim()) return;
    await addDoc(collection(db, "posts", post.id, "comments"), {
      userId: userData.uid,
      userName: userData.name,
      userPhoto: userData.photoURL || "",
      text: newComment,
      createdAt: serverTimestamp(),
    });
    setNewComment("");
  };

  const handleDelete = async () => {
    if (confirm("Delete this post?")) {
      await deleteDoc(doc(db, "posts", post.id));
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-sm">
      <div className="flex items-center justify-between">
        <Link href={`/user/${post.userId}`} className="flex items-center gap-3">
          <img src={post.userPhoto || "https://github.com/shadcn.png"} alt="" className="w-10 h-10 rounded-full object-cover border" />
          <div>
            <h4 className="font-semibold text-sm hover:underline">{post.userName}</h4>
            <span className="text-xs text-muted-foreground">
              {post.createdAt?.toDate ? new Date(post.createdAt.toDate()).toLocaleString() : "Just now"}
            </span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          {post.postType === "For Sale" && (
            <span className="bg-primary/10 text-primary text-xs px-2.5 py-1 rounded-full font-bold">
              Rs. {post.price} ({post.category})
            </span>
          )}
          {userData?.role === 'admin' && (
            <span className="text-xs bg-secondary px-2 py-1 rounded text-muted-foreground">IP: {post.ip}</span>
          )}
          {userData && (userData.uid === post.userId || userData.role === 'admin' || userData.role === 'owner') && (
            <button onClick={handleDelete} className="text-destructive hover:opacity-80 p-1">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <p className="text-sm whitespace-pre-wrap">{post.text}</p>

      {post.imageUrl && (
        <div className="rounded-lg overflow-hidden border border-border max-h-96 bg-secondary flex items-center justify-center">
          <img src={post.imageUrl} alt="" className="max-h-96 w-full object-cover" />
        </div>
      )}

      <div className="flex items-center gap-6 pt-2 border-t border-border text-sm text-muted-foreground">
        <button onClick={handleLike} className={`flex items-center gap-1.5 hover:text-rose-500 ${isLiked ? 'text-rose-500 font-semibold' : ''}`}>
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
          <span>{likes.length} Likes</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-1.5 hover:text-primary">
          <MessageCircle className="w-4 h-4" />
          <span>{comments.length} Comments</span>
        </button>
      </div>

      {showComments && (
        <div className="space-y-3 pt-3 border-t border-border">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {comments.map((c) => (
              <div key={c.id} className="flex items-start gap-2 text-xs bg-secondary p-2 rounded-lg">
                <img src={c.userPhoto || "https://github.com/shadcn.png"} alt="" className="w-6 h-6 rounded-full object-cover" />
                <div className="flex-1">
                  <span className="font-semibold block">{c.userName}</span>
                  <p className="text-foreground">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={handleComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary"
            />
            <button type="submit" className="bg-primary text-primary-foreground p-1.5 rounded-lg">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
