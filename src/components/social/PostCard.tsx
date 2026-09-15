import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Trash2 } from 'lucide-react';
import { db } from '../../firebaseConfig';
import { doc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, query, where, onSnapshot, orderBy, deleteDoc } from 'firebase/firestore';
import { UserObj, PostObj, CommentObj } from '../../types';

interface PostCardProps {
  post: PostObj;
  currentUser: UserObj;
}

export function PostCard({ post, currentUser, onUserClick }: PostCardProps & { onUserClick?: (username: string) => void }) {
  const [isLiked, setIsLiked] = useState(post.likes?.includes(currentUser.username) || false);
  const [likesCount, setLikesCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentObj[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    setIsLiked(post.likes?.includes(currentUser.username) || false);
    setLikesCount(post.likes?.length || 0);
  }, [post.likes, currentUser.username]);

  useEffect(() => {
    if (showComments) {
      const q = query(collection(db, 'comments'), where('postId', '==', post.id), orderBy('createdAt', 'asc'));
      const unsub = onSnapshot(q, (snapshot) => {
        setComments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommentObj)));
      });
      return () => unsub();
    }
  }, [showComments, post.id]);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    const postRef = doc(db, 'posts', post.id);
    
    // Optimistic UI
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);

    try {
      if (isLiked) {
        await updateDoc(postRef, { likes: arrayRemove(currentUser.username) });
      } else {
        await updateDoc(postRef, { likes: arrayUnion(currentUser.username) });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Revert optimistic
      setIsLiked(isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
    }
    setIsLiking(false);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const commentText = newComment.trim();
    setNewComment('');

    try {
      await addDoc(collection(db, 'comments'), {
        postId: post.id,
        username: currentUser.username,
        userAvatar: currentUser.profilePic || '',
        text: commentText,
        createdAt: Date.now()
      });
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm("¿Seguro que quieres eliminar esta publicación?")) {
      try {
        await deleteDoc(doc(db, 'posts', post.id));
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    }
  };

  const timeAgo = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Hace un momento';
    if (diff < 3600) return `Hace \${Math.floor(diff/60)}m`;
    if (diff < 86400) return `Hace \${Math.floor(diff/3600)}h`;
    return `Hace \${Math.floor(diff/86400)}d`;
  };

  return (
    <div className="bg-[#121B2A] border border-white/5 rounded-2xl mb-6 shadow-lg overflow-hidden">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img referrerPolicy="no-referrer" src={post.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=\${post.username}`} alt={post.username} className="w-10 h-10 rounded-full border border-[#D4AF37]/30 bg-black/50 object-cover cursor-pointer hover:opacity-80 transition-opacity" />
          <div>
            <h3 onClick={() => onUserClick && onUserClick(post.username)} className="text-white font-bold text-sm cursor-pointer hover:underline">{post.username}</h3>
            <span className="text-gray-400 text-xs">{timeAgo(post.createdAt)}</span>
          </div>
        </div>
        
        {currentUser.username === post.username && (
          <button onClick={handleDeletePost} className="text-gray-500 hover:text-red-500 p-2 transition-colors">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Post Media */}
      {post.mediaUrl && (
        <div className="w-full bg-black max-h-[600px] flex items-center justify-center overflow-hidden">
          {post.mediaType === 'video' ? (
            <video src={post.mediaUrl} controls className="w-full max-h-[600px] object-contain" />
          ) : (
            <img referrerPolicy="no-referrer" src={post.mediaUrl} alt="Post media" className="w-full max-h-[600px] object-contain" />
          )}
        </div>
      )}

      {/* Post Actions */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-3">
          <button onClick={handleLike} className={`flex items-center gap-1.5 transition-colors \${isLiked ? 'text-red-500' : 'text-white hover:text-red-400'}`}>
            <Heart size={24} className={isLiked ? 'fill-current' : ''} />
          </button>
          <button onClick={() => setShowComments(!showComments)} className="text-white hover:text-gray-300 transition-colors">
            <MessageCircle size={24} />
          </button>
          <button className="text-white hover:text-gray-300 transition-colors ml-auto">
            <Share2 size={20} />
          </button>
        </div>

        <div className="text-white font-bold text-sm mb-2">{likesCount} me gusta</div>

        {/* Post Text */}
        {post.text && (
          <div className="text-sm text-gray-200 mb-2">
            <span className="font-bold text-white mr-2">{post.username}</span>
            <span className="whitespace-pre-wrap">{post.text}</span>
          </div>
        )}

        {/* Comments Section */}
        {showComments ? (
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="space-y-3 mb-4 max-h-40 overflow-y-auto scrollbar-thin">
              {comments.map(c => (
                <div key={c.id} className="text-sm flex gap-2">
                  <span className="font-bold text-white shrink-0">{c.username}</span>
                  <span className="text-gray-300 break-words">{c.text}</span>
                </div>
              ))}
              {comments.length === 0 && <p className="text-gray-500 text-xs italic">No hay comentarios aún.</p>}
            </div>
            <form onSubmit={handlePostComment} className="flex gap-2">
              <input 
                type="text" 
                value={newComment} 
                onChange={e => setNewComment(e.target.value)}
                placeholder="Añade un comentario..."
                className="flex-1 bg-black/30 border border-white/10 rounded-full px-4 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50"
              />
              <button disabled={!newComment.trim()} type="submit" className="text-[#D4AF37] font-bold text-sm px-2 disabled:opacity-50">Publicar</button>
            </form>
          </div>
        ) : (
          <button onClick={() => setShowComments(true)} className="text-gray-400 text-sm hover:text-gray-300">
            Ver los comentarios
          </button>
        )}
      </div>
    </div>
  );
}
