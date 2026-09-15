import React, { useState, useEffect } from 'react';
import { X, Users, Grid } from 'lucide-react';
import { db } from '../../firebaseConfig';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { UserObj, PostObj } from '../../types';
import { PostCard } from './PostCard';

interface UserProfileModalProps {
  username: string;
  currentUser: UserObj;
  onClose: () => void;
}

export function UserProfileModal({ username, currentUser, onClose }: UserProfileModalProps) {
  const [profileUser, setProfileUser] = useState<UserObj | null>(null);
  const [userPosts, setUserPosts] = useState<PostObj[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followers, setFollowers] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>([]);

  useEffect(() => {
    // Escuchar el perfil del usuario
    const qUser = query(collection(db, 'users'), where('username', '==', username));
    const unsubUser = onSnapshot(qUser, (snapshot) => {
      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data() as UserObj;
        setProfileUser(userData);
        // Suponemos que los campos followers y following se guardan en el doc del usuario (pueden venir como array de strings)
        // Como UserObj no los tiene originalmente, los forzamos aquí a un array
        const folls = (userData as any).followers || [];
        setFollowers(folls);
        setIsFollowing(folls.includes(currentUser.username));
        setFollowing((userData as any).following || []);
      }
    });

    // Escuchar los posts del usuario
    const qPosts = query(collection(db, 'posts'), where('username', '==', username));
    const unsubPosts = onSnapshot(qPosts, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PostObj));
      setUserPosts(posts.sort((a, b) => b.createdAt - a.createdAt)); // Orden descendente manual
      setLoading(false);
    });

    return () => {
      unsubUser();
      unsubPosts();
    };
  }, [username, currentUser.username]);

  const handleFollowToggle = async () => {
    if (!profileUser) return;
    setIsFollowing(!isFollowing);

    try {
      // 1. Obtener la referencia del usuario del perfil (target)
      const qProfile = query(collection(db, 'users'), where('username', '==', username));
      const profileSnap = await getDocs(qProfile);
      
      // 2. Obtener la referencia del usuario actual (current)
      const qCurrent = query(collection(db, 'users'), where('username', '==', currentUser.username));
      const currentSnap = await getDocs(qCurrent);

      if (!profileSnap.empty && !currentSnap.empty) {
        const profileRef = doc(db, 'users', profileSnap.docs[0].id);
        const currentRef = doc(db, 'users', currentSnap.docs[0].id);

        if (isFollowing) {
          // Dejar de seguir
          await updateDoc(profileRef, { followers: arrayRemove(currentUser.username) });
          await updateDoc(currentRef, { following: arrayRemove(username) });
        } else {
          // Seguir
          await updateDoc(profileRef, { followers: arrayUnion(currentUser.username) });
          await updateDoc(currentRef, { following: arrayUnion(username) });
        }
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
      setIsFollowing(isFollowing); // Revertir en caso de error
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md">
        <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[150] flex flex-col bg-[#0a0f1c] animate-in slide-in-from-bottom">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#0a0f1c] to-[#0a0f1c]/90 backdrop-blur-sm p-4 border-b border-white/5 flex items-center gap-4">
        <button onClick={onClose} className="p-2 text-[#D4AF37] hover:bg-white/10 rounded-full transition-colors">
          <X size={24} />
        </button>
        <h1 className="text-xl font-bold text-white">{username}</h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-lg mx-auto p-4">
          
          {/* Profile Header */}
          <div className="flex items-center justify-between mb-8">
            <img referrerPolicy="no-referrer" 
              src={profileUser?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=\${username}`} 
              alt={username} 
              className="w-24 h-24 rounded-full border-2 border-[#D4AF37]/50 bg-black/50 object-cover" 
            />
            <div className="flex flex-1 justify-around text-center ml-4">
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl">{userPosts.length}</span>
                <span className="text-gray-400 text-xs">Publicaciones</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl">{followers.length}</span>
                <span className="text-gray-400 text-xs">Seguidores</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-xl">{following.length}</span>
                <span className="text-gray-400 text-xs">Siguiendo</span>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-white font-bold mb-1">{profileUser?.username}</h2>
            <p className="text-sm text-gray-300">{profileUser?.statusMessage || 'Sin descripción.'}</p>
          </div>

          {/* Acciones */}
          {username !== currentUser.username && (
            <div className="flex gap-2 mb-8">
              <button 
                onClick={handleFollowToggle}
                className={`flex-1 font-bold py-2 rounded-xl transition-colors \${isFollowing ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-[#D4AF37] text-black hover:bg-yellow-400'}`}
              >
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </button>
            </div>
          )}

          <div className="border-t border-white/10 mb-4 flex justify-center pt-2">
            <Grid className="text-white" size={24} />
          </div>

          {/* User Posts */}
          <div className="space-y-6 pb-20">
            {userPosts.map(post => (
              <PostCard key={post.id} post={post} currentUser={currentUser} />
            ))}
            {userPosts.length === 0 && (
              <div className="text-center text-gray-500 py-10">
                Aún no hay publicaciones.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
