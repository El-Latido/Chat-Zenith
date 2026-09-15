import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../../firebaseConfig';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { UserObj, StoryObj } from '../../types';
import { Plus, X, UploadCloud, ChevronLeft, ChevronRight } from 'lucide-react';

interface StoryBarProps {
  user: UserObj;
}

export function StoryBar({ user }: StoryBarProps) {
  const [stories, setStories] = useState<StoryObj[]>([]);
  const [groupedStories, setGroupedStories] = useState<Record<string, StoryObj[]>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeStoryUser, setActiveStoryUser] = useState<string | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);

  useEffect(() => {
    // Fetch stories from the last 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const q = query(collection(db, 'stories'), where('createdAt', '>', oneDayAgo));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as StoryObj));
      setStories(fetched);
      
      // Group by username
      const grouped: Record<string, StoryObj[]> = {};
      fetched.forEach(s => {
        if (!grouped[s.username]) grouped[s.username] = [];
        grouped[s.username].push(s);
      });
      // Sort stories within each group by time
      Object.keys(grouped).forEach(k => {
        grouped[k].sort((a, b) => a.createdAt - b.createdAt);
      });
      setGroupedStories(grouped);
    });

    return () => unsub();
  }, []);

  const handleUploadStory = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const isVideo = file.type.startsWith('video/');
    
    setIsUploading(true);
    const storageRef = ref(storage, `stories/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      },
      (error) => {
        console.error("Upload error:", error);
        setIsUploading(false);
      },
      async () => {
        const mediaUrl = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, 'stories'), {
          userId: user.uid || user.username,
          username: user.username,
          userAvatar: user.profilePic || '',
          mediaUrl,
          mediaType: isVideo ? 'video' : 'image',
          createdAt: Date.now()
        });
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    );
  };

  const openStory = (username: string) => {
    setActiveStoryUser(username);
    setCurrentStoryIndex(0);
  };

  const nextStory = () => {
    if (!activeStoryUser) return;
    const userStories = groupedStories[activeStoryUser];
    if (currentStoryIndex < userStories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      setActiveStoryUser(null);
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    }
  };

  return (
    <>
      <div className="w-full border-b border-white/5 py-4 overflow-x-auto scrollbar-none pl-4">
        <div className="flex gap-4">
          {/* Add Story Button */}
          <div className="flex flex-col items-center gap-1 shrink-0 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-[#D4AF37] p-0.5 flex items-center justify-center bg-[#121B2A] relative">
              {isUploading ? (
                <div className="text-[#D4AF37] font-bold text-xs">{Math.round(uploadProgress)}%</div>
              ) : (
                <>
                  <img referrerPolicy="no-referrer" src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="You" className="w-full h-full rounded-full object-cover opacity-60" />
                  <Plus className="absolute text-[#D4AF37]" size={24} />
                </>
              )}
            </div>
            <span className="text-xs text-gray-400 font-medium">Tu historia</span>
            <input type="file" ref={fileInputRef} onChange={handleUploadStory} accept="image/*,video/*" className="hidden" />
          </div>

          {/* Stories List */}
          {Object.keys(groupedStories).map(username => {
            const userStories = groupedStories[username];
            const latestStory = userStories[userStories.length - 1];
            return (
              <div key={username} className="flex flex-col items-center gap-1 shrink-0 cursor-pointer" onClick={() => openStory(username)}>
                <div className="w-16 h-16 rounded-full border-2 border-[#D4AF37] p-0.5 relative">
                  <img referrerPolicy="no-referrer" src={latestStory.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} alt={username} className="w-full h-full rounded-full object-cover bg-black/50" />
                </div>
                <span className="text-xs text-white font-medium max-w-[64px] truncate">{username}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {activeStoryUser && groupedStories[activeStoryUser] && (
        <div className="fixed inset-0 z-[200] bg-black flex flex-col animate-in fade-in">
          {/* Progress Bars */}
          <div className="absolute top-4 left-0 w-full px-4 flex gap-1 z-50">
            {groupedStories[activeStoryUser].map((s, i) => (
              <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div className={`h-full bg-white transition-all ${i === currentStoryIndex ? 'w-full' : i < currentStoryIndex ? 'w-full' : 'w-0'}`} />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-8 left-0 w-full px-4 flex items-center justify-between z-50">
            <div className="flex items-center gap-2">
              <img referrerPolicy="no-referrer" src={groupedStories[activeStoryUser][0].userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeStoryUser}`} className="w-8 h-8 rounded-full border border-white/50 object-cover" alt={activeStoryUser} />
              <span className="text-white font-bold text-sm drop-shadow-md">{activeStoryUser}</span>
            </div>
            <button onClick={() => setActiveStoryUser(null)} className="text-white hover:text-gray-300">
              <X size={28} />
            </button>
          </div>

          {/* Media Content */}
          <div className="flex-1 w-full relative flex items-center justify-center bg-[#0a0f1c]">
            {groupedStories[activeStoryUser][currentStoryIndex].mediaType === 'video' ? (
              <video 
                src={groupedStories[activeStoryUser][currentStoryIndex].mediaUrl} 
                autoPlay 
                onEnded={nextStory}
                className="w-full h-full object-contain" 
                playsInline
              />
            ) : (
              <img referrerPolicy="no-referrer" 
                src={groupedStories[activeStoryUser][currentStoryIndex].mediaUrl} 
                className="w-full h-full object-contain" 
                alt="Story"
              />
            )}

            {/* Navigation Areas */}
            <div className="absolute inset-y-0 left-0 w-1/3 cursor-pointer" onClick={prevStory} />
            <div className="absolute inset-y-0 right-0 w-1/3 cursor-pointer" onClick={nextStory} />
          </div>
        </div>
      )}
    </>
  );
}
