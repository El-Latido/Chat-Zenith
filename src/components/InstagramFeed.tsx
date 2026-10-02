import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Music, Image as ImageIcon, X } from 'lucide-react';
import { socket } from '../socket';

interface Post {
  id: string;
  author: string;
  authorAvatar: string;
  authorFrame?: string;
  content: string;
  media?: { type: 'image' | 'video'; url: string }[];
  likes: string[];
  comments: { user: string; text: string; time: number }[];
  songUrl?: string;
  createdAt: number;
}

interface InstagramFeedProps {
  currentUser: { username: string; avatar: string; frame?: string };
  onClose?: () => void;
}

export function InstagramFeed({ currentUser, onClose }: InstagramFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMedia, setNewPostMedia] = useState<{ type: 'image' | 'video'; url: string }[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [mediaInput, setMediaInput] = useState('');
  const [songInput, setSongInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    socket.emit('feed_load_posts');
    
    const handleFeedPosts = (data: Post[]) => {
      if (Array.isArray(data)) {
        setPosts([...data].sort((a, b) => b.createdAt - a.createdAt));
      }
    };

    const handleNewPost = (post: Post) => {
      setPosts(prev => [post, ...prev.filter(p => p.id !== post.id)]);
    };

    const handlePostUpdated = (post: Post) => {
      setPosts(prev => prev.map(p => p.id === post.id ? post : p));
    };

    socket.on('feed_posts', handleFeedPosts);
    socket.on('feed_new_post', handleNewPost);
    socket.on('feed_post_updated', handlePostUpdated);

    return () => {
      socket.off('feed_posts', handleFeedPosts);
      socket.off('feed_new_post', handleNewPost);
      socket.off('feed_post_updated', handlePostUpdated);
    };
  }, []);

  const handleCreatePost = () => {
    if (!newPostContent.trim() && newPostMedia.length === 0) return;
    
    const post: Post = {
      id: `post_${Date.now()}_${currentUser.username}`,
      author: currentUser.username,
      authorAvatar: currentUser.avatar,
      authorFrame: currentUser.frame,
      content: newPostContent,
      media: newPostMedia,
      likes: [],
      comments: [],
      songUrl: songInput || undefined,
      createdAt: Date.now(),
    };

    socket.emit('feed_create_post', post);
    setNewPostContent('');
    setNewPostMedia([]);
    setSongInput('');
    setShowCreateModal(false);
  };

  const handleLike = (postId: string) => {
    socket.emit('feed_toggle_like', { postId, user: currentUser.username });
  };

  const handleComment = (postId: string) => {
    if (!commentText.trim()) return;
    socket.emit('feed_add_comment', {
      postId,
      user: currentUser.username,
      text: commentText,
    });
    setCommentText('');
    setCommentingOn(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      const type = file.type.startsWith('video') ? 'video' : 'image';
      setNewPostMedia(prev => [...prev, { type, url }]);
    };
    reader.readAsDataURL(file);
  };

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return 'ahora';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md rounded-2xl p-4 border border-purple-500/30">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          📸 Feed de ChatLiz
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 transition shadow-lg cursor-pointer"
          >
            <span className="text-xl">+</span> Publicar
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 transition-colors cursor-pointer"
              title="Cerrar Feed"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Crear Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-purple-500/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white text-xl font-bold">Nueva Publicación</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={24} />
              </button>
            </div>
            
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="¿Qué estás pensando? ✨"
              className="w-full bg-gray-800 text-white rounded-xl p-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <div className="mt-3 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mediaInput}
                  onChange={(e) => setMediaInput(e.target.value)}
                  placeholder="URL de imagen/video (opcional)"
                  className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={() => {
                    if (mediaInput) {
                      setNewPostMedia(prev => [...prev, { type: mediaInput.match(/\.(mp4|webm|mov)$/i) ? 'video' : 'image', url: mediaInput }]);
                      setMediaInput('');
                    }
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 rounded-lg cursor-pointer"
                >
                  <ImageIcon size={18} />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-pink-600 hover:bg-pink-700 text-white px-3 rounded-lg cursor-pointer"
                  title="Subir archivo"
                >
                  📁
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <input
                type="text"
                value={songInput}
                onChange={(e) => setSongInput(e.target.value)}
                placeholder="🎵 URL de canción (YouTube/Spotify)"
                className="w-full bg-gray-800 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {newPostMedia.length > 0 && (
              <div className="mt-3 flex gap-2 flex-wrap">
                {newPostMedia.map((m, i) => (
                  <div key={i} className="relative">
                    {m.type === 'image' ? (
                      <img src={m.url} className="w-20 h-20 object-cover rounded-lg" alt="preview" />
                    ) : (
                      <video src={m.url} className="w-20 h-20 object-cover rounded-lg" />
                    )}
                    <button
                      onClick={() => setNewPostMedia(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={handleCreatePost}
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold transition shadow-lg cursor-pointer"
            >
              Publicar ✨
            </button>
          </div>
        </div>
      )}

      {/* Lista de Posts */}
      {posts.map(post => (
        <article key={post.id} className="bg-gray-900/80 backdrop-blur-md border border-purple-500/20 rounded-2xl overflow-hidden shadow-xl">
          {/* Header del post */}
          <div className="flex items-center gap-3 p-4">
            <ProfileAvatar
              username={post.author}
              avatar={post.authorAvatar}
              frame={post.authorFrame}
              size="md"
            />
            <div className="flex-1">
              <div className="text-white font-bold">{post.author}</div>
              <div className="text-gray-400 text-xs">{timeAgo(post.createdAt)}</div>
            </div>
            <button className="text-gray-400 hover:text-white cursor-pointer">
              <MoreHorizontal size={20} />
            </button>
          </div>

          {/* Contenido */}
          {post.content && (
            <p className="px-4 pb-3 text-white whitespace-pre-wrap">{post.content}</p>
          )}

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <div className="space-y-1">
              {post.media.map((m, i) => (
                m.type === 'image' ? (
                  <img key={i} src={m.url} className="w-full max-h-[600px] object-cover" alt="post-media" />
                ) : (
                  <video key={i} src={m.url} controls className="w-full max-h-[600px]" />
                )
              ))}
            </div>
          )}

          {/* Canción */}
          {post.songUrl && (
            <div className="px-4 py-2 flex items-center gap-2 bg-purple-900/30">
              <Music size={16} className="text-purple-400" />
              <span className="text-purple-300 text-sm">🎵 Reproduciendo canción: {post.songUrl}</span>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-4 p-4 border-t border-gray-800">
            <button
              onClick={() => handleLike(post.id)}
              className={`flex items-center gap-2 transition cursor-pointer ${
                post.likes.includes(currentUser.username) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <Heart size={22} fill={post.likes.includes(currentUser.username) ? 'currentColor' : 'none'} />
              <span className="font-bold">{post.likes.length}</span>
            </button>
            <button
              onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition cursor-pointer"
            >
              <MessageCircle size={22} />
              <span className="font-bold">{post.comments.length}</span>
            </button>
            <button className="flex items-center gap-2 text-gray-400 hover:text-white transition ml-auto cursor-pointer">
              <Send size={20} />
            </button>
            <button className="text-gray-400 hover:text-white transition cursor-pointer">
              <Bookmark size={20} />
            </button>
          </div>

          {/* Comentarios */}
          {post.comments.length > 0 && (
            <div className="px-4 pb-2 space-y-2">
              {post.comments.slice(-3).map((c, i) => (
                <div key={i} className="text-sm">
                  <span className="text-white font-bold">{c.user}</span>{' '}
                  <span className="text-gray-300">{c.text}</span>
                </div>
              ))}
              {post.comments.length > 3 && (
                <button className="text-gray-500 text-sm hover:underline cursor-pointer">
                  Ver los {post.comments.length - 3} comentarios anteriores
                </button>
              )}
            </div>
          )}

          {/* Input de comentario */}
          {commentingOn === post.id && (
            <div className="px-4 pb-4 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Agrega un comentario..."
                className="flex-1 bg-gray-800 text-white rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
              />
              <button
                onClick={() => handleComment(post.id)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-full font-bold cursor-pointer"
              >
                Publicar
              </button>
            </div>
          )}
        </article>
      ))}

      {posts.length === 0 && (
        <div className="text-center text-gray-400 py-12">
          <div className="text-6xl mb-4">📸</div>
          <p className="text-lg">Aún no hay publicaciones. ¡Sé el primero!</p>
        </div>
      )}
    </div>
  );
}

// Componente auxiliar de avatar con marco
function ProfileAvatar({ username, avatar, frame, size = 'md' }: {
  username: string;
  avatar: string;
  frame?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
  };

  return (
    <div className="relative">
      {avatar ? (
        <img src={avatar} className={`${sizeClasses[size]} rounded-full object-cover border-2 border-purple-500`} alt={username} />
      ) : (
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold border-2 border-purple-500`}>
          {username[0]?.toUpperCase()}
        </div>
      )}
      {frame === 'fire' && (
        <div className="absolute inset-0 pointer-events-none animate-pulse">
          <div className="absolute inset-0 rounded-full border-4 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.8)]" />
        </div>
      )}
      {frame === 'galaxy' && (
        <div className="absolute inset-0 pointer-events-none animate-spin-slow">
          <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-70" style={{ animation: 'spin 3s linear infinite' }} />
        </div>
      )}
      {frame === 'neon' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 rounded-full border-4 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.9),0_0_30px_rgba(34,211,238,0.5)] animate-pulse" />
        </div>
      )}
    </div>
  );
}
