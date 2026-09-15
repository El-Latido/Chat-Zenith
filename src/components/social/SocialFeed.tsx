import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { PostObj, UserObj } from '../../types';
import { PostCard } from './PostCard';
import { CreatePostModal } from './CreatePostModal';
import { UserProfileModal } from './UserProfileModal';
import { StoryBar } from './StoryBar';
import { PlusSquare, Loader2 } from 'lucide-react';

interface SocialFeedProps {
  user: UserObj;
  onClose?: () => void;
}

export function SocialFeed({ user, onClose }: SocialFeedProps) {
  const [posts, setPosts] = useState<PostObj[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      const fetchedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostObj));
      setPosts(fetchedPosts);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <div className="flex-1 w-full bg-[#0a0f1c] flex flex-col relative h-full">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#0a0f1c] to-[#0a0f1c]/90 backdrop-blur-sm p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onClose && (
            <button onClick={onClose} className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
            </button>
          )}
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 font-[InstaFont,sans-serif]">
            LizGram
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors flex items-center gap-2"
          >
            <PlusSquare size={24} />
          </button>
          <img referrerPolicy="no-referrer" 
            onClick={() => setSelectedUser(user.username)}
            src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
            alt={user.username}
            className="w-8 h-8 rounded-full border border-white/10 cursor-pointer hover:opacity-80 transition-opacity"
            title="Mi Perfil"
          />
        </div>
      </div>

      {/* Stories Bar */}
      <StoryBar user={user} />

      {/* Feed Area */}
      <div className="flex-1 overflow-y-auto w-full p-4 flex flex-col items-center">
        <div className="w-full max-w-lg pb-20">
          {loading ? (
            <div className="flex flex-col items-center justify-center mt-20 text-white/80">
              <Loader2 size={40} className="animate-spin mb-4" />
              <p>Cargando publicaciones...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center mt-20 p-8 border border-white/10 rounded-2xl bg-white/5">
              <h3 className="text-xl font-bold text-white mb-2">¡Bienvenido a LizGram!</h3>
              <p className="text-gray-400 mb-6">Sé el primero en compartir un momento con la comunidad.</p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-white text-black text-black font-bold px-6 py-2 rounded-full hover:bg-yellow-400 transition-colors"
              >
                Crear Publicación
              </button>
            </div>
          ) : (
            posts.map(post => (
              <PostCard key={post.id} post={post} currentUser={user} onUserClick={(username) => setSelectedUser(username)} />
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedUser && (
        <UserProfileModal username={selectedUser} currentUser={user} onClose={() => setSelectedUser(null)} />
      )}
      {showCreateModal && (
        <CreatePostModal user={user} onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
