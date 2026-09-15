import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Video, UploadCloud, XCircle } from 'lucide-react';
import { db, storage } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { UserObj } from '../../types';

interface CreatePostModalProps {
  onClose: () => void;
  user: UserObj;
}

export function CreatePostModal({ onClose, user }: CreatePostModalProps) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
      setFileType(selectedFile.type.startsWith('video/') ? 'video' : 'image');
    }
  };

  const clearFile = () => {
    setFile(null);
    setFilePreview(null);
    setFileType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePost = async () => {
    if (!text.trim() && !file) return;

    setIsUploading(true);
    let mediaUrl = '';
    let uploadedType = fileType;

    if (file) {
      const storageRef = ref(storage, `posts/\${Date.now()}_\${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => reject(error),
          async () => {
            mediaUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve();
          }
        );
      });
    }

    try {
      await addDoc(collection(db, 'posts'), {
        userId: user.uid || user.username,
        username: user.username,
        userAvatar: user.profilePic || '',
        text: text.trim(),
        mediaUrl,
        mediaType: mediaUrl ? uploadedType : null,
        likes: [],
        createdAt: Date.now()
      });
      setIsUploading(false);
      onClose();
    } catch (error) {
      console.error("Error creating post:", error);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#121B2A] border border-[#D4AF37]/30 rounded-3xl w-full max-w-lg shadow-[0_0_40px_rgba(212,175,55,0.15)] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/20">
          <h2 className="text-[#E8D9B0] font-bold text-xl">Crear Publicación</h2>
          <button onClick={onClose} disabled={isUploading} className="text-[#D4AF37] hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <img referrerPolicy="no-referrer" src={user.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=\${user.username}`} alt={user.username} className="w-12 h-12 rounded-full border-2 border-[#D4AF37]/50 object-cover" />
            <span className="text-white font-bold">{user.username}</span>
          </div>

          <textarea
            placeholder="¿Qué estás pensando?"
            className="w-full bg-transparent text-white placeholder-gray-500 resize-none outline-none text-lg min-h-[100px]"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isUploading}
          />

          {filePreview && (
            <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/50">
              <button onClick={clearFile} disabled={isUploading} className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1 hover:bg-red-500 transition-colors z-10">
                <XCircle size={20} />
              </button>
              {fileType === 'image' ? (
                <img referrerPolicy="no-referrer" src={filePreview} alt="Preview" className="w-full max-h-[300px] object-contain" />
              ) : (
                <video src={filePreview} controls className="w-full max-h-[300px]" />
              )}
            </div>
          )}

          {isUploading && (
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-gradient-to-r from-[#D4AF37] to-yellow-300 transition-all duration-300" style={{ width: `\${uploadProgress}%` }}></div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,video/*" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="p-2 text-[#D4AF37] hover:bg-[#D4AF37]/20 rounded-full transition-colors tooltip" title="Subir foto o video">
              <ImageIcon size={24} />
            </button>
          </div>
          <button 
            onClick={handlePost} 
            disabled={isUploading || (!text.trim() && !file)}
            className="bg-[#D4AF37] text-black font-bold px-6 py-2 rounded-full hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isUploading ? 'Subiendo...' : 'Publicar'}
            {!isUploading && <UploadCloud size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
