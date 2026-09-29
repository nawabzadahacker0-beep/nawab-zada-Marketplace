"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Image as ImageIcon, X } from "lucide-react";

export default function PostModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { userData } = useAuth();
  const [text, setText] = useState("");
  const [postType, setPostType] = useState<"Social" | "For Sale">("Social");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) return;
    setLoading(true);
    try {
      let imageUrl = "";
      if (image) {
        const storageRef = ref(storage, `posts/${Date.now()}_${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }

      await addDoc(collection(db, "posts"), {
        userId: userData.uid,
        userName: userData.name,
        userPhoto: userData.photoURL || "",
        text,
        imageUrl,
        postType,
        price: postType === "For Sale" ? Number(price) : 0,
        category: postType === "For Sale" ? category : "",
        likes: [],
        ip: userData.ip || "0.0.0.0",
        createdAt: serverTimestamp(),
      });

      setText("");
      setImage(null);
      setPrice("");
      setCategory("");
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-xl border border-border p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold mb-4">Create Post</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full bg-secondary border border-border rounded-lg p-3 text-foreground resize-none focus:outline-none focus:border-primary min-h-[100px]"
            placeholder="What's on your mind or what are you selling?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
          />
          <div className="flex gap-4">
            <select
              value={postType}
              onChange={(e) => setPostType(e.target.value as any)}
              className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm"
            >
              <option value="Social">Social</option>
              <option value="For Sale">For Sale</option>
            </select>
            {postType === "For Sale" && (
              <>
                <input
                  type="number"
                  placeholder="Price (Rs)"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm w-1/3"
                  required
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm w-1/3"
                  required
                />
              </>
            )}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-4">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-primary">
              <ImageIcon className="w-5 h-5" />
              <span>{image ? image.name : "Add Image"}</span>
              <input type="file" accept="image/*" onChange={(e) => e.target.files && setImage(e.target.files[0])} className="hidden" />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-primary-foreground px-5 py-2 rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Posting..." : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
