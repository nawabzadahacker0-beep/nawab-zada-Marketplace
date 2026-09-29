"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useParams, useRouter } from "next/navigation";
import PostCard from "@/components/PostCard";
import { MessageSquare, UserX, Camera, Wallet } from "lucide-react";

export default function UserProfilePage() {
  const { id } = useParams();
  const { userData, refreshUserData } = useAuth();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [chatStatus, setChatStatus] = useState<string | null>(null);
  const [chatDocId, setChatDocId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    getDoc(doc(db, "users", id as string)).then(snap => {
      if (snap.exists()) setProfileUser(snap.data());
    });

    const q = query(collection(db, "posts"), where("userId", "==", id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Check chat request status
    if (userData) {
      const chatReqQuery = query(collection(db, "chatRequests"), where("fromId", "in", [userData.uid, id]), where("toId", "in", [userData.uid, id]));
      onSnapshot(chatReqQuery, (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setChatStatus(data.status);
        }
      });

      const chatQuery = query(collection(db, "chats"), where("participants", "array-contains", userData.uid));
      onSnapshot(chatQuery, (snapshot) => {
        const found = snapshot.docs.find(d => d.data().participants.includes(id));
        if (found) setChatDocId(found.id);
      });
    }

    return () => unsubscribe();
  }, [id, userData]);

  const handleProfilePicUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !userData || userData.uid !== id) return;
    const file = e.target.files[0];
    const storageRef = ref(storage, `profiles/${userData.uid}_${file.name}`);
    await uploadBytes(storageRef, file);
    const photoURL = await getDownloadURL(storageRef);
    await updateDoc(doc(db, "users", userData.uid), { photoURL });
    await refreshUserData();
    setProfileUser((prev: any) => ({ ...prev, photoURL }));
  };

  const handleSendChatRequest = async () => {
    if (!userData) return;
    await addDoc(collection(db, "chatRequests"), {
      fromId: userData.uid,
      toId: id,
      status: "pending",
      createdAt: new Date(),
    });
    setChatStatus("pending");
  };

  const handleBlockUser = async () => {
    if (!userData || userData.role !== 'admin' && userData.role !== 'owner') return;
    await updateDoc(doc(db, "users", id as string), { isBlocked: !profileUser.isBlocked });
    setProfileUser((prev: any) => ({ ...prev, isBlocked: !prev.isBlocked }));
  };

  if (!profileUser) return <div className="text-center py-12">Loading profile...</div>;

  const isSelfOrOwner = userData && (userData.uid === id || userData.role === 'owner');

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center text-center space-y-4 shadow-sm relative">
        <div className="relative">
          <img src={profileUser.photoURL || "https://github.com/shadcn.png"} alt="" className="w-24 h-24 rounded-full object-cover border-2 border-primary" />
          {userData?.uid === id && (
            <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full cursor-pointer hover:opacity-90">
              <Camera className="w-4 h-4" />
              <input type="file" accept="image/*" onChange={handleProfilePicUpload} className="hidden" />
            </label>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{profileUser.name}</h2>
          <p className="text-xs text-muted-foreground">{profileUser.email}</p>
        </div>

        {isSelfOrOwner && (
          <div className="flex items-center gap-2 bg-secondary px-4 py-2 rounded-full text-sm font-medium">
            <Wallet className="w-4 h-4 text-primary" />
            <span>Wallet Balance: Rs. {profileUser.walletBalance || 0}</span>
          </div>
        )}

        {userData && userData.uid !== id && (
          <div className="flex gap-3">
            {chatDocId ? (
              <button
                onClick={() => router.push(`/chat/${chatDocId}`)}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" /> Open Chat
              </button>
            ) : chatStatus === 'pending' ? (
              <span className="bg-secondary px-4 py-2 rounded-lg text-sm text-muted-foreground">Chat Request Pending</span>
            ) : chatStatus === 'blocked' ? (
              <span className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg text-sm">Chat Blocked</span>
            ) : (
              <button
                onClick={handleSendChatRequest}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" /> Send Chat Request
              </button>
            )}

            {(userData.role === 'admin' || userData.role === 'owner') && (
              <button
                onClick={handleBlockUser}
                className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-1.5 hover:bg-destructive/20"
              >
                <UserX className="w-4 h-4" /> {profileUser.isBlocked ? "Unblock User" : "Block User"}
              </button>
            )}
          </div>
        )}
      </div>

      <h3 className="font-bold text-lg pt-4">User Posts</h3>
      <div className="space-y-4">
        {posts.map(post => (
          <PostCard key={post.id} post={post} />
        ))}
        {posts.length === 0 && <p className="text-center text-muted-foreground py-6">No posts found.</p>}
      </div>
    </div>
  );
}
