 import { TranslatedText } from './components/TranslatedText';
 import { filterOffensiveText } from './filter';
import React, {
  useState,
  useEffect,
  useRef,
  ErrorInfo,
  Component,
} from "react";
import { Plus, Webcam, EyeOff, Send, User, MessageCircle, Settings, Bot, Image as ImageIcon, FileIcon, Mic, StopCircle, Trash2, Menu, Layers, X, Hash, MessageSquare, PlaySquare, LogOut, Search, Gamepad2, Music, Youtube, Paperclip, Smile, Globe, Box, Palette, Users, UserPlus, UserMinus, UserCheck, DollarSign, ShieldAlert, Shield, AlertTriangle, AlertCircle, Bell, PhoneCall, Heart, Home, Play, Pause, Coins , Star , Calendar, Gift, RotateCcw, Repeat, List, Volume2, Clock, Sparkles, Key, Sliders } from "lucide-react";
import { collection,
  onSnapshot,
  query,
  doc,
  orderBy,
  limitToLast,
  addDoc,
  serverTimestamp,
  where,
  updateDoc,
  deleteDoc,
  arrayUnion,
  getDoc,
  getDocs,
  setDoc
} from "firebase/firestore";
import { ChatCustomizerModal, ChatConfig } from "./components/ChatCustomizerModal";

import { signInAnonymously, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { db, auth } from "./firebaseConfig";
import { socket } from "./socket";
import { UserObj, MessageObj } from "./types";
import { Login } from "./components/Login";
import { FirstTimeSetupModal } from "./components/FirstTimeSetupModal";
import { RecoveryModal } from "./components/RecoveryModal";
import { ProfileConfigModal } from "./components/ProfileConfigModal";
import { AdminConfigAiModal } from "./components/AdminConfigAiModal";
import { AdminShadersModal } from "./components/AdminShadersModal";
import { GamesMenuModal } from "./components/GamesMenuModal";
import { EmojiGifPicker } from "./components/EmojiGifPicker";
import { StoreModal } from "./components/StoreModal";
import { CallModal } from "./components/CallModal";
import { FriendsWebcam } from "./components/FriendsWebcam";
import { CustomRooms } from "./components/CustomRooms";
import { ActiveCallModal } from "./components/ActiveCallModal";
import { Avatar } from "./components/Avatar";
import { OutgoingCallModal } from "./components/OutgoingCallModal";
import { ChessGameModal } from "./components/ChessGameModal";
import { ChessBotModal } from "./components/ChessBotModal";
import { PremiumAudioPlayer } from "./components/PremiumAudioPlayer";
import { PremiumAudioVisualizer } from "./components/PremiumAudioVisualizer";
import { InlineRadio } from "./components/InlineRadio";
import { GlobalRadioPlayer } from "./components/GlobalRadioPlayer";
import { RadioHistoryModal, RadioHistorySong } from "./components/RadioHistoryModal";
import { SyncToAxisModal } from "./components/SyncToAxisModal";
import { SongRequestModal } from "./components/SongRequestModal";
import { DjControlPanelModal } from "./components/DjControlPanelModal";
import { AiSelectorModal } from "./components/AiSelectorModal";
import { RoomCleanerModal } from "./components/RoomCleanerModal";
import { SocialFeed } from "./components/social/SocialFeed";
import { VoiceRecorderPreview } from "./components/VoiceRecorderPreview";
import { VoiceModulatorPanel } from "./components/VoiceModulatorPanel";
import {
  RealtimeModulationConfig,
  DEFAULT_MODULATION_CONFIG,
  getGlobalVoiceModulator,
} from "./utils/audioContextModulator";
import { NotificationBellModal, NotificationItem } from "./components/NotificationBellModal";
import { FriendsModal, FriendRequest, FriendUser } from "./components/FriendsModal";
import { MailboxModal, MailboxItem } from "./components/MailboxModal";
import { AdminPanelModal } from "./components/AdminPanelModal";
import { LegalAndPrivacyModal, LegalTab } from "./components/LegalAndPrivacyModal";
import { WelcomeLanding } from "./components/WelcomeLanding";
import { UniversalBackground, parseBackgroundMedia } from "./components/UniversalBackground";
import { BackgroundSelectorModal } from "./components/BackgroundSelectorModal";

const DECORATIONS = [
  // Ajedrez (Themes & Efectos)
  {
    id: "bubble_soap",
    type: "texture",
    category: "efectos",
    price: 300,
    url: "soap",
  },
  {
    id: "bubble_animals",
    type: "texture",
    category: "efectos",
    price: 450,
    url: "animals",
  },
  {
    id: "chess_theme_wood",
    type: "basic",
    category: "ajedrez",
    price: 100,
    url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=wood",
  },
  {
    id: "chess_theme_neon",
    type: "intermediate",
    category: "ajedrez",
    price: 500,
    url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=neon",
  },
  {
    id: "chess_theme_gold",
    type: "premium",
    category: "ajedrez",
    price: 1500,
    url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=gold",
  },
  // Marcos
  {
    id: "dec_b1",
    type: "basic",
    category: "marcos",
    price: 500,
    url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=flower1",
  },
  {
    id: "dec_b2",
    type: "basic",
    category: "marcos",
    price: 500,
    url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=star",
  },
  {
    id: "dec_i1",
    type: "intermediate",
    category: "marcos",
    price: 1200,
    url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=cat",
  },
  {
    id: "dec_p1",
    type: "premium",
    category: "marcos",
    price: 2500,
    url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=crown",
  },
  // Emblemas
  {
    id: "dec_b3",
    type: "basic",
    category: "emblemas",
    price: 500,
    url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=heart",
  },
  {
    id: "dec_i2",
    type: "intermediate",
    category: "emblemas",
    price: 1200,
    url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=dog",
  },
  {
    id: "dec_p2",
    type: "premium",
    category: "emblemas",
    price: 2500,
    url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=diamond",
  },
  // Mascotas
  {
    id: "dec_b4",
    type: "basic",
    category: "mascotas",
    price: 500,
    url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=leaf",
  },
  {
    id: "dec_i3",
    type: "intermediate",
    category: "mascotas",
    price: 1200,
    url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=rabbit",
  },
  {
    id: "dec_i4",
    type: "intermediate",
    category: "mascotas",
    price: 1200,
    url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=bird",
  },
  {
    id: "dec_p3",
    type: "premium",
    category: "mascotas",
    price: 2500,
    url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=dragon",
  },
  // Efectos
  {
    id: "dec_b5",
    type: "basic",
    category: "efectos",
    price: 500,
    url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=cloud",
  },
  {
    id: "dec_i5",
    type: "intermediate",
    category: "efectos",
    price: 1200,
    url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=fish",
  },
  {
    id: "dec_p4",
    type: "premium",
    category: "efectos",
    price: 2500,
    url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=unicorn",
  },
];

let currentVersion: string | null = null;

let versionController: AbortController | null = null;
function checkVersion() {
  if (versionController) {
    versionController.abort();
  }
  versionController = new AbortController();
  fetch("/version", { signal: versionController.signal })
    .then((response) => response.json())
    .then((data) => {
      if (currentVersion === null) {
        currentVersion = data.version;
      } else if (data.version !== currentVersion) {
        // Se detectó una nueva versión, recargar solo si no hay mensaje en progreso
        console.log("Nueva actualización detectada. Recargando...");
        window.location.reload();
      }
    })
    .catch((err) => {
      if (err.name === "AbortError") return;
      console.error("Error verificando versión:", err);
    });
}

// Verificar cada 15 segundos
setInterval(checkVersion, 15000);

export const notifyOwner = async (
  profileUid: string,
  actionType: string,
  visitorName: string,
  extraData?: any,
) => {
  console.log("Intentando enviar notificación a:", profileUid);
  try {
    // using imports from top of file
    const docRef = await addDoc(collection(db, "notifications"), {
      recipientUid: profileUid,
      senderUid: visitorName,
      senderName: visitorName,
      type: actionType,
      frData: extraData?.frData || null,
      message: `Has recibido un ${actionType} de ${visitorName}`,
      isRead: false,
      createdAt: serverTimestamp(),
    });
    console.log("Notificación creada con ID:", docRef.id);
  } catch (error) {
    console.error("Error al escribir en Firestore:", error);
  }
};

export const sendNotification = async (
  recipientUid: string,
  type: string,
  senderData: any,
) => {
  try {
    // using imports from top of file
    await addDoc(collection(db, "notifications"), {
      recipientUid: recipientUid,
      senderUid: senderData.uid,
      senderName: senderData.displayName || "Usuario",
      type: type,
      isRead: false,
      frData: senderData.frData || null,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error al enviar notificación:", error);
  }
};

const EMOTICONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];
function MainApp() {
  const playReactionSound = (emoji: string) => {
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      const now = audioCtx.currentTime;
      if (emoji === "❤️") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (emoji === "😂") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(600, now + 0.05);
        osc.frequency.setValueAtTime(800, now + 0.1);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (emoji === "😮") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.2);
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (emoji === "😢") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.3);
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (emoji === "😡") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (emoji === "👍") {
        osc.type = "square";
        osc.frequency.setValueAtTime(400, now);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02);
        gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const playNotifySound = () => {
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      oscillator.frequency.exponentialRampToValueAtTime(
        1760,
        audioCtx.currentTime + 0.1,
      ); // A6
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + 0.2,
      );
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.2);
    } catch (e) {
      console.error("Sound error", e);
    }
  };

  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isFirstTimeSetup, setIsFirstTimeSetup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<
    UserObj & { password?: string; securityEmail?: string }
  >({ username: "", password: "", countryLanguage: "es", securityEmail: "" });
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [bgModalMode, setBgModalMode] = useState<'global' | 'personal'>('global');
  const [isAiSelectorOpen, setIsAiSelectorOpen] = useState(false);
  const [selectedUserModal, setSelectedUserModal] = useState<UserObj | null>(
    null,
  );
  const [adminConfigAiOpen, setAdminConfigAiOpen] = useState(false);
  const [adminShadersOpen, setAdminShadersOpen] = useState(false);
  const [globalShaders, setGlobalShaders] = useState<string[]>([]);
  const [previewShaders, setPreviewShaders] = useState<string[] | null>(null);
  const [currentAdminAi, setCurrentAdminAi] = useState("Elizabeth");
  const [aiProfileForm, setAiProfileForm] = useState<{
    profilePic: string;
    statusMessage: string;
    systemInstruction: string;
    username?: string;
    bubbleColor?: string;
    bubbleBorder?: string;
    bubbleShape?: string;
    bubbleTexture?: string;
  }>({
    profilePic: "",
    statusMessage: "Administradora",
    systemInstruction: "",
    bubbleColor: "rgba(15, 17, 26, 0.9)", bubbleBorder: "border-[#D4AF37]", bubbleShape: "rounded-2xl", bubbleTexture: "none"});
  const [outOfTokensAi, setOutOfTokensAi] = useState<string | null>(null);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);
  const [isBanned, setIsBanned] = useState(false);
  const [isBannedListOpen, setIsBannedListOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<string | null>(null);
  const [expandedAvatar, setExpandedAvatar] = useState<string | null>(null);
  const [isReportsListOpen, setIsReportsListOpen] = useState(false);
  const [isFriendReqOpen, setIsFriendReqOpen] = useState(false);
  const [isMonetizationOpen, setIsMonetizationOpen] = useState(false);
  const [monetizationStats, setMonetizationStats] = useState({ adViews: 0, revenuePending: 0, lifetimeRevenue: 0 });
  const [reportsList, setReportsList] = useState<any[]>([]);
  const [bannedList, setBannedList] = useState<any[]>([]);

  const [incomingCall, setIncomingCall] = useState<{
    username: string;
    profilePic: string;
  } | null>(null);
  const [outgoingCall, setOutgoingCall] = useState<{
    username: string;
    profilePic: string;
  } | null>(null);
  const [activeCall, setActiveCall] = useState<{
    partner: { username: string; profilePic: string };
    isInitiator: boolean;
  } | null>(null);
  const [activeChat, setActiveChat] = useState("global");
  const [showChatConfig, setShowChatConfig] = useState(false);
  const [chatConfig, setChatConfig] = useState<ChatConfig | null>(null);
  const [globalChatConfig, setGlobalChatConfig] = useState<ChatConfig | null>(null);
  const [neonColor, setNeonColor] = useState(() => localStorage.getItem("chatliz_neon_color") || "#00f3ff");
  const [chatBgImage, setChatBgImage] = useState(() => localStorage.getItem("chatliz_chat_bg") || "");
  const [activeTheme, setActiveTheme] = useState<string>(() => localStorage.getItem("chatliz_theme") || "default");

  // New Modals
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isNotificationBellOpen, setIsNotificationBellOpen] = useState(false);
  const [isFriendsModalOpen, setIsFriendsModalOpen] = useState(false);
  const [isMailboxModalOpen, setIsMailboxModalOpen] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalTab, setLegalTab] = useState<LegalTab>("privacy");

  // Google AdSense direct hash navigation (#privacy, #terms, #contact, #about)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#privacy' || hash === '#privacidad') {
        setLegalTab('privacy');
        setLegalModalOpen(true);
      } else if (hash === '#terms' || hash === '#terminos') {
        setLegalTab('terms');
        setLegalModalOpen(true);
      } else if (hash === '#contact' || hash === '#contacto') {
        setLegalTab('contact');
        setLegalModalOpen(true);
      } else if (hash === '#about' || hash === '#nosotros') {
        setLegalTab('about');
        setLegalModalOpen(true);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Audio Recording & Voice Emulator
  const [showVoiceRecorderPreview, setShowVoiceRecorderPreview] = useState(false);
  const [recordedAudioBlob, setRecordedAudioBlob] = useState<Blob | null>(null);

  // Real-time Voice Modulator in Microphone Area
  const [showVoiceModulator, setShowVoiceModulator] = useState(false);
  const [voiceModulatorConfig, setVoiceModulatorConfig] = useState<RealtimeModulationConfig>(() => {
    try {
      const saved = localStorage.getItem("chatliz_voice_modulator_config");
      if (saved) return JSON.parse(saved);
    } catch {}
    return { ...DEFAULT_MODULATION_CONFIG };
  });

  const handleUpdateModulatorConfig = (newConfig: RealtimeModulationConfig) => {
    setVoiceModulatorConfig(newConfig);
    try {
      localStorage.setItem("chatliz_voice_modulator_config", JSON.stringify(newConfig));
    } catch {}
  };

  // Notifications, Friends & Mailbox Collections
  const [bellNotifications, setBellNotifications] = useState<NotificationItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("chatliz_bell_notifications") || "[]");
    } catch {
      return [];
    }
  });
  const [myFriends, setMyFriends] = useState<FriendUser[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("chatliz_my_friends") || "[]");
    } catch {
      return [];
    }
  });
  const [pendingFriendRequests, setPendingFriendRequests] = useState<FriendRequest[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("chatliz_pending_friend_reqs") || "[]");
    } catch {
      return [];
    }
  });
  const [mailboxItems, setMailboxItems] = useState<MailboxItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("chatliz_mailbox_items") || "[]");
    } catch {
      return [];
    }
  });

  // Delegated Admins & Bans
  const [delegatedAdmins, setDelegatedAdmins] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("chatliz_delegated_admins") || "[]");
    } catch {
      return [];
    }
  });
  const [bannedAdminsOrUsers, setBannedAdminsOrUsers] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("chatliz_banned_admins") || "[]");
    } catch {
      return [];
    }
  });

  const isMasterAdmin = (user?.username || "").trim().toLowerCase() === "axiss";
  const isUserAdmin = isMasterAdmin || delegatedAdmins.includes(user?.username) || user?.role === "admin";

  useEffect(() => {
    try {
      localStorage.setItem("chatliz_bell_notifications", JSON.stringify(bellNotifications));
    } catch {}
  }, [bellNotifications]);

  useEffect(() => {
    try {
      localStorage.setItem("chatliz_my_friends", JSON.stringify(myFriends));
    } catch {}
  }, [myFriends]);

  useEffect(() => {
    try {
      localStorage.setItem("chatliz_pending_friend_reqs", JSON.stringify(pendingFriendRequests));
    } catch {}
  }, [pendingFriendRequests]);

  useEffect(() => {
    try {
      localStorage.setItem("chatliz_mailbox_items", JSON.stringify(mailboxItems));
    } catch {}
  }, [mailboxItems]);

  useEffect(() => {
    try {
      localStorage.setItem("chatliz_delegated_admins", JSON.stringify(delegatedAdmins));
    } catch {}
  }, [delegatedAdmins]);

  useEffect(() => {
    try {
      localStorage.setItem("chatliz_banned_admins", JSON.stringify(bannedAdminsOrUsers));
    } catch {}
  }, [bannedAdminsOrUsers]);

  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (e.detail) setActiveTheme(e.detail);
    };
    window.addEventListener("chatliz_theme_changed", handleThemeChange);
    return () => window.removeEventListener("chatliz_theme_changed", handleThemeChange);
  }, []);

  useEffect(() => {
    if (user?.preferred_theme && user.preferred_theme !== activeTheme) {
      setActiveTheme(user.preferred_theme);
      localStorage.setItem("chatliz_theme", user.preferred_theme);
    }
  }, [user?.preferred_theme]);
  const [customFrames, setCustomFrames] = useState<Record<number, string>>({});
  
  useEffect(() => {
    (window as any).chatlizCustomFrames = customFrames;
    window.dispatchEvent(new Event('chatliz_custom_frames_updated'));
  }, [customFrames]);

  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [isRainbowNeon, setIsRainbowNeon] = useState(() => localStorage.getItem("chatliz_rainbow_neon") === "true");
  const [previousChat, setPreviousChat] = useState("global");
  const changeChat = (newChat: string) => {
    if (newChat !== activeChat) {
      setPreviousChat(activeChat);
      setActiveChat(newChat);
    }
  };
  const activeChatRef = useRef(activeChat);
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);
  
  useEffect(() => {
    const savedUser = localStorage.getItem("chatliz_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed.username && parsed.password) {
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          socket.emit("register_or_login", { ...parsed, timezone }, (res: any) => {
             if (res.success) {
                setUser(prev => ({
                  ...prev, ...parsed, ...res, 
                  countryLanguage: res.countryLanguage || parsed.countryLanguage,
                  timezone
                }));
                if (!res.gender) {
                  setIsFirstTimeSetup(true);
                } else {
                  setIsLoggedIn(true);
                }
             }
             setIsAuthChecking(false);
          });
          return;
        } else if (parsed.googleUid) {
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          socket.emit("google_login", { ...parsed, timezone }, (res: any) => {
             if (res.success) {
                setUser(prev => ({
                  ...prev, ...parsed, ...res, 
                  username: res.username,
                  countryLanguage: res.countryLanguage || parsed.countryLanguage,
                  timezone
                }));
                if (!res.gender) {
                  setIsFirstTimeSetup(true);
                } else {
                  setIsLoggedIn(true);
                }
             }
             setIsAuthChecking(false);
          });
          return;
        }
            } catch (e) {}
        } else {
       setIsAuthChecking(false);
       // Removed auto guest login
    }
    setIsAuthChecking(false);
  }, []);

  const DICT: Record<string, Record<string, string>> = {
    es: { chatGlobal: "Chat Global", online: "En línea", type: "Escribe un mensaje...", send: "Enviar", friends: "Amigos", settings: "Ajustes", search: "Buscar...", profile: "Perfil", unread: "Nuevos" },
    en: { chatGlobal: "Global Chat", online: "Online", type: "Type a message...", send: "Send", friends: "Friends", settings: "Settings", search: "Search...", profile: "Profile", unread: "New" },
    pt: { chatGlobal: "Chat Global", online: "Online", type: "Digite uma mensagem...", send: "Enviar", friends: "Amigos", settings: "Configurações", search: "Procurar...", profile: "Perfil", unread: "Novo" },
    fr: { chatGlobal: "Chat Mondial", online: "En ligne", type: "Tapez un message...", send: "Envoyer", friends: "Amis", settings: "Paramètres", search: "Rechercher...", profile: "Profil", unread: "Nouveau" },
    de: { chatGlobal: "Globaler Chat", online: "Online", type: "Nachricht eingeben...", send: "Senden", friends: "Freunde", settings: "Einstellungen", search: "Suchen...", profile: "Profil", unread: "Neu" },
    it: { chatGlobal: "Chat Globale", online: "In linea", type: "Scrivi un messaggio...", send: "Invia", friends: "Amici", settings: "Impostazioni", search: "Cerca...", profile: "Profil", unread: "Nuovo" }
  };
  const t = (key: string) => {
     const lang = user.pais_idioma || 'es';
     return DICT[lang]?.[key] || DICT['es'][key] || key;
  };

  const [messages, setMessages] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showInbox, setShowInbox] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});

  const [usersOnline, setUsersOnline] = useState<UserObj[]>([
    { username: "Elizabeth", statusMessage: "Administradora", role: "admin" },
  ]);
  const [userCache, setUserCache] = useState<Record<string, UserObj>>({});

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRadioOpen, setIsRadioOpen] = useState(false);
  const [isRadioPlaying, setIsRadioPlaying] = useState(false);
  const [showRadioHistory, setShowRadioHistory] = useState(false);
  const [radioHistorySongs, setRadioHistorySongs] = useState<RadioHistorySong[]>([]);
  const [showSyncToAxisModal, setShowSyncToAxisModal] = useState(false);

  const addSystemToast = (text: string, type = "Sistema") => {
    setToasts((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        type,
        sender: "Sistema",
        text,
      },
    ]);
  };

  useEffect(() => {
    fetch('/api/radio/history')
      .then((res) => res.json())
      .then((data) => {
        if (data?.history && Array.isArray(data.history)) {
          setRadioHistorySongs(data.history);
        }
      })
      .catch((err) => console.error("Error fetching radio history:", err));

    const handleHistory = (history: any) => {
      if (Array.isArray(history)) {
        setRadioHistorySongs(history);
      }
    };

    socket.on("radio_history_update", handleHistory);
    return () => {
      socket.off("radio_history_update", handleHistory);
    };
  }, []);
  const [isFriendsSidebarOpen, setIsFriendsSidebarOpen] = useState(false);
  const [unreadPMs, setUnreadPMs] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<any[]>([]);
  const [chatList, setChatList] = useState<any[]>([]);

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => setToasts((prev) => prev.slice(1)), 5000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  const [isGamesMenuOpen, setIsGamesMenuOpen] = useState(false);
  const isGamesMenuOpenRef = useRef(false);
  useEffect(() => {
    isGamesMenuOpenRef.current = isGamesMenuOpen;
  }, [isGamesMenuOpen]);
  const [chessBet, setChessBet] = useState(10);
  const [activeChessGame, setActiveChessGame] = useState<any>(null);
  const activeChessGameRef = useRef<any>(null);
  useEffect(() => {
    activeChessGameRef.current = activeChessGame;
  }, [activeChessGame]);

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);
  const [hallOfFame, setHallOfFame] = useState<any[]>([]);

  const activeChatConfig = activeChat === "global" ? globalChatConfig : chatConfig;
  const activeCustomBg = activeChatConfig?.backgroundBase64 || activeChatConfig?.backgroundUrl;

  const [personalBgOverride, setPersonalBgOverride] = useState<string | null>(() => localStorage.getItem("chatliz_personal_bg"));

  useEffect(() => {
    const handleBgChange = (e: any) => {
      setPersonalBgOverride(e.detail || null);
    };
    window.addEventListener("chatliz_personal_bg_changed", handleBgChange);
    return () => window.removeEventListener("chatliz_personal_bg_changed", handleBgChange);
  }, []);

  // User personal background isolation: your background only changes for YOU
  const personalBg = personalBgOverride !== null ? personalBgOverride : (user?.preferred_background || localStorage.getItem("chatliz_personal_bg"));
  let chatBg = personalBg || activeCustomBg || chatBgImage;

  // Recovery States
  const [recoveryModalOpen, setRecoveryModalOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState(1);
  const [recoveryUsername, setRecoveryUsername] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryCodeStr, setRecoveryCodeStr] = useState("");
  const [inputRecoveryCode, setInputRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{name: string, type: string, url: string} | null>(null);
  const [showRoomCleanerModal, setShowRoomCleanerModal] = useState(false);
  const isCleaningGlobalRef = useRef(false);
const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(
    null,
  );
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [storeCategory, setStoreCategory] = useState<string | undefined>(
    undefined,
  );
  const [isSongRequestOpen, setIsSongRequestOpen] = useState(false);
  const [isDjPanelOpen, setIsDjPanelOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const generalFileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioChunks = useRef<BlobPart[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (bottomRef.current?.parentElement) {
      bottomRef.current.parentElement.scrollTo({
        top: bottomRef.current.parentElement.scrollHeight,
        behavior: 'auto'
      });
    }
  };

  const micTimeoutRef = useRef<any>(null);
  const [isMicHeld, setIsMicHeld] = useState(false);

  const toggleRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isMusicPlaying)
        audio.play().catch((e) => console.log("Autoplay prevented:", e));
      else audio.pause();
    }
  }, [isMusicPlaying]);


  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    
    socket.emit("typing", { username: user.username, chat: activeChat });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { username: user.username, chat: activeChat });
    }, 2000);
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const googleUser = result.user;

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const payload = {
        email: googleUser.email,
        displayName: googleUser.displayName,
        photoURL: googleUser.photoURL,
        googleUid: googleUser.uid,
        timezone,
      };

      socket.emit("google_login", payload, (res: any) => {
        if (res.success) {
          setUser({
            ...user,
            username: res.username,
            profilePic: res.profilePic,
            statusMessage: res.statusMessage,
            role: res.role,
            countryLanguage: res.countryLanguage || user.countryLanguage,
            timezone,
            is_friends_public: res.is_friends_public,
            friends_list: res.friends_list || [],
            blocked_list: res.blocked_list || [],
            gender: res.gender, age: res.age,
            mood: res.mood,
          });
          localStorage.setItem("chatliz_user", JSON.stringify(payload));
          if (!res.gender) {
            setIsFirstTimeSetup(true);
          } else {
            setIsLoggedIn(true);
          }
        } else {
          alert(res.error || "Error al iniciar sesión con Google");
        }
      });
    } catch (error: any) {
      console.error("Google Auth Error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        // do nothing
      } else if (error.message && error.message.includes("Cross-Origin")) {
        alert(
          "La ventana de Google está bloqueada por el navegador dentro de esta vista previa. Para usar Google Login, por favor abre la aplicación en una nueva pestaña (haciendo clic en la flecha de la esquina superior derecha).",
        );
      } else {
        alert(
          "Error al autenticar con Google. Si estás en la vista previa, intenta abrir la app en una pestaña nueva.\nDetalle: " +
            error.message,
        );
      }
    }
  };

  const handleLogin = (e?: React.FormEvent, extraData: any = {}) => {
    e?.preventDefault();
    if (!user.username || !user.password) return;

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const loginPayload = { ...user, ...extraData, timezone };

    socket.emit("register_or_login", loginPayload, (res: any) => {
      if (res.success) {
        setUser({
          ...user,
          profilePic: res.profilePic,
          statusMessage: res.statusMessage,
          role: res.role,
          countryLanguage: res.countryLanguage || user.countryLanguage,
          timezone,
          is_friends_public: res.is_friends_public,
          friends_list: res.friends_list || [],
          blocked_list: res.blocked_list || [],
          gender: res.gender, age: res.age,
          mood: res.mood,
          preferred_background: res.preferred_background,
        });
        localStorage.setItem("chatliz_user", JSON.stringify(loginPayload));
        if (!res.gender) {
          setIsFirstTimeSetup(true);
        } else {
          setIsLoggedIn(true);
        }
      } else {
        alert(res.error || "Error al iniciar sesión");
      }
    });
  };

  const handleFirstTimeSetup = (data: any) => {
    socket.emit("broadcast_profile_change", {
      username: user.username,
      statusMessage: data.statusMessage,
      profilePic: user.profilePic,
      frameId: user.frameId,
      gender: data.gender,
      mood: data.mood,
      countryLanguage: data.countryLanguage,
      is_friends_public: data.is_friends_public
    });
    setUser(prev => ({
      ...prev,
      ...data
    }));
    setIsFirstTimeSetup(false);
    setIsLoggedIn(true);
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    const handleReconnect = () => {
      if (user.username) {
        // If they have a googleUid, use google_login, else register_or_login
        if (user.googleUid) {
          socket.emit(
            "google_login",
            {
              email: user.securityEmail,
              displayName: user.username,
              photoURL: user.profilePic,
              googleUid: user.googleUid,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            () => {},
          );
        } else {
          // We don't have the password in memory, but we can emit a special reconnect event
          // Or since we don't have the password, we can emit a new 'reconnect_user' event
          socket.emit("reconnect_user", { username: user.username });
        }
      }
    };
    socket.on("connect", handleReconnect);

    let unsubMessages: any = null;

    setMessages([]);
    if (activeChat === "global") {
      const q = query(
        collection(db, "global_chat"),
        orderBy("timestamp", "asc"),
        limitToLast(1000),
      );
      unsubMessages = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map((doc) => {
          const data = doc.data();
          return { ...data, id: data.id || doc.id, docId: doc.id };
        });
        const filteredMsgs = msgs.filter((m: any) => {
          if (
            m.sender === "Elizabeth" &&
            (isGamesMenuOpenRef.current || activeChessGameRef.current)
          ) {
            return false;
          }
          return true;
        });
        setMessages(filteredMsgs);
        if (msgs.length >= 20 && !isCleaningGlobalRef.current) {
          isCleaningGlobalRef.current = true;
          socket.emit("clean_global_room_keep_last", () => {
            setTimeout(() => {
              isCleaningGlobalRef.current = false;
            }, 3000);
          });
        }
        setTimeout(
          scrollToBottom,
          100,
        );
      });
    } else if (activeChat.startsWith("room_")) {
      const q = query(
        collection(db, "custom_rooms_msgs", activeChat, "messages"),
        orderBy("timestamp", "asc"),
        limitToLast(500)
      );
      unsubMessages = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map((doc) => {
          const data = doc.data();
          return { ...data, id: data.id || doc.id, docId: doc.id };
        });
        setMessages(msgs);
        setTimeout(scrollToBottom, 100);
      });
    } else {
      const participants = [user.username, activeChat].sort();
      const convoId = participants.join("_");
      const q = query(
        collection(db, "chats", convoId, "messages"),
        orderBy("timestamp", "asc"),
        limitToLast(1000),
      );
      unsubMessages = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map((doc) => {
          const data = doc.data();
          return { ...data, id: data.id || doc.id, docId: doc.id };
        });
        setMessages(msgs);
        setTimeout(
          scrollToBottom,
          100,
        );
      });
    }

    return () => {
      socket.off("connect", handleReconnect);
      if (unsubMessages) unsubMessages();
    };
  }, [isLoggedIn, activeChat, user.username]);

  // Dedicated, immediate listener for appearance synchronization across chats (Axiss <-> Test Chat)
  useEffect(() => {
    let lastAppliedSignature = "";

    const applyAppearanceInstantly = (rawConfig: any, source: string) => {
      if (!rawConfig) return;
      // Extract configuration payload whether wrapped in config, appearance, payload, or root
      const config: ChatConfig = (rawConfig.config || rawConfig.appearance || rawConfig.payload || rawConfig) as ChatConfig;
      if (!config) return;

      const signature = JSON.stringify({
        bg: config.backgroundBase64 || config.backgroundUrl || (rawConfig as any).url,
        theme: config.theme,
        icon: config.icon,
        title: config.title,
        status: config.statusMessage,
        bubble: config.bubbleStyle,
        ts: rawConfig.timestamp || config.updatedAt,
      });

      if (signature === lastAppliedSignature) return;
      lastAppliedSignature = signature;

      console.log(`[Appearance Sync] Immediate cross-chat update applied from ${source}:`, config);

      // 1. Immediately update global chat config state
      setGlobalChatConfig((prev) => ({
        ...(prev || {}),
        ...config,
      }));

      // 2. Immediate background image & video handling
      const bg = config.backgroundBase64 || config.backgroundUrl || (rawConfig as any).url || (rawConfig as any).background;
      if (bg) {
        setChatBgImage(bg);
        try {
          localStorage.setItem("chatliz_chat_bg", bg);
        } catch (e) {}
        // Preload image so it displays instantly without white flash
        if (!bg.match(/\.(mp4|webm|ogg)$/i) && !bg.startsWith("data:video")) {
          const preloader = new Image();
          preloader.src = bg;
        }
      } else if (config.backgroundBase64 === "" && config.backgroundUrl === "") {
        setChatBgImage("");
        try {
          localStorage.removeItem("chatliz_chat_bg");
        } catch (e) {}
      }

      // 3. Immediate theme and accent color synchronization
      if (config.theme) {
        setActiveTheme(config.theme);
        try {
          localStorage.setItem("chatliz_theme", config.theme);
        } catch (e) {}
        window.dispatchEvent(new CustomEvent("chatliz_theme_changed", { detail: config.theme }));

        const THEME_NEON_MAP: Record<string, string> = {
          cyan: "#00f3ff",
          purple: "#c084fc",
          emerald: "#34d399",
          pink: "#f472b6",
          amber: "#fbbf24",
          red: "#f87171",
        };
        if (THEME_NEON_MAP[config.theme]) {
          setNeonColor(THEME_NEON_MAP[config.theme]);
          try {
            localStorage.setItem("chatliz_neon_color", THEME_NEON_MAP[config.theme]);
          } catch (e) {}
        }
      }

      addSystemToast(`🎨 Apariencia de ${source} sincronizada al instante`, "Apariencia");
    };

    // Primary document explicitly requested: system_updates/appearance_for_Axiss
    const unsubAxiss = onSnapshot(
      doc(db, "system_updates", "appearance_for_Axiss"),
      (docSnap) => {
        if (docSnap.exists()) {
          applyAppearanceInstantly(docSnap.data(), "Axiss");
        }
      },
      (err) => console.warn("Listener system_updates/appearance_for_Axiss note:", err)
    );

    // Fallback/alias: system_updates/appearance_for_axis
    const unsubAxis = onSnapshot(
      doc(db, "system_updates", "appearance_for_axis"),
      (docSnap) => {
        if (docSnap.exists()) {
          applyAppearanceInstantly(docSnap.data(), "Axis");
        }
      },
      (err) => console.warn("Listener system_updates/appearance_for_axis note:", err)
    );

    // Fallback/alias: system_updates/appearance_for_Axis
    const unsubAxisUpper = onSnapshot(
      doc(db, "system_updates", "appearance_for_Axis"),
      (docSnap) => {
        if (docSnap.exists()) {
          applyAppearanceInstantly(docSnap.data(), "Axis");
        }
      },
      (err) => console.warn("Listener system_updates/appearance_for_Axis note:", err)
    );

    // Target: system_updates/appearance_for_chatliz (Hugging Face Space)
    const unsubChatliz = onSnapshot(
      doc(db, "system_updates", "appearance_for_chatliz"),
      (docSnap) => {
        if (docSnap.exists()) {
          applyAppearanceInstantly(docSnap.data(), "ChatLiz (Hugging Face)");
        }
      },
      (err) => console.warn("Listener system_updates/appearance_for_chatliz note:", err)
    );

    // Also listen to settings/global_chat_config
    const unsubGlobalDoc = onSnapshot(
      doc(db, "settings", "global_chat_config"),
      (docSnap) => {
        if (docSnap.exists()) {
          applyAppearanceInstantly(docSnap.data(), "Chat Global");
        }
      },
      (err) => console.warn("Listener settings/global_chat_config note:", err)
    );

    return () => {
      unsubAxiss();
      unsubAxis();
      unsubAxisUpper();
      unsubChatliz();
      unsubGlobalDoc();
    };
  }, []);

  // Real-time synchronization for Global Chat configuration
  useEffect(() => {
    if (!isLoggedIn) return;

    // Request current state from server socket
    socket.emit("get_chat_config", "global", (res: any) => {
      if (res) setGlobalChatConfig(res);
    });

    // Real-time socket event handlers for immediate broadcast updates
    const handleChatConfigUpdated = (data: { chat: string; config: ChatConfig }) => {
      if (data.chat === "global") {
        setGlobalChatConfig(data.config);
        const bg = data.config.backgroundBase64 || data.config.backgroundUrl;
        if (bg) {
          setChatBgImage(bg);
          try { localStorage.setItem("chatliz_chat_bg", bg); } catch (e) {}
        }
        if (data.config.theme) {
          setActiveTheme(data.config.theme);
          try { localStorage.setItem("chatliz_theme", data.config.theme); } catch (e) {}
          window.dispatchEvent(new CustomEvent("chatliz_theme_changed", { detail: data.config.theme }));
        }
      } else {
        const participants = [user.username, activeChat].sort();
        const convoId = participants.join("_");
        if (data.chat === convoId) {
          setChatConfig(data.config);
        }
      }
    };

    const handleSyncToAxis = (data: any) => {
      if (data?.config) {
        setGlobalChatConfig(data.config);
        const bg = data.config.backgroundBase64 || data.config.backgroundUrl;
        if (bg) {
          setChatBgImage(bg);
          try { localStorage.setItem("chatliz_chat_bg", bg); } catch (e) {}
        }
        if (data.config.theme) {
          setActiveTheme(data.config.theme);
          try { localStorage.setItem("chatliz_theme", data.config.theme); } catch (e) {}
          window.dispatchEvent(new CustomEvent("chatliz_theme_changed", { detail: data.config.theme }));
        }
      }
    };

    const handleGlobalChatCleaned = (data: any) => {
      console.log("[Limpiador de Sala Global] Chat global limpiado a 20 mensajes:", data);
    };

    const handleGlobalBgUpdated = (bgUrl: string) => {
      setGlobalChatConfig((prev) => ({
        ...(prev || {}),
        backgroundBase64: bgUrl,
        backgroundUrl: bgUrl
      }));
      setChatBgImage(bgUrl);
      try { localStorage.setItem("chatliz_chat_bg", bgUrl); } catch (e) {}
    };

    const handleUserProfileUpdated = (profileData: any) => {
      setUsersOnline((prev) =>
        prev.map((u) => (u.username === profileData.username ? { ...u, ...profileData } : u))
      );
      if (profileData.username === user.username) {
        setUser((prev) => ({ ...prev, ...profileData }));
      }
    };

    socket.on("chat_config_updated", handleChatConfigUpdated);
    socket.on("global_bg_updated", handleGlobalBgUpdated);
    socket.on("user_profile_updated", handleUserProfileUpdated);
    socket.on("sync_appearance_to_axis", handleSyncToAxis);
    socket.on("global_chat_cleaned", handleGlobalChatCleaned);

    return () => {
      socket.off("chat_config_updated", handleChatConfigUpdated);
      socket.off("global_bg_updated", handleGlobalBgUpdated);
      socket.off("user_profile_updated", handleUserProfileUpdated);
      socket.off("sync_appearance_to_axis", handleSyncToAxis);
      socket.off("global_chat_cleaned", handleGlobalChatCleaned);
    };
  }, [isLoggedIn, activeChat, user.username]);

  // Real-time synchronization for Private Chat configuration
  useEffect(() => {
    if (!activeChat || activeChat === "global" || activeChat.startsWith("room_") || !user.username) {
      setChatConfig(null);
      return;
    }
    const participants = [user.username, activeChat].sort();
    const convoId = participants.join("_");

    const unsub = onSnapshot(doc(db, "chats", convoId, "config", "settings"), (docSnap) => {
      if (docSnap.exists()) {
        setChatConfig(docSnap.data() as ChatConfig);
      } else {
        setChatConfig(null);
      }
    }, (err) => {
      console.warn("Private chat config listener note:", err);
    });

    socket.emit("get_chat_config", convoId, (res: any) => {
      if (res) setChatConfig(res);
    });

    return () => unsub();
  }, [activeChat, user.username]);

  const handleSaveChatConfig = async (newConfig: ChatConfig) => {
    if (activeChat === "global") {
      try {
        await setDoc(doc(db, "settings", "global_chat_config"), newConfig, { merge: true });
        if (newConfig.backgroundBase64 || newConfig.backgroundUrl) {
          await setDoc(doc(db, "settings", "globalBg"), { url: newConfig.backgroundBase64 || newConfig.backgroundUrl || "" }, { merge: true });
        }
      } catch (err) {
        console.warn("Saving to Firestore fallback:", err);
      }
      socket.emit("update_chat_config", { chat: "global", config: newConfig });
      setGlobalChatConfig(newConfig);
    } else {
      const participants = [user.username, activeChat].sort();
      const convoId = participants.join("_");
      try {
        await setDoc(doc(db, "chats", convoId, "config", "settings"), newConfig, { merge: true });
      } catch (err) {
        console.warn("Saving private config to Firestore fallback:", err);
      }
      socket.emit("update_chat_config", { chat: convoId, config: newConfig });
      setChatConfig(newConfig);
    }
  };

  const handleResetChatConfig = async () => {
    if (activeChat === "global") {
      try {
        await deleteDoc(doc(db, "settings", "global_chat_config"));
        await deleteDoc(doc(db, "settings", "globalBg"));
      } catch (err) {}
      const resetConfig: ChatConfig = {
        backgroundBase64: "",
        backgroundUrl: "",
        icon: "",
        theme: "cyan",
        title: "Chat Global",
        statusMessage: "",
        bubbleStyle: "default"
      };
      socket.emit("update_chat_config", { chat: "global", config: resetConfig });
      setGlobalChatConfig(null);
    } else {
      const participants = [user.username, activeChat].sort();
      const convoId = participants.join("_");
      try {
        await deleteDoc(doc(db, "chats", convoId, "config", "settings"));
      } catch (err) {}
      const resetConfig: ChatConfig = {
        backgroundBase64: "",
        backgroundUrl: "",
        icon: "",
        theme: "cyan",
        title: "",
        statusMessage: "",
        bubbleStyle: "default"
      };
      socket.emit("update_chat_config", { chat: convoId, config: resetConfig });
      setChatConfig(null);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    socket.on(
      "dj_request_status",
      (req: { id: string; status: string; title: string }) => {
        setNotifications((prev) => [
          {
            id: Date.now().toString(),
            text:
              req.status === "accepted"
                ? `Tu canción "${req.title}" ha sido aceptada y está en cola.`
                : `Tu canción "${req.title}" no cumple con las normas (contenido inapropiado/fuera de contexto).`,
            read: false,
            type: req.status,
          },
          ...prev,
        ]);
      },
    );

    socket.on("message_reaction", (data: { msgId: string, docId?: string, emoji: string, activeChat: string, username: string }) => {
      setMessages(prev => prev.map(m => {
        if ((m.id && m.id === data.msgId) || (m.docId && m.docId === data.docId)) {
          const currentReactions = m.reactions || {};
          const reactionUsers = Array.isArray(currentReactions[data.emoji]) ? currentReactions[data.emoji] : [];
          if (!reactionUsers.includes(data.username)) {
              return {
                ...m,
                reactions: {
                  ...currentReactions,
                  [data.emoji]: [...reactionUsers, data.username]
                }
              };
          }
        }
        return m;
      }));
    });

    socket.on("receive_global", (msg: any) => {
      // If we are not in global chat, we shouldn't append it to the current messages view
      if (activeChatRef.current !== "global") {
        return;
      }

      if (
        msg.sender !== user.username ||
        msg.sender === "Elizabeth" ||
        msg.isAi
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          const next = [...prev, msg];
          return next.slice(-15);
        });
        setTimeout(
          scrollToBottom,
          100,
        );
      }
    });

    socket.on("user_liked", (fromUser: string) => {
        playNotifySound();
        setBellNotifications(prev => [{
            id: `${Date.now()}_like_${fromUser}`,
            type: 'like',
            sender: fromUser,
            text: `A ${fromUser} le gustó tu perfil`,
            timestamp: Date.now(),
            read: false
        }, ...prev.filter(n => !(n.type === 'like' && n.sender === fromUser))]);
        setToasts(prev => [...prev, {
            id: Date.now(),
            type: "Me Gusta",
            sender: fromUser,
            text: `¡A ${fromUser} le ha gustado tu perfil!`
        }]);
    });

    socket.on("user_like_received", (data: { id?: string; from: string; fromPic?: string; type?: string; timestamp?: number }) => {
        playNotifySound();
        setBellNotifications(prev => [{
            id: data.id || `${Date.now()}_like_${data.from}`,
            type: 'like',
            sender: data.from,
            senderPic: data.fromPic,
            text: `A ${data.from} le gustó tu perfil`,
            timestamp: data.timestamp || Date.now(),
            read: false
        }, ...prev.filter(n => !(n.type === 'like' && n.sender === data.from))]);
        setToasts(prev => [...prev, {
            id: Date.now(),
            type: "Me Gusta",
            sender: data.from,
            text: `¡A ${data.from} le ha gustado tu perfil!`
        }]);
    });
    
    socket.on("new_profile_comment", (data: { fromUser: string, comment: any }) => {
        playNotifySound();
        setBellNotifications(prev => [{
            id: `${Date.now()}_comment_${data.fromUser}`,
            type: 'profile_comment',
            sender: data.fromUser,
            text: `${data.fromUser} comentó en tu perfil: "${data.comment?.text || ''}"`,
            timestamp: Date.now(),
            read: false
        }, ...prev]);
        setToasts(prev => [...prev, {
            id: Date.now(),
            type: "Comentario",
            sender: data.fromUser,
            text: `${data.fromUser} comentó en tu perfil.`
        }]);
    });

    socket.on("out_of_tokens", (data: { aiName: string }) => {
        setOutOfTokensAi(data.aiName);
    });

    socket.on("receive_private", (msg: any, fromUser: string) => {
      if (activeChatRef.current !== fromUser) {
        playNotifySound();
        setUnreadPMs((prev) => ({ ...prev, [fromUser]: true }));
        setNotifications((prev) => [{
            id: Date.now().toString(),
            type: 'private_message',
            text: `Nuevo mensaje de ${fromUser}`,
            fromUser,
            read: false,
            timestamp: Date.now()
        }, ...prev]);
        setBellNotifications(prev => [{
          id: Date.now().toString(),
          type: 'private_msg',
          sender: fromUser,
          text: msg.text || "Mensaje privado recibido",
          timestamp: Date.now(),
          read: false
        }, ...prev]);
        setMailboxItems(prev => [{
          id: Date.now().toString(),
          type: 'private_chat',
          sender: fromUser,
          text: msg.text || "Mensaje privado recibido",
          timestamp: Date.now(),
          read: false
        }, ...prev]);
        setToasts((prev) => [
          ...prev,
          {
            id: Date.now(),
            type: "PM",
            sender: fromUser,
            text: msg.text || "Nuevo audio/imagen",
          },
        ]);
      } else {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setTimeout(
          scrollToBottom,
          100,
        );
      }
    });

    socket.on("message", (msg: any) => {
      if (msg && msg.sender && msg.sender !== user.username) {
        const myName = (user.username || "").toLowerCase();
        const txt = (msg.text || "").toLowerCase();
        if (myName && (txt.includes(`@${myName}`) || txt.includes(myName))) {
          setMailboxItems(prev => [{
            id: `${Date.now()}_${msg.sender}`,
            type: 'mention',
            sender: msg.sender,
            senderPic: msg.senderPic,
            room: activeChatRef.current || 'global',
            roomTitle: activeChatRef.current === 'global' ? 'Sala Global' : activeChatRef.current,
            text: msg.text || '',
            timestamp: Date.now(),
            read: false
          }, ...prev]);
          setToasts(prev => [...prev, {
            id: Date.now(),
            type: "Mención",
            sender: msg.sender,
            text: `${msg.sender} te mencionó en el chat.`
          }]);
        }
      }
    });

    socket.on("friend_request_received", (req: FriendRequest) => {
      // If already friends, discard and do not add to pending
      const alreadyFriends = user.friends_list?.includes(req.from) || myFriends.some(f => f.username === req.from);
      if (alreadyFriends) return;

      playNotifySound();
      setPendingFriendRequests(prev => {
        if (prev.some(r => r.id === req.id || r.from === req.from)) return prev;
        return [req, ...prev];
      });
      setBellNotifications(prev => [{
        id: req.id || `${Date.now()}_fr_${req.from}`,
        type: 'friend_request',
        sender: req.from,
        senderPic: req.fromPic,
        text: 'Te envió una solicitud de amistad',
        timestamp: req.timestamp || Date.now(),
        read: false
      }, ...prev.filter(n => !(n.type === 'friend_request' && n.sender === req.from))]);
      setToasts(prev => [...prev, {
        id: Date.now(),
        type: "Amigo",
        sender: req.from,
        text: `${req.from} te envió una solicitud de amistad.`
      }]);
    });

    socket.on("friend_request_status", (data: { from: string; status: 'accepted' | 'rejected' }) => {
      // Remove any pending request from this user
      setPendingFriendRequests(prev => prev.filter(r => r.from !== data.from));

      if (data.status === 'accepted') {
        setMyFriends(prev => {
          if (prev.some(f => f.username === data.from)) return prev;
          return [{ username: data.from, addedAt: Date.now() }, ...prev];
        });
        setUser(prev => {
          const cur = prev.friends_list || [];
          const updated = cur.includes(data.from) ? cur : [...cur, data.from];
          return {
            ...prev,
            friends_list: updated,
            friend_requests: (prev.friend_requests || []).filter(r => r !== data.from)
          };
        });
        setBellNotifications(prev => [{
          id: Date.now().toString(),
          type: 'friend_accepted',
          sender: data.from,
          text: 'Solicitud de amistad aceptada',
          timestamp: Date.now(),
          read: false
        }, ...prev.filter(n => !(n.type === 'friend_request' && n.sender === data.from))]);
        setToasts(prev => [...prev, {
          id: Date.now(),
          type: "Amigo",
          sender: data.from,
          text: `¡${data.from} aceptó tu solicitud de amistad!`
        }]);
      } else {
        setBellNotifications(prev => [{
          id: Date.now().toString(),
          type: 'friend_rejected',
          sender: data.from,
          text: 'Solicitud de amistad rechazada',
          timestamp: Date.now(),
          read: false
        }, ...prev.filter(n => !(n.type === 'friend_request' && n.sender === data.from))]);
      }
    });

    socket.on("user_like_received", (data: { from: string; fromPic?: string; type?: 'like' | 'heart' }) => {
      setBellNotifications(prev => {
        // Prevent duplicate notification from same user within 20s
        if (prev.some(p => (p.type === 'heart' || p.type === 'like') && p.sender === data.from && (Date.now() - p.timestamp < 20000))) {
          return prev;
        }
        return [{
          id: `${Date.now()}_${data.from}`,
          type: data.type || 'heart',
          sender: data.from,
          senderPic: data.fromPic,
          timestamp: Date.now(),
          read: false
        }, ...prev];
      });
      setToasts(prev => [...prev, {
        id: Date.now(),
        type: "Like",
        sender: data.from,
        text: data.type === 'heart' ? `${data.from} te envió un ❤️` : `${data.from} le dio like a tu perfil.`
      }]);
    });

    socket.emit("get_hall_of_fame", (data: any[]) => {
      setHallOfFame(data);
    });

    socket.emit("request_initial_state");

    socket.on(
      "llamada_entrante",
      (caller: { username: string; profilePic: string }) => {
        setIncomingCall(caller);
      },
    );

    socket.on("llamada_cancelada", () => {
      setIncomingCall(null);
    });

    socket.on(
      "respuesta_llamada",
      (data: { responder: string; profilePic: string; accepted: boolean }) => {
        if (data.accepted) {
          setOutgoingCall(null);
          setActiveCall({
            partner: { username: data.responder, profilePic: data.profilePic },
            isInitiator: true,
          });
          // showToast(`Llamada conectada con ${data.responder}`, 'success');
        } else {
          setOutgoingCall(null);
          // showToast(`${data.responder} rechazó la llamada`, 'error');
        }
      },
    );

    socket.on("call_ended", () => {
      setActiveCall(null);
      // showToast('Llamada finalizada', 'info');
    });

    socket.on("banned_status", (data: {isBanned: boolean}) => {
      setIsBanned(data.isBanned);
      if (data.isBanned) {
         alert("Has sido baneado. No podrás escribir.");
      } else {
         alert("Has sido desbaneado.");
      }
    });
    
    socket.on("global_bg_updated", (bgUrl: string) => {
      setChatBgImage(bgUrl);
      localStorage.setItem("chatliz_chat_bg", bgUrl);
    });

    socket.on("all_custom_frames", (data) => {
      setCustomFrames(data || {});
    });

    socket.on("custom_frame_updated", (data: { id: number, url: string }) => {
      setCustomFrames(prev => ({ ...prev, [data.id]: data.url }));
    });

    socket.on("system_message", (data) => {
        // System updates are strictly ONLY visible to master administrators AXISS and Axiss
        const isMaster = user?.username === "AXISS" || user?.username === "Axiss";
        if (!isMaster) return;
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            text: data.text,
            sender: "Sistema",
            timestamp: new Date().toISOString()
        }]);
    });

    socket.on("update_user_info", (updatedUser: UserObj) => {
        if (updatedUser.username === user.username) {
            setUser(prev => ({ ...prev, ...updatedUser }));
        }
    });

    socket.on("active_users", (usersList: UserObj[]) => {
      socket.emit("check_pending_calls");
      const aiIds = ["Elizabeth", "Sensei", "Shadow", "Neko"];
      const ais = usersList
        .filter((u) => aiIds.includes(u.username))
        .map((u) => ({ ...u, isAi: true }));
      const others = usersList.filter(
        (u) => !aiIds.includes(u.username) && u.username !== user.username,
      );
      setUsersOnline([...ais, ...others]);
      setUserCache((prev) => {
        const newCache = { ...prev };
        usersList.forEach((u) => {
          newCache[u.username] = {
            ...newCache[u.username],
            ...u,
            profilePic: u.profilePic || newCache[u.username]?.profilePic
          };
        });
        return newCache;
      });
      const me = usersList.find((u) => u.username === user.username);
      if (me) {
        setUser((prev) => ({ ...prev, ...me }));
      }
    });

    socket.on("global_chat_cleared", () => {
      setMessages([]);
    });

    socket.on(
      "chess_invite_accepted",
      (data: { gameId: string; opponent: string; bet: number }) => {
        // Find the user object in usersOnline ref or just pass username
        setUsersOnline((prev) => {
          const oppObj = prev.find((u) => u.username === data.opponent) || {
            username: data.opponent,
            elo: 0,
          };
          setActiveChessGame({
            id: data.gameId,
            opponent: oppObj,
            bet: data.bet,
            isHost: true,
          });
          return prev;
        });
      },
    );

    socket.on("typing", (data: { username: string; chat: string }) => {
      const targetChat =
        data.chat === user.username ? data.username : data.chat;
      setTypingUsers((prev) => {
        const chatTyping = prev[targetChat] || [];
        if (!chatTyping.includes(data.username)) {
          return { ...prev, [targetChat]: [...chatTyping, data.username] };
        }
        return prev;
      });
      setTimeout(() => {
        setTypingUsers((prev) => {
          const chatTyping = prev[targetChat] || [];
          if (chatTyping.includes(data.username)) {
            return {
              ...prev,
              [targetChat]: chatTyping.filter((u) => u !== data.username),
            };
          }
          return prev;
        });
      }, 4000);
    });

    socket.on("stop_typing", (data: { username: string; chat: string }) => {
      const targetChat =
        data.chat === user.username ? data.username : data.chat;
      setTypingUsers((prev) => {
        const chatTyping = prev[targetChat] || [];
        return {
          ...prev,
          [targetChat]: chatTyping.filter((u) => u !== data.username),
        };
      });
    });

    let unsubUser: any = null;
    let unsubscribe: any = null;

    // Ensure user is authenticated before setting up listeners
    let unsubNotif: any = null;
    let unsubChats: any = null;
    const setupListeners = () => {
      if (unsubChats) unsubChats();
      if (unsubUser) unsubUser();
      if (unsubscribe) unsubscribe();
      if (unsubNotif) unsubNotif();

      const qChats = query(
        collection(db, "userChats", user.username, "chats"),
        orderBy("updatedAt", "desc"),
      );
      unsubChats = onSnapshot(qChats, (snapshot) => {
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChatList(list);
      });

      const qNotif = query(
        collection(db, "notifications"),
        where("recipientUid", "==", user.username),
      );
      unsubNotif = onSnapshot(qNotif, (snapshot) => {
        const rawData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Notificaciones recibidas:", rawData);
        const msgs = snapshot.docs.map((doc) => {
          const data = doc.data();
          let text = data.message || data.text || "";
          if (!text) {
            if (data.type === "LIKE" || data.type === "like")
              text = `${data.senderName} le ha dado Like a tu perfil.`;
            else if (data.type === "REQUEST" || data.type === "friend_request")
              text = `${data.senderName} te ha enviado una solicitud de amistad.`;
            else if (data.type === "MESSAGE")
              text = `Nuevo mensaje de ${data.senderName}.`;
            else text = `Notificación de ${data.senderName}`;
          }
          return {
            ...data,
            id: doc.id,
            text,
            read: data.isRead,
            type:
              data.type === "LIKE"
                ? "like"
                : data.type === "REQUEST"
                  ? "friend_request"
                  : data.type,
          };
        });

        const handledSet = getHandledNotifIds(user.username);

        msgs.forEach((m: any) => {
          if (!m.read && !handledSet.has(m.id)) {
            const sender = m.senderName || m.from || "Usuario";

            if (m.type === "like" || m.type === "LIKE" || m.type === "heart") {
              if (handledSet.has(`like_${sender}`)) return;

              setBellNotifications(prev => {
                if (prev.some(p => p.id === m.id || (p.type === 'like' && p.sender === sender))) return prev;
                return [{
                  id: m.id,
                  type: 'like',
                  sender,
                  text: m.text,
                  timestamp: m.timestamp || Date.now(),
                  read: false
                }, ...prev];
              });
            } else if (m.type === "friend_request" || m.type === "REQUEST") {
              // If already friends or already handled, dismiss and mark read immediately
              const isAlreadyFriend = (user.friends_list || []).includes(sender) || myFriends.some(f => f.username === sender);
              if (isAlreadyFriend || handledSet.has(`fr_${sender}`)) {
                if (db && m.id && !m.id.startsWith("local_")) {
                  updateDoc(doc(db, "notifications", m.id), { isRead: true }).catch(() => {});
                }
                return;
              }

              setPendingFriendRequests(prev => {
                if (prev.some(p => p.from === sender)) return prev;
                return [{ id: m.id, from: sender, timestamp: m.timestamp || Date.now() }, ...prev];
              });
              setBellNotifications(prev => {
                if (prev.some(p => p.id === m.id || (p.type === 'friend_request' && p.sender === sender))) return prev;
                return [{
                  id: m.id,
                  type: 'friend_request',
                  sender,
                  text: m.text,
                  timestamp: m.timestamp || Date.now(),
                  read: false
                }, ...prev];
              });
            } else if (m.type === "MESSAGE" || m.type === "private_msg") {
              setMailboxItems(prev => {
                if (prev.some(p => p.id === m.id)) return prev;
                return [{
                  id: m.id,
                  type: 'private_chat',
                  sender,
                  text: m.text,
                  timestamp: m.timestamp || Date.now(),
                  read: false
                }, ...prev];
              });
              setBellNotifications(prev => {
                if (prev.some(p => p.id === m.id)) return prev;
                return [{
                  id: m.id,
                  type: 'private_msg',
                  sender,
                  text: m.text,
                  timestamp: m.timestamp || Date.now(),
                  read: false
                }, ...prev];
              });
            }
          }
        });
      });

      unsubUser = onSnapshot(
        doc(db, "users", user.username!),
        (docSnap) => {
          if (docSnap.exists()) {
            const updatedUser = docSnap.data() as UserObj;
            setUser((prev) => ({ ...prev, ...updatedUser }));

            setUsersOnline((prevOnline) => {
              const exists = prevOnline.find(
                (u) => u.username === user.username,
              );
              if (exists) {
                return prevOnline.map((u) =>
                  u.username === user.username ? { ...u, ...updatedUser } : u,
                );
              }
              return prevOnline;
            });
          }
        },
        (error: any) => {
          console.error("onSnapshot unsubUser error:", error);
          if (error?.code !== "permission-denied") {
            setTimeout(setupListeners, 3000);
          }
        },
      );

      unsubscribe = onSnapshot(
        collection(db, "users"),
        (snapshot) => {
          const cacheUpdates: Record<string, UserObj> = {};
          let hasOnlineUpdates = false;

          snapshot.docChanges().forEach((change) => {
            if (change.type === "modified" || change.type === "added") {
              const updatedUser = change.doc.data() as UserObj;
              const uName = updatedUser.username || change.doc.id;
              cacheUpdates[uName] = { ...updatedUser, username: uName };
              hasOnlineUpdates = true;
            }
          });

          if (Object.keys(cacheUpdates).length > 0) {
            setUserCache((prev) => ({ ...prev, ...cacheUpdates }));
            setUsersOnline((prevOnline) => {
              let newOnline = [...prevOnline];
              let changed = false;
              for (const username in cacheUpdates) {
                const updatedUser = cacheUpdates[username];
                const index = newOnline.findIndex(
                  (u) => u.username === username,
                );
                if (index !== -1) {
                  newOnline[index] = { ...newOnline[index], ...updatedUser };
                  changed = true;
                }
              }
              return changed ? newOnline : prevOnline;
            });
          }
        },
        (error: any) => {
          console.error("onSnapshot unsubscribe error:", error);
          if (error?.code !== "permission-denied") {
            setTimeout(setupListeners, 3000);
          }
        },
      );
    };
    const authUnsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (!authUser) {
        signInAnonymously(auth).catch((e) => console.warn(e));
      }
    });
    if (user.username) {
      setupListeners();
    }

    return () => {
      socket.off("receive_global");
      socket.off("message_reaction");
      socket.off("receive_private");
      socket.off("active_users");
      if (unsubscribe) unsubscribe();
      if (unsubUser) unsubUser();
      if (typeof unsubNotif === "function") unsubNotif();
      if (typeof unsubChats === "function") unsubChats();
      authUnsubscribe();
    };
  }, [isLoggedIn, user.username]);

  const closeAllModals = () => {
    setShowNotifications(false);
    setIsSidebarOpen(false);
    setIsFriendsSidebarOpen(false);
    setIsFriendReqOpen(false);
    setIsConfigOpen(false);
    setIsAiSelectorOpen(false);
    setSelectedUserModal(null);
    setAdminConfigAiOpen(false);
    setIsGamesMenuOpen(false);
    setIsStoreOpen(false);
    setIsSongRequestOpen(false);
    setIsDjPanelOpen(false);
    setIsAdminPanelOpen(false);
    setIsNotificationBellOpen(false);
    setIsFriendsModalOpen(false);
    setIsMailboxModalOpen(false);
    setIsBgModalOpen(false);
  };

  const handlePromoteToAdmin = (targetUsername: string) => {
    if (!isMasterAdmin) return;
    setDelegatedAdmins((prev) => {
      if (prev.includes(targetUsername)) return prev;
      return [...prev, targetUsername];
    });
    setToasts((t) => [
      ...t,
      {
        id: Date.now(),
        type: "Admin",
        sender: "Sistema",
        text: `👑 ${targetUsername} ha sido nombrado Administrador.`,
      },
    ]);
  };

  const handleDemoteAdmin = (targetUsername: string) => {
    if (!isMasterAdmin) return;
    if (targetUsername === "AXISS" || targetUsername === "Axiss") {
      alert("⚠️ No es posible quitar a un Administrador Principal.");
      return;
    }
    setDelegatedAdmins((prev) => prev.filter((u) => u !== targetUsername));
    setToasts((t) => [
      ...t,
      {
        id: Date.now(),
        type: "Admin",
        sender: "Sistema",
        text: `Se removieron los permisos de administrador a ${targetUsername}.`,
      },
    ]);
  };

  const handleBanAdminOrUser = (targetUsername: string) => {
    if (!isMasterAdmin) return;
    if (targetUsername === "AXISS" || targetUsername === "Axiss") {
      alert("⚠️ No es posible bloquear a un Administrador Principal.");
      return;
    }
    setDelegatedAdmins((prev) => prev.filter((u) => u !== targetUsername));
    setBannedAdminsOrUsers((prev) => {
      if (prev.includes(targetUsername)) return prev;
      return [...prev, targetUsername];
    });
    socket.emit("ban_user", { username: targetUsername });
    setToasts((t) => [
      ...t,
      {
        id: Date.now(),
        type: "Admin",
        sender: "Sistema",
        text: `🚫 ${targetUsername} ha sido bloqueado.`,
      },
    ]);
  };

  const handleUnbanUser = (targetUsername: string) => {
    if (!isMasterAdmin) return;
    setBannedAdminsOrUsers((prev) => prev.filter((u) => u !== targetUsername));
    socket.emit("unban_user", { username: targetUsername });
    setToasts((t) => [
      ...t,
      {
        id: Date.now(),
        type: "Admin",
        sender: "Sistema",
        text: `✅ ${targetUsername} ha sido desbloqueado.`,
      },
    ]);
  };

  const getHandledNotifIds = (username: string): Set<string> => {
    try {
      const raw = localStorage.getItem(`chatliz_handled_notifs_${username}`);
      return raw ? new Set(JSON.parse(raw)) : new Set();
    } catch {
      return new Set();
    }
  };

  const markNotificationAsHandled = (id?: string, extraKey?: string) => {
    if (!user?.username) return;
    try {
      const set = getHandledNotifIds(user.username);
      if (id) set.add(id);
      if (extraKey) set.add(extraKey);
      const arr = Array.from(set).slice(-300);
      localStorage.setItem(`chatliz_handled_notifs_${user.username}`, JSON.stringify(arr));
    } catch (e) {}
  };

  const handleClearNotifications = () => {
    setBellNotifications([]);
    bellNotifications.forEach((n) => {
      markNotificationAsHandled(n.id, n.sender);
      if (db && n.id && !n.id.startsWith("local_")) {
        updateDoc(doc(db, "notifications", n.id), { isRead: true }).catch(() => {});
      }
    });
    if (db && user?.username) {
      const q = query(
        collection(db, "notifications"),
        where("recipientUid", "==", user.username)
      );
      getDocs(q).then((snap) => {
        snap.forEach((d) => {
          updateDoc(d.ref, { isRead: true }).catch(() => {});
        });
      }).catch(() => {});
    }
  };

  const handleDismissNotification = (notifId: string) => {
    setBellNotifications((prev) => prev.filter((n) => n.id !== notifId));
    markNotificationAsHandled(notifId);
    if (db && notifId && !notifId.startsWith("local_")) {
      updateDoc(doc(db, "notifications", notifId), { isRead: true }).catch(() => {});
    }
  };

  const handleSetGlobalBackground = (url: string) => {
    try {
      localStorage.setItem("chatliz_app_default_bg", url);
      setGlobalChatConfig((prev) => ({
        ...prev,
        backgroundUrl: url,
        backgroundBase64: url,
      }));
      socket.emit("change_global_chat_config", {
        backgroundUrl: url,
        backgroundBase64: url,
      });
      if (db) {
        setDoc(doc(db, "settings", "globalBg"), { url, updatedAt: Date.now() }, { merge: true }).catch(() => {});
      }
      window.dispatchEvent(new Event("chatliz_ui_update"));
    } catch (e) {
      console.error("Error setting global background:", e);
    }
  };

  const handleAcceptFriendRequest = (req: FriendRequest) => {
    // 1. Remove from pending and bell notifications
    setPendingFriendRequests((prev) => prev.filter((r) => r.id !== req.id && r.from !== req.from));
    setBellNotifications((prev) =>
      prev.filter((n) => !(n.type === "friend_request" && (n.sender === req.from || n.id === req.id)))
    );

    // 2. Add to friends state
    setMyFriends((prev) => {
      if (prev.some((f) => f.username === req.from)) return prev;
      return [{ username: req.from, profilePic: req.fromPic, addedAt: Date.now() }, ...prev];
    });

    // 3. Update user object friends_list and remove from friend_requests
    setUser((prev) => {
      const cur = prev.friends_list || [];
      const updated = cur.includes(req.from) ? cur : [...cur, req.from];
      return {
        ...prev,
        friends_list: updated,
        friend_requests: (prev.friend_requests || []).filter((r) => r !== req.from),
      };
    });

    // 4. Mark as handled locally
    markNotificationAsHandled(req.id, `fr_${req.from}`);

    // 5. Emit socket events (both respond and accept for full sync)
    socket.emit("respond_friend_request", {
      to: req.from,
      from: user.username,
      status: "accepted",
    });
    socket.emit("accept_friend_request", req.from);

    // 6. Persist in Firestore
    if (db) {
      if (req.id && !req.id.startsWith("local_")) {
        updateDoc(doc(db, "notifications", req.id), { isRead: true }).catch(() => {});
      }
      const qReq = query(
        collection(db, "friendRequests"),
        where("from", "==", req.from),
        where("to", "==", user.username)
      );
      getDocs(qReq).then((snap) => {
        snap.forEach((d) => {
          updateDoc(d.ref, { status: "accepted", isRead: true }).catch(() => {});
        });
      }).catch(() => {});
    }

    setToasts((t) => [
      ...t,
      {
        id: Date.now(),
        type: "Amigo",
        sender: req.from,
        text: `¡Ahora eres amigo de ${req.from}!`,
      },
    ]);
  };

  const handleRejectFriendRequest = (req: FriendRequest) => {
    // 1. Remove from pending and bell notifications
    setPendingFriendRequests((prev) => prev.filter((r) => r.id !== req.id && r.from !== req.from));
    setBellNotifications((prev) =>
      prev.filter((n) => !(n.type === "friend_request" && (n.sender === req.from || n.id === req.id)))
    );

    // 2. Remove from user object
    setUser((prev) => ({
      ...prev,
      friend_requests: (prev.friend_requests || []).filter((r) => r !== req.from),
    }));

    // 3. Mark as handled locally
    markNotificationAsHandled(req.id, `fr_${req.from}`);

    // 4. Emit socket event
    socket.emit("respond_friend_request", {
      to: req.from,
      from: user.username,
      status: "rejected",
    });

    // 5. Persist in Firestore
    if (db) {
      if (req.id && !req.id.startsWith("local_")) {
        updateDoc(doc(db, "notifications", req.id), { isRead: true }).catch(() => {});
      }
      const qReq = query(
        collection(db, "friendRequests"),
        where("from", "==", req.from),
        where("to", "==", user.username)
      );
      getDocs(qReq).then((snap) => {
        snap.forEach((d) => {
          updateDoc(d.ref, { status: "rejected", isRead: true }).catch(() => {});
        });
      }).catch(() => {});
    }
  };

  const handleRemoveFriend = (targetUsername: string) => {
    setMyFriends((prev) => prev.filter((f) => f.username !== targetUsername));
    setUser((prev) => ({
      ...prev,
      friends_list: (prev.friends_list || []).filter((f) => f !== targetUsername),
    }));
    socket.emit("remove_friend", targetUsername);
  };

  const openUserProfileByName = (targetUsername: string) => {
    const found = usersOnline.find((u) => u.username.toLowerCase() === targetUsername.toLowerCase());
    if (found) {
      setSelectedUserModal(found as any);
    } else {
      socket.emit("get_user_info", { username: targetUsername }, (res: any) => {
        if (res?.user) {
          setSelectedUserModal(res.user);
        } else {
          setSelectedUserModal({ username: targetUsername } as any);
        }
      });
    }
  };

  const handleOpenPrivateChatWith = (targetUsername: string) => {
    changeChat(targetUsername);
    closeAllModals();
  };

  const [replyingTo, setReplyingTo] = useState<MessageObj | null>(null);
  const [reactionMenuId, setReactionMenuId] = useState<string | null>(null);
  const reactionTimerRef = useRef<any>(null);

  const handleReaction = async (msgId: string, docId: string | undefined, emoji: string) => {
    setReactionMenuId(null);
    playReactionSound(emoji);
    
    // Add optimistic UI reaction
    setMessages(prev => prev.map(m => {
        if ((m.id && m.id === msgId) || (m.docId && m.docId === docId)) {
            const currentReactions = m.reactions || {};
            const reactionUsers = Array.isArray(currentReactions[emoji]) ? currentReactions[emoji] : [];
            if (!reactionUsers.includes(user.username)) {
               return {
                   ...m,
                   reactions: {
                       ...currentReactions,
                       [emoji]: [...reactionUsers, user.username]
                   }
               };
            }
        }
        return m;
    }));

    if (docId) {
        try {
            const msgRef = doc(db, "globalMessages", docId);
            const snap = await getDoc(msgRef);
            if (snap.exists()) {
                await updateDoc(msgRef, {
                    [`reactions.${emoji}`]: arrayUnion(user.username)
                });
            }
        } catch (e) {
            console.error("Error updating reaction in Firestore:", e);
        }
    }
    if (socket) {
        socket.emit("message_reaction", { msgId, emoji, activeChat, docId, username: user.username });
    }
  };
  const handleSendMessage = () => {
    const inputValue = inputRef.current?.value || "";
    if (!inputValue.trim() && !selectedImage && !audioUrl && !selectedGif && !selectedFile)
      return;

    const msgId =
      Date.now().toString() + Math.random().toString(36).substr(2, 5);
    const payload: any = { text: inputValue, id: msgId };
    if (selectedImage) payload.image = selectedImage;
        if (selectedGif) payload.image = selectedGif;
    if (selectedFile) {
      if (selectedFile.type.startsWith('video/')) {
        payload.video = selectedFile.url;
      } else {
        payload.file = selectedFile;
      }
    }
    if (audioUrl) payload.audio = audioUrl;
    if (replyingTo) {
      payload.replyTo = {
        id: replyingTo.id,
        sender: replyingTo.sender,
        text: replyingTo.text,
      };
    }

    const msgData = {
      ...payload,
      sender: user.username,
      senderId: user.username,
      timestamp: Date.now(),
      createdAt: Date.now(),
    };
    if (activeChat === "global") {
      setMessages((prev) => [...prev, msgData]);
      setTimeout(
        scrollToBottom,
        100,
      );
      socket.emit("send_global", payload);
    } else {
      // Use the server to send private messages so moderation, bots, and socket events work properly.
      // Optimistic UI for private messages
      setMessages((prev) => [...prev, msgData]);
      setTimeout(
        scrollToBottom,
        100,
      );
      socket.emit("send_private", payload, activeChat, (res: any) => {
        if (res && !res.success) {
          alert(res.error || "Error al enviar el mensaje.");
        } else {
          notifyOwner(activeChat, "MESSAGE", user.username);
        }
      });
    }

    socket.emit("stop_typing", { username: user.username, chat: activeChat });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Destrucción total del bucle y limpieza drástica
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.onstop = null; // Remove the listener
      mediaRecorderRef.current.stop();
    }
    if (recordingStream) {
      recordingStream.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
    setRecordingStream(null);

    // Limpieza inmediata del input para evitar sensación de "congelamiento"
    if (inputRef.current) inputRef.current.value = "";
    setSelectedImage(null);
    setSelectedGif(null);
    setAudioUrl(null);
    setShowEmojiPicker(false);
    setReplyingTo(null);
  };

  
  const handleGeneralFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo es demasiado grande (máx 5MB).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedFile({
          name: file.name,
          type: file.type,
          url: event.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1000;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
          setSelectedImage(dataUrl);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 44100,
          echoCancellation: true,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const options = {
        audioBitsPerSecond: 128000,
      };

      let mimeType = "audio/webm;codecs=opus";
      if (MediaRecorder.isTypeSupported("audio/mp4;codecs=mp4a.40.2")) {
        mimeType = "audio/mp4;codecs=mp4a.40.2";
      } else if (
        !MediaRecorder.isTypeSupported(mimeType) &&
        MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
      ) {
        mimeType = "audio/ogg;codecs=opus";
      }

      // If real-time voice modulation is enabled, route stream through AudioContext
      let recordStream = stream;
      if (voiceModulatorConfig.enabled) {
        try {
          const engine = getGlobalVoiceModulator();
          const { modulatedStream } = engine.connectStream(stream, voiceModulatorConfig);
          recordStream = modulatedStream;
        } catch (modErr) {
          console.warn("AudioContext stream modulation fallback to direct stream:", modErr);
        }
      }

      mediaRecorderRef.current = new MediaRecorder(recordStream, {
        mimeType,
        ...options,
      });
      setRecordingStream(stream);
      audioChunks.current = [];
      mediaRecorderRef.current.ondataavailable = (e) =>
        audioChunks.current.push(e.data);
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: mimeType });
        setRecordedAudioBlob(blob);
        setShowVoiceRecorderPreview(true);
        try {
          getGlobalVoiceModulator().disconnect();
        } catch {}
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      alert("Error al acceder al micrófono");
    }
  };

  const handleSendAudioVoice = (dataUrl: string) => {
    if (!dataUrl) return;
    const msgId = Date.now().toString();
    const payload = {
      id: msgId,
      audio: dataUrl,
      text: "",
      sender: user.username,
      senderPic: user.profilePic || "",
      timestamp: Date.now(),
      createdAt: Date.now(),
      room: activeChat,
    };
    if (activeChat === "global") {
      setMessages((prev) => [...prev, payload]);
      setTimeout(scrollToBottom, 100);
      socket.emit("send_global", payload);
    } else {
      setMessages((prev) => [...prev, payload]);
      setTimeout(scrollToBottom, 100);
      socket.emit("send_private", payload, activeChat, (res: any) => {
        if (res && !res.success) {
          alert(res.error || "Error al enviar el audio.");
        }
      });
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (recordingStream) {
      recordingStream.getTracks().forEach((t) => t.stop());
    }
    try {
      getGlobalVoiceModulator().disconnect();
    } catch {}
    setIsRecording(false);
    setRecordingStream(null);
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    if (isFirstTimeSetup) {
      return <FirstTimeSetupModal user={user} onComplete={handleFirstTimeSetup} />;
    }
    return (
      <>
        <WelcomeLanding
          handleGoogleLogin={handleGoogleLogin}
          user={user}
          setUser={setUser}
          handleLogin={handleLogin}
          setRecoveryModalOpen={setRecoveryModalOpen}
        />
        {recoveryModalOpen && (
          <RecoveryModal
            recoveryStep={recoveryStep}
            recoveryEmail={recoveryEmail}
            setRecoveryEmail={setRecoveryEmail}
            setRecoveryStep={setRecoveryStep}
            recoveryUsername={recoveryUsername}
            setRecoveryUsername={setRecoveryUsername}
            recoveryCodeStr={recoveryCodeStr}
            setRecoveryCodeStr={setRecoveryCodeStr}
            inputRecoveryCode={inputRecoveryCode}
            setInputRecoveryCode={setInputRecoveryCode}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            setRecoveryModalOpen={setRecoveryModalOpen}
          />
        )}
      </>
    );
  }

  return (
    <div
      className="text-white flex flex-col font-sans relative overflow-hidden"
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        backgroundColor: "#18181b", // Cyberpunk Dark
        "--neon-color": isRainbowNeon ? undefined : neonColor,
      } as React.CSSProperties}
    >
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm cursor-pointer"
          onClick={() => setExpandedImage(null)}
        >
          <img 
            src={expandedImage} 
            alt="Expanded view" 
            className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200" 
          />
          <button 
            className="absolute top-6 right-6 text-white/50 hover:text-white bg-black/50 p-2 rounded-full transition-colors"
            onClick={(e) => { e.stopPropagation(); setExpandedImage(null); }}
          >
            <X size={24} />
          </button>
        </div>
      )}

      {isRainbowNeon && (
        <style>{`
          @keyframes rainbow-neon {
            0% { --neon-color: #ff0000; }
            17% { --neon-color: #ff00ff; }
            33% { --neon-color: #0000ff; }
            50% { --neon-color: #00ffff; }
            67% { --neon-color: #00ff00; }
            83% { --neon-color: #ffff00; }
            100% { --neon-color: #ff0000; }
          }
          .cyberpunk-neon {
            animation: rainbow-neon 5s linear infinite;
          }
        `}</style>
      )}
      
      {/* Top Navigation Bar */}
      <nav className="flex items-center justify-between px-4 py-3 shrink-0 z-[100] relative w-full bg-[#18181b] border-b border-[#27272a]">
        <div className="flex-1 flex items-center justify-start gap-4">
          <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
             className="relative p-1 text-gray-300 hover:text-white transition-colors"
          >
             <Menu size={26} strokeWidth={2.5} />
             <div className="absolute top-1 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#18181b]" />
          </button>
        </div>

        <div className="flex-1 flex justify-center"></div>

        <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4 text-gray-300">
           {/* Admin Shield Button: Only for AXISS, Axiss, and delegated admins */}
           {isUserAdmin && (
             <button
               onClick={() => {
                 closeAllModals();
                 setIsAdminPanelOpen(true);
               }}
               className="p-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(239,68,68,0.25)]"
               title="Panel Oculto de Administrador (AXISS/Axiss)"
             >
               <ShieldAlert size={19} className="text-red-400 animate-pulse" />
               <span className="hidden sm:inline text-xs font-bold font-mono tracking-wider">ADMIN</span>
             </button>
           )}

           <button className="hover:text-white transition-colors hidden sm:block"><Calendar size={22} /></button>

           {/* Buzón (MessageSquare) */}
           <button
             onClick={() => {
               setMailboxItems(prev => prev.map(m => ({ ...m, read: true })));
               closeAllModals();
               setIsMailboxModalOpen(true);
             }}
             className="relative hover:text-white transition-colors p-1"
             title="Buzón de Mensajes y Menciones"
           >
             <MessageSquare size={22} />
             {mailboxItems.filter(m => !m.read).length > 0 && (
               <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-purple-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-[#18181b]">
                 {mailboxItems.filter(m => !m.read).length}
               </span>
             )}
           </button>

           {/* Amigos (UserPlus) */}
           <button
             onClick={() => {
               closeAllModals();
               setIsFriendsModalOpen(true);
             }}
             className="relative hover:text-white transition-colors p-1"
             title="Lista de Amigos y Solicitudes"
           >
             <UserPlus size={22} />
             {pendingFriendRequests.length > 0 && (
               <>
                 <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#18181b] animate-ping" />
                 <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full border-2 border-[#18181b]" />
               </>
             )}
           </button>

           {/* Campanita de Notificaciones (Bell) */}
           <button
             onClick={() => {
               setBellNotifications(prev => prev.map(n => ({ ...n, read: true })));
               closeAllModals();
               setIsNotificationBellOpen(true);
             }}
             className="relative hover:text-white transition-colors p-1"
             title="Notificaciones (Likes, Corazones y Mensajes)"
           >
             <Bell size={22} />
             {bellNotifications.filter(n => !n.read).length > 0 && (
               <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-pink-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-[#18181b]">
                 {bellNotifications.filter(n => !n.read).length}
               </span>
             )}
           </button>

           <button onClick={() => setIsConfigOpen(true)} className="relative hover:opacity-80 transition-opacity">
             <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden border border-white/10">
               {user.profilePic ? <img src={user.profilePic} className="w-full h-full object-cover" /> : <User size={18} />}
             </div>
             <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-yellow-500 rounded-full border-2 border-[#18181b] flex items-center justify-center">
             </div>
           </button>
        </div>
      </nav>

      <div className="flex flex-1 h-0 relative">
        {/* Sidebar Principal */}
        <aside
          className={`w-[280px] shrink-0 border-r border-white/5 bg-[#0a0a0c] border-r border-white/10 absolute md:relative z-40 h-full flex flex-col transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
          <div className="p-4 flex flex-col items-center border-b border-white/5">
            <div
              className="relative mb-3 group cursor-pointer"
              onClick={() => {
                closeAllModals();
                setIsConfigOpen(true);
              }}
            >
              <div className="w-20 h-20 rounded-full border-[3px] border-[#D4AF37] shadow-[0_4px_24px_rgba(0,0,0,0.4)]">
                <Avatar
                  src={
                    user.profilePic ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                  }
                  frameId={user.frameId}
                  alt={user.username}
                  className="w-full h-full"
                />
              </div>
              {user.activeDecoration && (
                <div className="absolute inset-0 pointer-events-none scale-125 z-10 flex items-center justify-center">
                  <img
                    referrerPolicy="no-referrer"
                    src={user.activeDecoration}
                    alt="marco"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-[3px] border-[#121B2A]"></div>
            </div>
            <h2 className="text-white font-bold text-lg flex items-center gap-1.5">
              {user.username}{" "}
              {user?.username?.toUpperCase() === "AXISS" && (
                <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                  Admin
                </span>
              )}
            </h2>
            <p className="text-white/50 text-xs">Conectado(a)</p>
          </div>

          {/* Cuerpo del Sidebar - Completamente scrolleable para navegar salas, IAs y usuarios conectados */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin flex flex-col">
            <div className="px-4 mt-2">
              <button
                className={`w-full flex items-center justify-center gap-2 text-cyan-400 bg-cyan-500/10 border ${isFriendReqOpen ? "border-cyan-500/50" : "border-cyan-500/20"} px-3 py-2 rounded-2xl hover:bg-cyan-500/20 transition-all text-sm font-medium`}
                onClick={() => {
                  closeAllModals();
                  setIsFriendReqOpen(!isFriendReqOpen);
                }}
              >
                <UserPlus size={16} strokeWidth={1.5} />
                Solicitudes de Amistad
                {(user?.friend_requests && user.friend_requests.length > 0) && (
                  <span className="bg-cyan-500 text-black text-xs font-bold px-2 py-0.5 rounded-full ml-1">{user.friend_requests.length}</span>
                )}
              </button>
            </div>

            {(user?.role === "admin" || user?.username?.toUpperCase() === "AXISS") && (
              <>
              <div className="px-4 mt-2 grid grid-cols-2 gap-2">
                <button
                  className={`flex items-center justify-center gap-2 text-red-400 bg-red-500/10 border ${isBannedListOpen ? "border-red-500/50" : "border-red-500/20"} px-3 py-2 rounded-2xl hover:bg-red-500/20 transition-all text-sm font-medium`}
                  onClick={() => {
                    closeAllModals();
                    socket.emit("get_banned_users", (list: any) => setBannedList(list));
                    setIsBannedListOpen(!isBannedListOpen);
                  }}
                >
                  <ShieldAlert size={16} strokeWidth={1.5} />
                  Baneados
                </button>
                <button
                  className={`flex items-center justify-center gap-2 text-orange-400 bg-orange-500/10 border ${isReportsListOpen ? "border-orange-500/50" : "border-orange-500/20"} px-3 py-2 rounded-2xl hover:bg-orange-500/20 transition-all text-sm font-medium`}
                  onClick={() => {
                    closeAllModals();
                    socket.emit("get_reports", (list: any) => setReportsList(list));
                    setIsReportsListOpen(!isReportsListOpen);
                  }}
                >
                  <AlertTriangle size={16} strokeWidth={1.5} />
                  Reportes
                </button>
                
                <button
                  className="flex items-center justify-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-2xl hover:bg-red-500/20 transition-all text-sm font-medium"
                  onClick={() => {
                    if(window.confirm("¿Estás seguro de limpiar el chat global? Esta acción no se puede deshacer.")) {
                      socket.emit("clear_global_chat");
                    }
                  }}
                >
                  <Trash2 size={16} strokeWidth={1.5} />
                  Limpiar Global
                </button>
                <button
                  className="flex items-center justify-center gap-2 text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-2xl hover:bg-blue-500/20 transition-all text-sm font-medium"
                  onClick={() => {
                    closeAllModals();
                    setBgModalMode("global");
                    setIsBgModalOpen(true);
                  }}
                  title="Configurar Fondo Global con Video, GIF, Imagen o YouTube"
                >
                  <ImageIcon size={16} strokeWidth={1.5} />
                  Fondo Global
                </button>
              </div>
              </>
            )}
            {user?.username?.toUpperCase() === "AXISS" && (
              <div className="px-4 mt-2">
                <button
                  className={`w-full flex items-center justify-center gap-2 text-green-400 bg-green-500/10 border ${isMonetizationOpen ? "border-green-500/50" : "border-green-500/20"} px-3 py-2 rounded-2xl hover:bg-green-500/20 transition-all text-sm font-medium`}
                  onClick={() => {
                    closeAllModals();
                    socket.emit("get_monetization_stats", (stats: any) => setMonetizationStats(stats));
                    setIsMonetizationOpen(!isMonetizationOpen);
                  }}
                >
                  <DollarSign size={16} strokeWidth={1.5} />
                  Ingresos SDK
                </button>
              </div>
            )}

            <div className="w-full h-px bg-white/5 my-2"></div>

            {/* Salas */}
            <div className="px-4 py-1 flex flex-col gap-1.5">
              <button
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${activeChat === "global" ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]" : "bg-transparent text-white/50 hover:bg-white/10 hover:text-white transition-all"}`}
                onClick={() => {
                  closeAllModals();
                  setIsSidebarOpen(false);
                  setActiveChat("global");
                }}
              >
                <div className="flex items-center gap-2">
                  <Globe size={18} className={activeChat === "global" ? "animate-pulse" : ""} />
                  Sala Global
                </div>
              </button>
              {/* Friends Webcam: Available for all users */}
              <button
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${activeChat === "friends_webcam" ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]" : "bg-transparent text-white/50 hover:bg-white/10 hover:text-white transition-all"}`}
                onClick={() => {
                  closeAllModals();
                  setIsSidebarOpen(false);
                  setActiveChat("friends_webcam");
                }}
              >
                <div className="flex items-center gap-2">
                  <Webcam size={18} className={activeChat === "friends_webcam" ? "animate-pulse" : ""} />
                  Friends Webcam
                </div>
              </button>
              <button
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold transition-all ${activeChat === "custom_rooms" ? "bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]" : "bg-transparent text-white/50 hover:bg-white/10 hover:text-white transition-all"}`}
                onClick={() => {
                  closeAllModals();
                  setIsSidebarOpen(false);
                  setActiveChat("custom_rooms");
                }}
              >
                <div className="flex items-center gap-2">
                  <Hash size={18} />
                  Crear Sala
                </div>
              </button>
            </div>

            {/* AI Characters Button */}
            <div className="px-4 py-2">
              <button
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-3 py-2.5 rounded-xl font-bold shadow-lg transition-transform active:scale-95"
                onClick={() => {
                  closeAllModals();
                  setIsAiSelectorOpen(true);
                }}
              >
                <Bot size={18} />
                Personajes IA
              </button>
            </div>

            {/* User Search */}
            <div className="px-4 py-1">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const q = (e.target as any).elements.searchQuery.value.trim();
                  if (q) {
                    socket.emit("search_user", q, (res: any) => {
                      if (res.success) {
                        setSelectedUserModal(res.user);
                      } else {
                        alert("Usuario no encontrado");
                      }
                    });
                  }
                }}
                className="relative"
              >
                <input
                  name="searchQuery"
                  type="text"
                  placeholder="Buscar por UID o Nombre..."
                  className="w-full bg-[#12141c] text-sm text-white px-3 py-2 pl-8 rounded-xl border border-white/10 focus:border-[#D4AF37] focus:outline-none placeholder-gray-500"
                />
                <Search
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500"
                  size={14}
                />
              </form>
            </div>

            {/* Conectados Header */}
            <div className="px-4 pt-3 pb-1 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users size={14} className="text-cyan-400" />
                Conectados ({usersOnline.filter((u) => !["Elizabeth", "Sensei", "Shadow", "Neko"].includes(u.username)).length})
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>

            {/* Users List */}
            <div className="px-4 py-1 space-y-2">
              {usersOnline.map((u) => {
                if (
                  ["Elizabeth", "Sensei", "Shadow", "Neko"].includes(u.username)
                )
                  return null;
                return (
                  <div
                    key={u.username}
                    className="bg-white/[0.03] border border-white/10 backdrop-blur-md hover:border-white/20 rounded-xl p-3 flex flex-col gap-2 relative overflow-hidden group cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => {
                      closeAllModals();
                      setSelectedUserModal(u as any);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-white/10 flex-shrink-0 relative">
                        <Avatar
                          src={
                            u.profilePic ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`
                          }
                          frameId={u.frameId}
                          alt={u.username}
                          className="w-full h-full"
                        />
                        {u.activeDecoration && (
                          <div className="absolute inset-0 pointer-events-none scale-125 z-10 flex items-center justify-center">
                            <img
                              referrerPolicy="no-referrer"
                              src={u.activeDecoration}
                              alt="marco"
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold text-sm truncate flex items-center gap-1.5">
                          {u.username}{" "}
                          {u.username.toUpperCase() === "AXISS" && (
                            <span className="bg-red-500/20 text-red-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                              Admin
                            </span>
                          )}
                        </p>
                        <p className="text-white/50 text-xs truncate">
                          En línea
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pie de Políticas y Términos para Google AdSense */}
            <div className="mt-auto p-2.5 border-t border-white/5 bg-black/40 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[11px] text-white/50">
              <button
                onClick={() => {
                  setLegalTab("privacy");
                  setLegalModalOpen(true);
                }}
                className="hover:text-cyan-300 transition-colors"
              >
                Privacidad
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setLegalTab("terms");
                  setLegalModalOpen(true);
                }}
                className="hover:text-cyan-300 transition-colors"
              >
                Términos
              </button>
              <span>•</span>
              <button
                onClick={() => {
                  setLegalTab("contact");
                  setLegalModalOpen(true);
                }}
                className="hover:text-cyan-300 transition-colors"
              >
                Contacto
              </button>
            </div>
          </div>
        </aside>
        {/* Main Chat Container */}
        <main
          className="flex-1 min-w-0 min-h-0 relative flex flex-col bg-transparent overflow-hidden"
        >
          {chatBg && <UniversalBackground url={chatBg} />}

          {/* Chat Content Wrapper */}
          <div className="flex-1 min-h-0 min-w-0 flex flex-col relative z-0">
            <div className="hidden"></div>

            
            {activeChat === "friends_webcam" ? (
                <FriendsWebcam user={user} onClose={() => setActiveChat("global")} />
            ) : activeChat === "custom_rooms" ? (
                <CustomRooms user={user} onJoinRoom={(roomId, roomData) => {
                    setActiveChat("room_" + roomId);
                }} />
            ) : activeChat === "lizgram" ? (

              <SocialFeed user={user} onClose={() => setActiveChat("global")} />
            ) : (
              <>
                {activeChat === "global" ? (
                  <div className="bg-[#0a0a0c]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.25)] text-xl overflow-hidden">
                        {globalChatConfig?.icon ? (
                          globalChatConfig.icon.startsWith("http") || globalChatConfig.icon.startsWith("data:") ? (
                            <img src={globalChatConfig.icon} alt="Emblema" className="w-full h-full object-cover" />
                          ) : (
                            <span>{globalChatConfig.icon}</span>
                          )
                        ) : (
                          <Globe className="text-cyan-400" size={20} />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-lg leading-tight flex items-center gap-2">
                          {globalChatConfig?.title || "Chat Global"}
                          <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30 uppercase tracking-wider font-semibold">
                            COMUNIDAD
                          </span>
                        </span>
                        <span className="text-white/60 text-xs font-medium flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-400 animate-ping inline-block" />
                          <span className="text-green-400">{usersOnline.length} {t('online')}</span>
                          {globalChatConfig?.statusMessage && (
                            <span className="text-cyan-200/90 truncate max-w-[200px] sm:max-w-xs font-semibold">• {globalChatConfig.statusMessage}</span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Opciones de Administración: Limpiador, Hugging Face, Personalizar (Solo visibles para Administradores) */}
                    {isUserAdmin && (
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <button
                          onClick={() => setShowRoomCleanerModal(true)}
                          className={`text-xs sm:text-sm font-bold px-2.5 sm:px-3 py-2 rounded-xl transition-all border flex items-center gap-1.5 shadow-sm active:scale-95 ${
                            messages.length >= 18
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                              : messages.length >= 14
                              ? "bg-amber-500/15 text-amber-300 border-amber-500/35"
                              : "bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25"
                          }`}
                          title="Limpiador de Sala Global"
                        >
                          <Trash2 size={16} className={messages.length >= 18 ? "text-rose-400" : "text-purple-400"} />
                          <span className="hidden sm:inline">Limpiador</span>
                          <span className="px-1.5 py-0.5 rounded-full bg-black/40 text-[11px] font-mono border border-white/10">
                            {messages.length}/20
                          </span>
                        </button>

                        <button
                          onClick={() => setShowSyncToAxisModal(true)}
                          className="text-xs sm:text-sm font-bold text-emerald-300 hover:text-white bg-emerald-500/15 hover:bg-emerald-500/25 px-2.5 sm:px-3 py-2 rounded-xl transition-all border border-emerald-500/35 flex items-center gap-1.5 shadow-sm active:scale-95"
                          title="Pasar nuevas actualizaciones a Hugging Face (chatliz-online-chatliz.hf.space) con tu Token"
                        >
                          <Key size={15} className="text-emerald-400 animate-pulse" />
                          <span className="hidden sm:inline">Pasar a Hugging Face</span>
                          <span className="sm:hidden">Token HF</span>
                        </button>

                        <button
                          onClick={() => setShowChatConfig(true)}
                          className="text-xs sm:text-sm font-bold text-cyan-300 hover:text-white bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-2 rounded-xl transition-all border border-cyan-500/30 flex items-center gap-1.5 shadow-sm"
                          title="Personalizar Chat Global"
                        >
                          <Palette size={16} />
                          <span className="hidden sm:inline">Personalizar</span>
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  (() => {
                    if (activeChat.startsWith("room_")) {
                        return (
                          <div className="bg-[#0a0a0c] border-r border-white/10 border-b border-white/5 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-lg">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => {
                                    socket.emit("leave_custom_room", activeChat);
                                    setActiveChat("custom_rooms");
                                }} 
                                className="text-white/80 hover:bg-white/10 p-2 rounded-full transition-colors mr-1"
                                title="Volver a Salas"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                              </button>
                              <div className="w-10 h-10 rounded-full bg-[#1A2639] border border-white/10 flex items-center justify-center shadow-sm">
                                <Hash className="text-white/80" size={20} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-white font-bold text-lg leading-tight flex items-center gap-1.5">
                                  Sala Personalizada
                                  <span className="text-[10px] bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full border border-orange-500/30 uppercase tracking-wider">
                                    COMUNIDAD
                                  </span>
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                    }

                    const serverAiInfo = usersOnline.find((u) => u.username === activeChat);
                    const aiChar = [
                      "Elizabeth",
                      "Sensei",
                      "Shadow",
                      "Neko",
                    ].includes(activeChat)
                      ? {
                          username: activeChat,
                          profilePic: serverAiInfo?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat}`,
                          statusMessage: serverAiInfo?.statusMessage || "Inteligencia Artificial",
                          isAi: true,
                        }
                      : null;
                    const targetUser =
                      aiChar ||
                      usersOnline.find((u) => u.username === activeChat) ||
                      userCache[activeChat];

                    const isOnline =
                      !!aiChar ||
                      !!usersOnline.find((u) => u.username === activeChat);
                    const avatarUrl =
                      targetUser?.profilePic ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${activeChat}`;

                    return (
                      <div className="bg-[#0a0a0c] border-r border-white/10 border-b border-white/5 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-lg">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setActiveChat(previousChat)} 
                            className="text-white/80 hover:bg-white/10 p-2 rounded-full transition-colors mr-1"
                            title="Volver Atrás"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                          </button>
                          <div
                            className="w-10 h-10 rounded-full bg-[#1A2639] border border-white/10 flex items-center justify-center shadow-sm relative cursor-pointer"
                            onClick={() =>
                              setSelectedUserModal(targetUser as any)
                            }
                          >
                            <Avatar
                              src={avatarUrl}
                              frameId={(targetUser as any)?.frameId}
                              className="w-full h-full"
                              alt="avatar"
                            />
                            <div
                              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1A2639] ${isOnline ? "bg-green-500" : "bg-gray-500"}`}
                            ></div>
                          </div>
                          <div className="flex flex-col">
                            <span
                              className="text-white font-bold text-lg leading-tight flex items-center gap-1.5 cursor-pointer hover:underline"
                              onClick={() =>
                                setSelectedUserModal(targetUser as any)
                              }
                            >
                              {chatConfig?.icon && (
                                <span className="text-base mr-0.5">
                                  {chatConfig.icon.startsWith("http") || chatConfig.icon.startsWith("data:") ? (
                                    <img src={chatConfig.icon} alt="Emblema" className="w-5 h-5 rounded object-cover inline-block" />
                                  ) : (
                                    chatConfig.icon
                                  )}
                                </span>
                              )}
                              {chatConfig?.title || activeChat}{" "}
                              <span className="text-[10px] bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full border border-pink-500/30 uppercase tracking-wider">
                                Privado
                              </span>
                            </span>
                            <span className="text-white/50 text-xs font-medium">
                              {isOnline ? (
                                <span className="text-green-400">{t('online')}</span>
                              ) : (
                                "Desconectado"
                              )}{" "}
                              • {chatConfig?.statusMessage ? chatConfig.statusMessage : `Solo tú y ${activeChat} pueden ver este chat`}
                            </span>
                          </div>
                        </div>
                        {/* Botón de Personalizar: Solo para Administradores */}
                        {isUserAdmin && (
                          <button
                            onClick={() => setShowChatConfig(true)}
                            className="text-sm font-bold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors border border-white/20 flex items-center justify-center mr-2"
                            title="Personalizar este chat"
                          >
                            <Palette size={20} />
                          </button>
                        )}
                        <button
                          onClick={() => setActiveChat("global")}

                          className="text-sm font-bold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors border border-white/20 flex items-center justify-center"
                          title="Chat Global"
                        >
                          <Globe size={20} />
                        </button>
                      </div>
                    );
                  })())}

                {reactionMenuId && (
                  <div
                    className="fixed inset-0 z-40"
                    onPointerDown={() => setReactionMenuId(null)}
                  ></div>
                )}

                {/* Chat Feed */}
                <div className="flex-1 overflow-y-auto px-2 md:px-4 py-2 space-y-1.5 scrollbar-thin">
                  {/* Banner informando limpieza y permitiendo responder directamente al último mensaje */}
                  {activeChat === "global" && messages.length === 1 && (
                    <div className="mx-auto max-w-lg my-3 bg-gradient-to-r from-purple-950/60 via-cyan-950/40 to-purple-950/60 border border-cyan-500/40 rounded-2xl p-3.5 text-center shadow-lg backdrop-blur-md animate-fadeIn">
                      <div className="flex items-center justify-center gap-2 text-cyan-300 font-bold text-xs sm:text-sm mb-1">
                        <Sparkles size={16} className="text-amber-400" />
                        <span>Sala Global Limpia (Límite 20 mensajes)</span>
                      </div>
                      <p className="text-[12px] text-gray-300 leading-snug">
                        Se limpiaron los mensajes anteriores y se conservó el último mensaje de <strong className="text-cyan-300 font-semibold">@{messages[0]?.sender}</strong> para que puedas leerlo y responder de inmediato.
                      </p>
                      <button
                        onClick={() => {
                          setReplyingTo(messages[0]);
                          if (inputRef.current) inputRef.current.focus();
                        }}
                        className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-200 bg-cyan-500/25 hover:bg-cyan-500/40 px-3.5 py-1.5 rounded-xl border border-cyan-400/40 transition-all shadow-sm active:scale-95"
                      >
                        <MessageSquare size={13} />
                        Responder a @{messages[0]?.sender}
                      </button>
                    </div>
                  )}
                  {messages
                    .filter((m) => m && m.sender)
                    .filter((m) => {
                      if (user.blocked_list?.includes(m.sender)) return false;
                      const senderInfo = usersOnline.find(
                        (u) => u.username === m.sender,
                      );
                      if (senderInfo?.blocked_list?.includes(user.username))
                        return false;
                      return true;
                    })
                    .map((m, idx) => {
                      const isLiz = m.sender === "Elizabeth" || m.isAi;
                      const isMe = m.sender === user.username;
                      const safeText = isLiz ? filterOffensiveText(m.text || '') : (m.text || '');
                      const isReplyLiz = m.replyTo && (m.replyTo.sender === "Elizabeth" || ['Sensei', 'Shadow', 'Neko'].includes(m.replyTo.sender));
                      const safeReplyText = m.replyTo ? (isReplyLiz ? filterOffensiveText(m.replyTo.text || '') : (m.replyTo.text || '')) : '';
                      let date = new Date();
                      if (m.timestamp || m.createdAt) {
                        const t = m.timestamp || m.createdAt;
                        if (typeof t === "number") date = new Date(t);
                        else if (t.seconds) date = new Date(t.seconds * 1000);
                        else if (typeof t.toDate === "function")
                          date = t.toDate();
                        else date = new Date(t);
                      }
                      const timeStr = isNaN(date.getTime())
                        ? `10:0${idx % 10}`
                        : activeChat === "global" 
                            ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
                            : date.toLocaleDateString([], { day: '2-digit', month: '2-digit' }) + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                      const senderInfo = isMe
                        ? user
                        : usersOnline.find((u) => u.username === m.sender) ||
                          userCache[m.sender];
                      const decId = senderInfo?.activeDecoration;
                      const decUrl = decId
                        ? DECORATIONS.find((d) => d.id === decId)?.url
                        : null;
                      const avatarUrl =
                        senderInfo?.profilePic ||
                        m.profilePic ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.sender}`;

                      return (
                        <div
                          key={m.id || idx}
                          className={`relative flex ${isMe ? 'justify-end' : 'justify-start'} px-1 md:px-2 group`}
                          style={{ marginBottom: '8px' }}
                          onPointerDown={(e) => {
                            if (e.pointerType === "mouse" && e.button !== 0) return;
                            reactionTimerRef.current = setTimeout(() => setReactionMenuId(m.id || idx.toString()), 500);
                          }}
                          onPointerUp={() => clearTimeout(reactionTimerRef.current)}
                          onPointerMove={() => clearTimeout(reactionTimerRef.current)}
                          onPointerCancel={() => clearTimeout(reactionTimerRef.current)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            setReactionMenuId(m.id || idx.toString());
                          }}
                        >
                          {reactionMenuId === (m.id || idx.toString()) && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full z-50 bg-[#1A2035] border border-[#D4AF37]/40 shadow-2xl rounded-full px-3 py-2 flex gap-2 animate-in fade-in slide-in-from-bottom-2">
                              {EMOTICONS.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReaction(m.id || idx.toString(), m.docId, emoji);
                                  }}
                                  className="text-2xl hover:scale-125 transition-transform origin-bottom"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}

                          <div className={`flex gap-3 max-w-[85%] mt-1.5 group ${isMe ? 'flex-row-reverse' : ''}`}>
                            <div
                              className="relative shrink-0 mt-1 cursor-pointer"
                              onClick={() => senderInfo && setSelectedUserModal(senderInfo)}
                            >
                              <Avatar
                                  src={avatarUrl}
                                  frameId={senderInfo?.frameId}
                                  className={`w-8 h-8 rounded-full border shadow-sm ${m.sender === "Elizabeth" ? "border-white/10" : "border-[#5A52A5]/30 bg-white/5"}`}
                                  alt={m.sender}
                                />
                              {decUrl && (
                                <div className="absolute -inset-3 pointer-events-none z-10 flex items-center justify-center">
                                  <img
                                    referrerPolicy="no-referrer"
                                    src={decUrl}
                                    className={`w-[130%] h-[130%] object-contain filter drop-shadow-sm ${m.sender !== "Elizabeth" ? "opacity-80 mix-blend-multiply" : ""}`}
                                    style={{ imageRendering: "pixelated" }}
                                    alt=""
                                  />
                                </div>
                              )}
                            </div>
                            
                            {(() => {
                                const defaultBubbleColor = isMe ? "rgba(6, 182, 212, 0.15)" : "rgba(255, 255, 255, 0.05)";
                                const defaultTextColor = "#E0E2E5";
                                const defaultBorder = isMe ? "rgba(6, 182, 212, 0.3)" : "rgba(255, 255, 255, 0.1)";
                                const defaultShape = isMe ? "rounded-[20px] rounded-tr-[4px]" : "rounded-[20px] rounded-tl-[4px]";
                                
                                const bColor = senderInfo?.bubbleColor || (m.sender === "Elizabeth" ? "transparent" : defaultBubbleColor);
                                const bBorder = senderInfo?.bubbleBorder || (m.sender === "Elizabeth" ? "rgba(255,255,255,0.1)" : defaultBorder);
                                const bShape = senderInfo?.bubbleShape || (m.sender === "Elizabeth" ? "rounded-[20px]" : defaultShape);
                                const bTexture = senderInfo?.bubbleTexture || (m.sender === "Elizabeth" ? "none" : "none");
                                const isElizabeth = m.sender === "Elizabeth";

                                let shapeClasses = bShape;
                                let textureClasses = "";
                                if (bTexture === "glass") textureClasses = "backdrop-blur-md bg-opacity-30 border-white/20";
                                if (bTexture === "glow") textureClasses = "shadow-[0_0_15px_rgba(255,255,255,0.2)]";
                                if (bTexture === "soap") textureClasses = "backdrop-blur-sm shadow-[0_0_15px_rgba(255,255,255,0.4),inset_0_0_20px_rgba(255,255,255,0.5)] border border-white/40 overflow-visible";
                                if (bTexture === "animals") textureClasses = "overflow-visible";
                                
                                const nameColor = isElizabeth ? "text-pink-400" : "text-cyan-300";
                                const textColor = "text-white/90";
                                const timeColor = "text-white/40";

                                return (
                                  <div 
                                    className={`${shapeClasses} ${textureClasses} px-4 py-2.5 shadow-sm flex flex-col relative min-w-[120px] transition-all`}
                                    style={{ 
                                        backgroundColor: bColor !== "transparent" ? bColor : undefined,
                                        borderWidth: '1px',
                                        borderColor: bBorder !== "transparent" ? bBorder : defaultBorder,
                                        boxShadow: bTexture === "glow" ? `0 0 15px rgba(255,255,255,0.1)` : (isMe ? "0 4px 20px rgba(6,182,212,0.15)" : "0 4px 20px rgba(0,0,0,0.2)"),backdropFilter: "blur(10px)",
                                    }}
                                  >
                                    {bTexture === "soap" && (
                                        <div className="absolute inset-0 rounded-[inherit] pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,154,158,0.2) 0%, rgba(254,207,239,0.2) 99%, rgba(254,207,239,0.2) 100%)', mixBlendMode: 'overlay' }}></div>
                                    )}
                                    {bTexture === "animals" && (
                                        <>
                                          <div className="absolute -top-3 -left-3 text-2xl z-10 animate-bounce pointer-events-none" style={{animationDuration: '2s'}}>🐰</div>
                                          <div className="absolute -bottom-3 -right-3 text-2xl z-10 animate-pulse pointer-events-none">🐱</div>
                                        </>
                                    )}
                                    {!isMe && (
                                      <span
                                        className={`font-semibold ${nameColor} text-[13px] mb-0.5 cursor-pointer hover:text-white transition-colors tracking-wide`}
                                        onClick={() => { if (inputRef.current) inputRef.current.value += `@${m.sender} `; }}
                                      >
                                        {m.sender}
                                      </span>
                                    )}
                                    {m.replyTo && (
                                      <div className={`bg-black/10 border-l-2 border-[#5A52A5]/50 px-2 py-1 mb-1 rounded text-xs italic flex flex-col ${textColor}`}>
                                        <span className="font-bold opacity-80">{m.replyTo.sender}</span>
                                        <span className="truncate opacity-70"><TranslatedText originalText={safeReplyText} senderLanguage={m.replyTo.senderLanguage} userLanguage={user.pais_idioma || 'es'} /></span>
                                      </div>
                                    )}
                                    <div className="flex flex-wrap items-end justify-between gap-2">
                                      <span
                                        className={`${textColor} text-[14px] leading-snug flex-1 cursor-pointer hover:bg-black/5 rounded px-1 transition-colors`}
                                        onClick={() => m.image ? setExpandedImage(m.image) : setReplyingTo(m)}
                                      >
                                        <TranslatedText originalText={safeText} senderLanguage={m.senderLanguage} userLanguage={user.pais_idioma || 'es'} />
                                      </span>
                                      <button
                                        onClick={() => m.image ? setExpandedImage(m.image) : setReplyingTo(m)}
                                        className={`opacity-0 group-hover:opacity-100 transition-opacity ${nameColor} hover:opacity-80 p-1`}
                                        title="Responder"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <polyline points="9 14 4 9 9 4"></polyline>
                                          <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
                                        </svg>
                                      </button>
                                      <span className={`${timeColor} text-[11px] font-mono shrink-0 ml-auto pl-2`}>
                                        {timeStr}
                                      </span>
                                    </div>
                                    {m.image && (
                                      <div className="mt-1.5">
                                        <img
                                          referrerPolicy="no-referrer"
                                          src={m.image}
                                          className="rounded-xl border border-black/10 max-w-full shadow-md h-auto max-h-48 object-contain cursor-pointer hover:opacity-80 relative z-20"
                                          onClick={(e) => { e.stopPropagation(); setExpandedImage(m.image); }}
                                          alt="adjunto"
                                        />
                                      </div>
                                    )}
                                      {m.video && (
                                        <div className="mt-2">
                                          <video src={m.video} controls className="rounded-xl border border-white/20 max-w-full shadow-md h-auto max-h-48 object-contain" />
                                        </div>
                                      )}
                                      {m.file && (
                                        <div className="mt-2 flex">
                                          <a href={m.file.url} download={m.file.name} className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white/80 transition-colors text-sm">
                                            <FileIcon size={18} className="text-cyan-400" />
                                            <span className="truncate max-w-[200px]">{m.file.name}</span>
                                          </a>
                                        </div>
                                      )}

                                    {(m.type === "audio" || m.audio) && (
                                      <div className="w-full mt-1.5">
                                        <PremiumAudioPlayer src={m.audio} styleType={user?.audioVisualizerStyle} color1={user?.audioVisualizerColor1} color2={user?.audioVisualizerColor2} />
                                      </div>
                                    )}
                                    {m.reactions && Object.keys(m.reactions).length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {Object.entries(m.reactions).map(([emoji, users]) => (
                                          <div
                                            key={emoji}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const userList = Array.isArray(users) ? users : Array(users).fill("Usuario anónimo");
                                              alert(`Reacciones ${emoji}: \n${userList.join(", ")}`);
                                            }}
                                            className="bg-black/10 text-xs px-1.5 py-0.5 rounded-full cursor-pointer hover:bg-black/20 transition-colors flex items-center gap-1"
                                            style={{ color: textColor }}
                                            title={Array.isArray(users) ? users.join(", ") : ""}
                                          >
                                            {emoji} {Array.isArray(users) ? users.length : (users as any)}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                            })()}
                          </div>
                        </div>
                      );
                    })}



                  <div ref={bottomRef} className="h-2" />
                </div>

                {/* Input Area */}
                <div className="px-4 py-3 shrink-0 bg-[#18181b] relative z-10 w-full flex flex-col gap-3 pb-[calc(12px+env(safe-area-inset-bottom))]">
                  {typingUsers[activeChat] && typingUsers[activeChat].length > 0 && (
                     <div className="text-gray-400 text-xs italic px-2">Alguien está escribiendo...</div>
                  )}
                  {replyingTo && (
                     <div className="bg-[#27272a] rounded p-2 flex items-center justify-between text-xs text-gray-300 mx-2">
                       <span>Respondiendo a {replyingTo.sender}</span>
                       <button onClick={() => setReplyingTo(null)} className="hover:text-white transition-colors"><X size={14} /></button>
                     </div>
                  )}
                  {(selectedImage || audioUrl || selectedGif) && (
                     <div className="text-xs text-yellow-500 px-2 flex justify-between">
                       <span>Archivo adjunto listo para enviar</span>
                       <button onClick={() => { setSelectedImage(null); setAudioUrl(null); setSelectedGif(null); setSelectedFile(null); }}><X size={14} /></button>
                     </div>
                  )}
                  
                  {/* Active Radio Player Widget */}
                  {isRadioPlaying && (
                    <GlobalRadioPlayer
                      isPlaying={isRadioPlaying}
                      onTogglePlay={() => setIsRadioPlaying(!isRadioPlaying)}
                      onOpenHistory={() => setShowRadioHistory(true)}
                      onToast={(text) => {
                        setToasts((prev) => [
                          ...prev,
                          { id: Date.now() + Math.random(), type: "Radio", sender: "Radio", text },
                        ]);
                      }}
                    />
                  )}

                  {/* Real-time Voice Modulator Panel */}
                  {showVoiceModulator && (
                    <div className="relative">
                      <VoiceModulatorPanel
                        isOpen={showVoiceModulator}
                        onClose={() => setShowVoiceModulator(false)}
                        config={voiceModulatorConfig}
                        onChangeConfig={handleUpdateModulatorConfig}
                      />
                    </div>
                  )}

                  {/* Voice Recording Preview & Voice Emulator */}
                  {showVoiceRecorderPreview && recordedAudioBlob && (
                    <div className="mb-2.5">
                      <VoiceRecorderPreview
                        audioBlob={recordedAudioBlob}
                        onSend={(_processedBlob, dataUrl) => {
                          handleSendAudioVoice(dataUrl);
                          setShowVoiceRecorderPreview(false);
                          setRecordedAudioBlob(null);
                        }}
                        onDiscard={() => {
                          setShowVoiceRecorderPreview(false);
                          setRecordedAudioBlob(null);
                        }}
                      />
                    </div>
                  )}

                  {/* Top Row: Input field and surrounding icons */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button className="text-gray-400 hover:text-white transition-colors hidden sm:block"><Plus size={24} /></button>
                    <button onClick={() => fileInputRef.current?.click()} className="text-gray-400 hover:text-white transition-colors"><Paperclip size={22} /></button>
                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-gray-400 hover:text-white transition-colors"><Smile size={24} /></button>
                    <button className="text-gray-400 hover:text-white transition-colors hidden sm:block"><Volume2 size={24} /></button>
                    
                    <div className="flex-1 flex items-center bg-[#27272a] rounded-full px-4 py-2 relative">
                      <input
                        ref={inputRef}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendMessage();
                        }}
                        className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-sm"
                        placeholder="Type here..."
                        id="chat-input-field"
                        autoComplete="off"
                        spellCheck="false"
                      />
                      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
                      <input type="file" accept="*" className="hidden" ref={generalFileInputRef} onChange={handleGeneralFileSelect} />
                    </div>
                    
                    {/* Voice Modulation AudioContext Controls Toggle Button */}
                    <button
                      type="button"
                      onClick={() => setShowVoiceModulator((prev) => !prev)}
                      className={`relative transition-all p-1.5 rounded-full ${
                        showVoiceModulator
                          ? "bg-cyan-500/25 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)] scale-105"
                          : voiceModulatorConfig.enabled
                          ? "text-cyan-400 hover:text-cyan-300 hover:bg-white/10"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                      title="Modulador de Voz AudioContext: Desliza Frecuencia (Pitch) y Ganancia en tiempo real"
                      id="voice-modulator-btn"
                    >
                      <Sliders size={21} />
                      {voiceModulatorConfig.enabled && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500 border border-[#18181b]"></span>
                        </span>
                      )}
                    </button>

                    <button
                      onClick={toggleRecording}
                      className={`transition-all p-1.5 rounded-full ${
                        isRecording
                          ? "bg-rose-600 text-white animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.8)] scale-110"
                          : "text-gray-400 hover:text-white"
                      }`}
                      title={isRecording ? "Detener grabación y previsualizar" : "Grabar audio con emulador de voz"}
                      id="chat-mic-record-btn"
                    >
                      <Mic size={22} />
                    </button>
                    <button onClick={handleSendMessage} className="text-gray-400 hover:text-white transition-colors"><Send size={24} /></button>
                  </div>

                  {/* Bottom Row: Toolbar */}
                  <div className="flex items-center justify-between text-gray-400 mt-1 px-1">
                    <div className="flex items-center gap-4 sm:gap-5">
                      {/* Radio triangle button under paperclip */}
                      <button
                        onClick={() => {
                          setIsRadioPlaying((prev) => {
                            const next = !prev;
                            setToasts((t) => [
                              ...t,
                              {
                                id: Date.now() + Math.random(),
                                type: "Radio",
                                sender: "Radio",
                                text: next
                                  ? "📻 Radio encendida: Sonando música variada sin alabanzas"
                                  : "Radio pausada",
                              },
                            ]);
                            return next;
                          });
                        }}
                        className={`transition-all p-1 rounded-full flex items-center justify-center ${
                          isRadioPlaying
                            ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)] scale-110"
                            : "hover:text-white text-gray-400"
                        }`}
                        title={isRadioPlaying ? "Pausar Radio" : "Reproducir Radio (Sin alabanzas)"}
                      >
                        {isRadioPlaying ? (
                          <Pause size={22} className="fill-current" />
                        ) : (
                          <Play size={22} className="fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Rotating circular arrow: 30 songs history with MP3 download */}
                      <button
                        onClick={() => setShowRadioHistory(true)}
                        className="hover:text-white transition-colors relative"
                        title="Historial de 30 músicas (Descargar en MP3)"
                      >
                        <RotateCcw size={22} />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-5 sm:gap-6">
                      <button
                        onClick={() => {
                          setToasts((prev) => [
                            ...prev,
                            { id: Date.now() + Math.random(), type: "Radio", sender: "Radio", text: "Modo bucle activo" },
                          ]);
                        }}
                        className="hover:text-white transition-colors"
                        title="Repetición continua"
                      >
                        <Repeat size={22} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {activeChessGame && activeChessGame.isBot && (
        <ChessBotModal
          onClose={() => setActiveChessGame(null)}
          user={user}
          gameId={activeChessGame.gameId}
          opponent={activeChessGame.opponent}
          bet={activeChessGame.bet}
          isHost={activeChessGame.isHost}
        />
      )}

      {activeChessGame && !activeChessGame.isBot && (
        <ChessGameModal
          onClose={() => setActiveChessGame(null)}
          user={user}
          gameId={activeChessGame.gameId || activeChessGame.id}
          opponent={activeChessGame.opponent}
          bet={activeChessGame.bet}
          isHost={activeChessGame.isHost}
        />
      )}

      {/* Monetization Panel */}
      {isMonetizationOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-[#12141c] p-6 rounded-3xl w-full max-w-md shadow-2xl relative border border-green-500/30">
            <button
              onClick={() => setIsMonetizationOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-green-400 mb-6 flex items-center gap-2">
              <DollarSign size={24} /> Panel de Ingresos (Ads)
            </h2>
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Vistas de Anuncios</p>
                        <p className="text-2xl font-black text-white">{monetizationStats.adViews}</p>
                    </div>
                    <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center">
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Ingresos de por Vida</p>
                        <p className="text-2xl font-black text-green-400">${(monetizationStats.lifetimeRevenue || 0).toFixed(2)}</p>
                    </div>
                </div>
                
                <div className="bg-green-500/10 p-5 rounded-2xl border border-green-500/30">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-300 font-bold">Saldo Pendiente:</p>
                        <p className="text-3xl font-black text-green-400">${(monetizationStats.revenuePending || 0).toFixed(2)}</p>
                    </div>
                    <div className="w-full bg-black/50 rounded-full h-3 mb-4 overflow-hidden border border-white/5">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, ((monetizationStats.revenuePending || 0) / 100) * 100)}%` }}></div>
                    </div>
                    <button
                        onClick={() => {
                            socket.emit("withdraw_revenue", (res: any) => {
                                if (res.success) {
                                    alert("Transferencia bancaria iniciada con éxito. Los fondos llegarán en 2-3 días hábiles.");
                                    setMonetizationStats(res.stats);
                                } else {
                                    alert(res.message || "Error al retirar fondos.");
                                }
                            });
                        }}
                        disabled={monetizationStats.revenuePending < 100}
                        className={`w-full flex justify-center items-center gap-2 py-3 rounded-xl font-bold transition-all ${monetizationStats.revenuePending >= 100 ? "bg-green-500 hover:bg-green-400 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)]" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}
                    >
                        <DollarSign size={18} />
                        {monetizationStats.revenuePending >= 100 ? "Retirar a Cuenta Bancaria" : "Se requieren $100 para retirar"}
                    </button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                    Los ingresos son calculados a través del SDK publicitario de videos recompensados.
                </p>
            </div>
          </div>
        </div>
      )}

      {isReportsListOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-orange-500/30 w-full max-w-2xl rounded-2xl p-6 relative shadow-2xl">
            <button
              onClick={() => setIsReportsListOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-orange-400 mb-6 flex items-center gap-2">
              <AlertTriangle size={24} /> Panel de Reportes
            </h2>
            {reportsList.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No hay reportes pendientes.</p>
            ) : (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  {reportsList.map(report => (
                     <div key={report.id} className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <span className="text-gray-400">Reportado por: </span>
                                <span className="font-bold text-cyan-400">{report.reporter}</span>
                                <span className="text-gray-400 mx-2">➡️</span>
                                <span className="text-gray-400">Acusado: </span>
                                <span className="font-bold text-red-400">{report.target}</span>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleString()}</span>
                        </div>
                        <div className="bg-black/40 p-3 rounded-lg text-gray-200 text-sm">
                            <span className="text-gray-400 font-bold block mb-1">Motivo:</span>
                            {report.reason}
                        </div>
                        {report.proofBase64 && (
                            <div>
                                <span className="text-gray-400 font-bold block mb-2 text-sm">Evidencia:</span>
                                <img src={report.proofBase64} alt="Evidencia" className="max-h-64 rounded-lg border border-white/10 object-contain bg-black/50" />
                            </div>
                        )}
                        <div className="flex gap-2 justify-end mt-2">
                            <button
                                onClick={() => {
                                    socket.emit("admin_ban_user", report.target, (res: any) => {
                                        if (res.success) {
                                            alert(`${report.target} ha sido baneado.`);
                                        }
                                    });
                                }}
                                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-bold transition-colors"
                            >
                                Banear Acusado
                            </button>
                            <button
                                onClick={() => {
                                    socket.emit("delete_report", report.id, (res: any) => {
                                        if (res.success) {
                                            setReportsList(prev => prev.filter(r => r.id !== report.id));
                                            alert("Reporte descartado y eliminado.");
                                        }
                                    });
                                }}
                                className="px-4 py-2 bg-gray-500/20 text-gray-300 hover:bg-gray-500/40 rounded-lg text-sm font-bold transition-colors"
                            >
                                Descartar / Resolver
                            </button>
                        </div>
                     </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      )}

      {expandedAvatar && (
        <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setExpandedAvatar(null)}
        >
            <div className="relative max-w-3xl w-full flex items-center justify-center">
                <button 
                    onClick={() => setExpandedAvatar(null)}
                    className="absolute -top-12 right-0 text-white/50 hover:text-white"
                >
                    <X size={32} />
                </button>
                <img 
                    src={expandedAvatar} 
                    alt="Expanded Avatar" 
                    className="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/10 bg-black/50"
                    onClick={(e) => e.stopPropagation()} 
                />
            </div>
        </div>
      )}

      {reportTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-red-500/30 w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
            <button
              onClick={() => setReportTarget(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <ShieldAlert size={24} /> Reportar a {reportTarget}
            </h2>
            <form onSubmit={(e) => {
                e.preventDefault();
                const reason = (e.currentTarget.elements.namedItem('reason') as HTMLTextAreaElement).value;
                const proof = (e.currentTarget.elements.namedItem('proof') as HTMLInputElement).files?.[0];
                if (!reason || !proof) {
                    alert("Por favor adjunta una captura y el motivo.");
                    return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                    socket.emit("report_user", { target: reportTarget, reason, proofBase64: reader.result });
                    alert("Reporte enviado al administrador. Evaluaremos el caso.");
                    setReportTarget(null);
                    setSelectedUserModal(null);
                };
                reader.readAsDataURL(proof);
            }} className="flex flex-col gap-4">
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Motivo del reporte / Acusación</label>
                    <textarea name="reason" rows={3} required placeholder="Explica detalladamente qué sucedió..." className="w-full bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-white focus:border-red-500/50 outline-none" />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Captura de pantalla (Obligatorio)</label>
                    <input type="file" name="proof" accept="image/*" required className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-500/10 file:text-red-400 hover:file:bg-red-500/20" />
                </div>
                <button type="submit" className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-red-500/20">
                    Enviar Reporte
                </button>
            </form>
          </div>
        </div>
      )}

      {isBannedListOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-red-500/30 w-full max-w-md rounded-2xl p-6 relative shadow-2xl">
            <button
              onClick={() => setIsBannedListOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
              <ShieldAlert size={24} /> Usuarios Baneados
            </h2>
            {bannedList.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No hay usuarios baneados actualmente.</p>
            ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                  {bannedList.map(bUser => (
                     <div key={bUser.username} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                           <Avatar src={bUser.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${bUser.username}`} className="w-10 h-10 bg-black/50 rounded-full" alt={bUser.username} />
                           <div>
                              <div className="text-white font-bold">{bUser.username}</div>
                              <div className="text-xs text-red-300">Expira: {new Date(bUser.expiresAt).toLocaleTimeString()}</div>
                           </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    socket.emit("admin_unban_user", bUser.username, (res) => {
                                        if (res.success) {
                                            setBannedList(prev => prev.filter(u => u.username !== bUser.username));
                                            alert(`${bUser.username} fue desbaneado.`);
                                        }
                                    });
                                }}
                                className="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg text-sm font-medium transition-colors"
                            >
                                Desbanear
                            </button>
                            <button
                                onClick={() => {
                                    socket.emit("admin_ban_user", bUser.username, (res) => {
                                        if (res.success) {
                                            socket.emit("get_banned_users", (list) => setBannedList(list));
                                            alert(`${bUser.username} fue baneado (renovado).`);
                                        }
                                    });
                                }}
                                className="px-3 py-1 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-colors"
                                title="Renovar Ban (15 min)"
                            >
                                Bloquear
                            </button>
                        </div>
                     </div>
                  ))}
                </div>
            )}
          </div>
        </div>
      )}

      
        
      <RadioHistoryModal
        isOpen={showRadioHistory}
        onClose={() => setShowRadioHistory(false)}
        songs={radioHistorySongs}
        onPlaySong={(song) => {
          setIsRadioPlaying(true);
          setToasts((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              type: "Radio",
              sender: "Radio",
              text: `🎵 Reproduciendo en la radio: ${song.title}`,
            },
          ]);
        }}
        onToast={(text) => {
          setToasts((prev) => [
            ...prev,
            {
              id: Date.now() + Math.random(),
              type: "Radio",
              sender: "Radio",
              text,
            },
          ]);
        }}
      />

      <ChatCustomizerModal
        isOpen={showChatConfig}
        onClose={() => setShowChatConfig(false)}
        chatId={activeChat === "global" ? "global" : [user.username, activeChat].sort().join("_")}
        chatTitle={activeChat === "global" ? "Chat Global" : activeChat}
        isGlobal={activeChat === "global"}
        currentConfig={activeChat === "global" ? globalChatConfig : chatConfig}
        onSaveConfig={handleSaveChatConfig}
        onResetConfig={handleResetChatConfig}
        onOpenSyncToAxis={() => setShowSyncToAxisModal(true)}
      />

      <SyncToAxisModal
        isOpen={showSyncToAxisModal}
        onClose={() => setShowSyncToAxisModal(false)}
        currentGlobalConfig={globalChatConfig}
        onToast={addSystemToast}
      />

      <BackgroundSelectorModal
        isOpen={isBgModalOpen}
        onClose={() => setIsBgModalOpen(false)}
        currentBg={chatBg}
        isAdmin={user?.role === "admin" || user?.username?.toUpperCase() === "AXISS"}
        defaultMode={bgModalMode}
        onApplyPersonalBg={(url) => {
          if (url) {
            localStorage.setItem("chatliz_personal_bg", url);
            window.dispatchEvent(new CustomEvent("chatliz_personal_bg_changed", { detail: url }));
          } else {
            localStorage.removeItem("chatliz_personal_bg");
            window.dispatchEvent(new CustomEvent("chatliz_personal_bg_changed", { detail: null }));
          }
          setUser((prev) => ({ ...prev, preferred_background: url }));
        }}
        onToast={addSystemToast}
      />
      {isConfigOpen && (
        <ProfileConfigModal
          user={user}
          setUser={setUser}
          setIsConfigOpen={setIsConfigOpen}
          setAdminConfigAiOpen={setAdminConfigAiOpen}
          usersOnline={usersOnline}
          setAiProfileForm={setAiProfileForm}
          customFrames={customFrames}
        />
      )}

      {adminShadersOpen && (
        <AdminShadersModal
          setOpen={setAdminShadersOpen}
          currentShaders={globalShaders}
          onPreview={(shaders) => setPreviewShaders(shaders)}
          onSave={(shaders) => {
             setPreviewShaders(null);
             socket.emit("update_shaders", shaders);
          }}
        />
      )}
      
      {adminConfigAiOpen && isUserAdmin && (
        <AdminConfigAiModal
          aiUsername={currentAdminAi}
          setAdminConfigAiOpen={setAdminConfigAiOpen}
          aiProfileForm={aiProfileForm}
          setAiProfileForm={setAiProfileForm}
        />
      )}

      <LegalAndPrivacyModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        initialTab={legalTab}
      />

      {/* Toasts Notifications */}
      <div className="fixed top-20 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const senderInfo =
            usersOnline.find((u) => u.username === toast.sender) ||
            userCache[toast.sender];
          const senderPic =
            senderInfo?.profilePic ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${toast.sender}`;
          return (
            <div
              key={toast.id}
              onClick={() => {
                setIsSidebarOpen(false);
                setIsFriendsSidebarOpen(false);
                setActiveChat(toast.sender);
                setToasts((prev) => prev.filter((t) => t.id !== toast.id));
              }}
              className="pointer-events-auto cursor-pointer bg-[#0f111a]/95 backdrop-blur-md border border-white/10 shadow-[0_4px_20px_rgba(212,175,55,0.15)] rounded-2xl p-3 flex items-center gap-3 w-72 animate-in fade-in slide-in-from-top-4 transition-all hover:bg-white/5"
            >
              <img
                referrerPolicy="no-referrer"
                src={senderPic}
                alt={toast.sender}
                className="w-10 h-10 rounded-full object-cover border border-white/5"
              />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-white font-bold text-sm truncate">
                  {toast.sender}
                </span>
                <span className="text-gray-400 text-xs truncate">
                  {toast.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected User Info Modal */}

      {incomingCall && (
        <CallModal
          caller={incomingCall}
          onAccept={() => {
            socket.emit("responder_llamada", {
              targetUser: incomingCall.username,
              accepted: true,
            });
            setActiveCall({ partner: incomingCall, isInitiator: false });
            setIncomingCall(null);
          }}
          onReject={() => {
            socket.emit("responder_llamada", {
              targetUser: incomingCall.username,
              accepted: false,
            });
            setIncomingCall(null);
          }}
        />
      )}

      {outgoingCall && (
        <OutgoingCallModal
          partner={outgoingCall}
          onCancel={() => {
            socket.emit("cancelar_llamada", outgoingCall.username);
            setOutgoingCall(null);
          }}
        />
      )}

      {activeCall && (
        <ActiveCallModal
          partner={activeCall.partner}
          isInitiator={activeCall.isInitiator}
          onEndCall={() => {
            setActiveCall(null);
          }}
        />
      )}
      {isAiSelectorOpen && (
        <AiSelectorModal
          usersOnline={usersOnline}
          onClose={() => setIsAiSelectorOpen(false)}
          userCoins={user.lizCoins || 0}
          socket={socket}
          onSelect={(id) => {
            setIsAiSelectorOpen(false);
            setIsSidebarOpen(false);
            setActiveChat(id);
          }}
        />
      )}

      {/* Out of Tokens Modal */}
      {outOfTokensAi && !isWatchingAd && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[130] flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-amber-500/30 p-8 rounded-3xl w-full max-w-sm shadow-2xl relative text-center">
            <button
              onClick={() => setOutOfTokensAi(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-500/20">
               <span className="text-4xl">🪙</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Sin Moneditas!</h2>
            <p className="text-gray-400 text-sm mb-6">
              Te has quedado sin Liz-Moneditas. Para seguir hablando con <span className="font-bold text-amber-400">{outOfTokensAi}</span> y otros personajes, mira un anuncio corto.
            </p>
            <button
              onClick={() => {
                 setIsWatchingAd(true);
                 setAdCountdown(15);
                 const interval = setInterval(() => {
                     setAdCountdown(prev => {
                         if (prev <= 1) {
                             clearInterval(interval);
                             socket.emit("watch_ad_reward", (res: any) => {
                                 if (res.success) {
                                     setUser(prev => ({ ...prev, lizCoins: res.newCoins }));
                                     alert(`¡Felicidades! Has ganado 100 Liz-Moneditas.`);
                                     setOutOfTokensAi(null);
                                     setIsWatchingAd(false);
                                 }
                             });
                             return 0;
                         }
                         return prev - 1;
                     });
                 }, 1000);
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-transform active:scale-95"
            >
              <PlaySquare size={20} />
              Ver Anuncio (Gratis)
            </button>
            <p className="text-xs text-gray-500 mt-4 italic">
              * SDK de publicidad integrado. Apoya al creador de ChatLiz.
            </p>
          </div>
        </div>
      )}

      {/* Ad Player Overlay */}
      {isWatchingAd && (
        <div className="fixed inset-0 bg-black z-[140] flex flex-col items-center justify-center">
          <div className="absolute top-4 left-4 text-white/50 text-sm font-bold bg-black/50 px-3 py-1 rounded-full border border-white/10">
            Anuncio Patrocinado
          </div>
          {adCountdown > 0 ? (
              <div className="absolute top-4 right-4 text-white text-sm font-bold bg-black/50 px-3 py-1 rounded-full border border-white/10">
                La recompensa se entregará en {adCountdown}s
              </div>
          ) : (
              <div className="absolute top-4 right-4 text-green-400 text-sm font-bold bg-black/50 px-3 py-1 rounded-full border border-green-500/30">
                ¡Recompensa lista!
              </div>
          )}
          
          <div className="w-full max-w-3xl aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl relative flex items-center justify-center border border-white/10">
             {/* Simulated Ad Video */}
             <video 
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4" 
                autoPlay 
                muted
                playsInline
                loop
                crossOrigin="anonymous"
                className="w-full h-full object-cover opacity-80"
             />
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-[0_0_15px_rgba(0,0,0,0.8)] text-center px-4">
                     Publicidad SDK<br/><span className="text-amber-500">Demostración</span>
                 </h2>
             </div>
          </div>
          
          <p className="text-white/30 text-xs mt-6 text-center max-w-lg">
             Al visualizar este anuncio estás apoyando a los desarrolladores de la plataforma para mantener los servidores activos y a las IAs gratuitas.
          </p>
        </div>
      )}


      {/* Friend Requests Modal */}
      {isFriendReqOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-[#12141c] p-6 rounded-3xl w-full max-w-sm shadow-2xl relative border border-cyan-500/30">
            <button
              onClick={() => setIsFriendReqOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center justify-center gap-2">
              <UserPlus className="text-cyan-400" /> Solicitudes
            </h2>
            <div className="max-h-64 overflow-y-auto space-y-3">
               {(!user.friend_requests || user.friend_requests.length === 0) ? (
                   <p className="text-center text-gray-500 py-4">No tienes solicitudes pendientes.</p>
               ) : (
                   user.friend_requests.map((reqUsername) => {
                       const reqInfo = usersOnline.find(u => u.username === reqUsername) || userCache[reqUsername];
                       const pic = reqInfo?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reqUsername}`;
                       return (
                           <div key={reqUsername} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                               <div className="flex items-center gap-3">
                                  <img src={pic} className="w-10 h-10 rounded-full border border-cyan-500/30" />
                                  <span className="text-white font-medium">{reqUsername}</span>
                               </div>
                               <div className="flex gap-2">
                                  <button onClick={() => {
                                      socket.emit("accept_friend_request", reqUsername, (res: any) => {
                                          if (res.success) {
                                              setUser(prev => ({ ...prev, friend_requests: prev.friend_requests?.filter(r => r !== reqUsername) || [], friends_list: [...(prev.friends_list || []), reqUsername] }));
                                          }
                                      });
                                  }} className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center hover:bg-green-500/40 font-bold">✓</button>
                                  <button onClick={() => {
                                      socket.emit("reject_friend_request", reqUsername, (res: any) => {
                                          if (res.success) {
                                              setUser(prev => ({ ...prev, friend_requests: prev.friend_requests?.filter(r => r !== reqUsername) || [] }));
                                          }
                                      });
                                  }} className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/40 font-bold">✕</button>
                               </div>
                           </div>
                       );
                   })
               )}
            </div>
          </div>
        </div>
      )}


      {selectedUserModal && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[120] flex items-center justify-center p-4 overflow-y-auto overscroll-none"
          onClick={() => setSelectedUserModal(null)}
          style={{ overscrollBehavior: 'none' }}
        >
          <div
            className="bg-[#0f111a] rounded-[32px] w-full max-w-md shadow-2xl relative overflow-hidden border border-white/10 my-8 mt-16"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cover Photo Area */}
            <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
               <button
                 onClick={() => setSelectedUserModal(null)}
                 className="absolute top-4 right-4 text-white hover:text-white bg-black/50 hover:bg-black/70 p-3 rounded-full transition-all shadow-lg z-50 border border-white/20"
               >
                 <X size={24} strokeWidth={3} />
               </button>
            </div>
            
            <div className="px-6 pb-6 relative">
              {/* Avatar */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                  <div
                    className={`w-32 h-32 rounded-full border-4 border-[#0f111a] relative shadow-lg ${selectedUserModal.isAi && isUserAdmin ? "cursor-pointer group" : ""}`}
                    onClick={() => {
                      if (selectedUserModal.isAi && isUserAdmin) {
                        setAiProfileForm({
                          profilePic: selectedUserModal.profilePic || "",
                          statusMessage: selectedUserModal.statusMessage || "Inteligencia Artificial",
                          systemInstruction: selectedUserModal.systemInstruction || "",
                        });
                        setCurrentAdminAi(selectedUserModal.username);
                        setSelectedUserModal(null);
                        closeAllModals();
                        setAdminConfigAiOpen(true);
                      }
                    }}
                  >
                    <Avatar
                      src={
                        selectedUserModal.profilePic ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUserModal.username}`
                      }
                      frameId={selectedUserModal.frameId}
                      className="w-full h-full bg-white/5"
                      alt={selectedUserModal.username}
                    />
                    {selectedUserModal.isAi && isUserAdmin && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Bot size={24} className="text-white/80 mb-1" />
                        <span className="text-white text-xs font-bold text-center px-2">Configurar IA</span>
                      </div>
                    )}
                  </div>
                  {/* Badge */}
                  <div className="absolute bottom-1 right-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-[#0f111a] shadow-md flex items-center gap-1">
                     <Coins size={10} /> {selectedUserModal.lizCoins || 0}
                  </div>
              </div>

              {/* User Info */}
              <div className="pt-20 text-center">
                <h3 className="text-2xl font-bold text-white flex items-center justify-center gap-2 mb-1">
                  {selectedUserModal.username}
                  {selectedUserModal.role === "admin" && (
                    <span className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold shadow-sm">
                      Admin
                    </span>
                  )}
                </h3>
                
                <div className="flex justify-center items-center gap-2 mb-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Globe size={12}/> {selectedUserModal.pais_idioma || selectedUserModal.countryLanguage || "Global"}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-pink-400"><Heart size={12} className="fill-pink-400"/> {selectedUserModal.profileLikes || 0} Likes</span>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl relative mb-6">
                  <p className="text-gray-300 italic text-sm">
                    "{selectedUserModal.statusMessage || "Disponible"}"
                  </p>
                </div>

                {/* Actions */}
                {selectedUserModal.username === user.username ? (
                  <button
                    onClick={() => {
                       setSelectedUserModal(null);
                       setIsConfigOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-white/10 hover:from-cyan-500 hover:to-blue-500 text-white p-3 rounded-xl font-bold transition-all shadow-lg shadow-cyan-500/20 mb-6"
                  >
                    <Settings size={18} />
                    Configurar Perfil
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <button
                      onClick={() => {
                        window.history.pushState({}, "", "/chat/" + encodeURIComponent(selectedUserModal.username));
                        changeChat(selectedUserModal.username);
                        setSelectedUserModal(null);
                        setIsSidebarOpen(false);
                        notifyOwner(selectedUserModal.username, "CHAT", user.username);
                      }}
                      className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl font-bold transition-colors border border-white/5"
                    >
                      <MessageCircle size={18} /> Chat
                    </button>
                    {(() => {
                      const isAlreadyLiked = Array.isArray(selectedUserModal.profileLikedBy)
                        ? selectedUserModal.profileLikedBy.includes(user.username)
                        : false;
                      return (
                        <button
                          onClick={() => {
                            if (isAlreadyLiked) {
                              // Toggle off
                              setSelectedUserModal((prev) => prev ? {
                                ...prev,
                                profileLikes: Math.max(0, (prev.profileLikes || 1) - 1),
                                profileLikedBy: (prev.profileLikedBy || []).filter((u: string) => u !== user.username)
                              } : null);
                              socket.emit("like_user", selectedUserModal.username, (res: any) => {
                                if (res && res.success) {
                                  setSelectedUserModal((prev) => prev ? {
                                    ...prev,
                                    profileLikes: res.likes,
                                    profileLikedBy: res.likedBy
                                  } : null);
                                }
                              });
                            } else {
                              // Add one like strictly
                              setSelectedUserModal((prev) => prev ? {
                                ...prev,
                                profileLikes: (prev.profileLikes || 0) + 1,
                                profileLikedBy: [...(prev.profileLikedBy || []), user.username]
                              } : null);
                              socket.emit("like_user", selectedUserModal.username, (res: any) => {
                                if (res && res.success) {
                                  setSelectedUserModal((prev) => prev ? {
                                    ...prev,
                                    profileLikes: res.likes,
                                    profileLikedBy: res.likedBy
                                  } : null);
                                }
                              });
                              notifyOwner(selectedUserModal.username, "LIKE", user.username);
                              socket.emit("send_user_like", {
                                to: selectedUserModal.username,
                                from: user.username,
                                fromPic: user.profilePic || "",
                                type: "heart"
                              });
                            }
                          }}
                          className={`flex items-center justify-center gap-2 p-3 rounded-xl font-bold transition-all border ${
                            isAlreadyLiked
                              ? "bg-pink-500 text-white border-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.35)]"
                              : "bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border-pink-500/20"
                          }`}
                        >
                          <Heart size={18} className={isAlreadyLiked ? "fill-current" : ""} />
                          {isAlreadyLiked ? "Te gusta" : "Like"}
                        </button>
                      );
                    })()}
                    
                     {(() => {
                      const isFriend =
                        user.friends_list?.includes(selectedUserModal.username) ||
                        myFriends?.some((f) => f.username === selectedUserModal.username);

                      if (isFriend) {
                        return (
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `¿Estás seguro que quieres eliminar a ${selectedUserModal.username} de tus amigos?`
                                )
                              ) {
                                handleRemoveFriend(selectedUserModal.username);
                                setSelectedUserModal(null);
                              }
                            }}
                            className="col-span-2 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 p-3 rounded-xl font-bold transition-colors"
                          >
                            <UserMinus size={18} /> Eliminar Amigo
                          </button>
                        );
                      }

                      const incomingRequest = pendingFriendRequests.find(
                        (r) => r.from === selectedUserModal.username
                      );

                      if (incomingRequest) {
                        return (
                          <button
                            onClick={() => {
                              handleAcceptFriendRequest(incomingRequest);
                              setSelectedUserModal(null);
                            }}
                            className="col-span-2 flex items-center justify-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 p-3 rounded-xl font-bold transition-colors"
                          >
                            <UserCheck size={18} /> Aceptar Solicitud Pendiente
                          </button>
                        );
                      }

                      return (
                        <button
                          onClick={() => {
                            // Emit real-time socket event
                            socket.emit("send_friend_request", {
                              to: selectedUserModal.username,
                              from: user.username,
                              fromPic: user.profilePic || "",
                            });

                            // Save to Firestore
                            addDoc(collection(db, "friendRequests"), {
                              from: user.username,
                              to: selectedUserModal.username,
                              status: "pending",
                              timestamp: Date.now(),
                              createdAt: Date.now(),
                            })
                              .then((docRef) => {
                                notifyOwner(selectedUserModal.username, "REQUEST", user.username, {
                                  frData: { from: user.username, docId: docRef.id },
                                });
                              })
                              .catch(() => {});

                            setSelectedUserModal(null);
                            alert("✅ Solicitud de amistad enviada correctamente");
                          }}
                          className="col-span-2 flex items-center justify-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 p-3 rounded-xl font-bold transition-colors"
                        >
                          <UserPlus size={18} /> Enviar Solicitud de Amistad
                        </button>
                      );
                    })()}
                  </div>
                )}

                {/* Friends List Section */}
                <div className="bg-[#1a1d2d] rounded-2xl overflow-hidden mb-6 border border-white/5 text-left">
                   <div className="p-4 bg-white/5 border-b border-white/5 flex items-center gap-2">
                       <Users size={16} className="text-cyan-400" />
                       <h4 className="font-bold text-white text-sm">{t('friends')}</h4>
                   </div>
                   <div className="p-4 max-h-40 overflow-y-auto space-y-3">
                       {selectedUserModal.username === user.username || selectedUserModal.is_friends_public ? (
                           (selectedUserModal.username === user.username ? user.friends_list : selectedUserModal.friends_list)?.length ? (
                               (selectedUserModal.username === user.username ? user.friends_list : selectedUserModal.friends_list)?.map(friend => {
                                   const fInfo = usersOnline.find(u => u.username === friend) || userCache[friend];
                                   const fPic = fInfo?.profilePic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend}`;
                                   return (
                                       <div key={friend} className="flex items-center justify-between group">
                                           <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                                               if (fInfo) setSelectedUserModal(fInfo);
                                           }}>
                                               <img src={fPic} className="w-8 h-8 rounded-full bg-black/50 object-cover" />
                                               <span className="text-gray-300 text-sm font-medium hover:text-white transition-colors">{friend}</span>
                                           </div>
                                           {selectedUserModal.username === user.username && (
                                               <button onClick={() => {
                                                   if (window.confirm(`¿Estás seguro que quieres eliminar a ${friend} de tus amigos?`)) {
                                                      socket.emit("remove_friend", friend);
                                                      setUser(prev => ({ ...prev, friends_list: prev.friends_list?.filter(f => f !== friend) }));
                                                   }
                                               }} className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1">
                                                   <Trash2 size={16} />
                                               </button>
                                           )}
                                       </div>
                                   );
                               })
                           ) : (
                               <p className="text-sm text-gray-500 italic text-center">No hay amigos en la lista.</p>
                           )
                       ) : (
                           <p className="text-sm text-gray-500 italic text-center">La lista de amigos de este usuario es privada.</p>
                       )}
                   </div>
                </div>

                {/* Reviews Section */}
                <div className="bg-[#1a1d2d] rounded-2xl overflow-hidden mb-2 border border-white/5 text-left">
                   <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                         <Star size={16} className="text-amber-400 fill-amber-400" />
                         <h4 className="font-bold text-white text-sm">Comentarios</h4>
                       </div>
                   </div>
                   <div className="p-4 max-h-48 overflow-y-auto space-y-3">
                       {(!selectedUserModal.profileComments || selectedUserModal.profileComments.length === 0) ? (
                           <p className="text-sm text-gray-500 italic text-center">No hay comentarios aún.</p>
                       ) : (
                           selectedUserModal.profileComments.map((c: any, i: number) => (
                               <div key={i} className="bg-black/30 p-3 rounded-xl border border-white/5">
                                   <div className="flex items-center justify-between mb-1">
                                       <span className="font-bold text-cyan-400 text-xs">{c.author}</span>
                                       {c.stars && (
                                           <div className="flex gap-0.5">
                                               {[...Array(5)].map((_, idx) => (
                                                   <Star key={idx} size={10} className={idx < c.stars ? "text-amber-400 fill-amber-400" : "text-gray-600"} />
                                               ))}
                                           </div>
                                       )}
                                   </div>
                                   <p className="text-gray-300 text-sm leading-relaxed">{c.text}</p>
                               </div>
                           ))
                       )}
                   </div>
                   
                   {/* Add comment form */}
                   {selectedUserModal.username !== user.username && (
                       <div className="p-4 bg-black/20 border-t border-white/5">
                           <form onSubmit={(e) => {
                               e.preventDefault();
                               const input = e.currentTarget.elements.namedItem('comment') as HTMLInputElement;
                               const starsSelect = e.currentTarget.elements.namedItem('stars') as HTMLSelectElement;
                               if (input.value.trim()) {
                                   const stars = parseInt(starsSelect.value);
                                   socket.emit("add_profile_comment", { targetUser: selectedUserModal.username, comment: input.value, stars });
                                   setSelectedUserModal(prev => prev ? {
                                       ...prev,
                                       profileComments: [...(prev.profileComments || []), { author: user.username, text: input.value, timestamp: Date.now(), stars }]
                                   } : null);
                                   input.value = '';
                                   starsSelect.value = '5';
                               }
                           }} className="flex flex-col gap-2">
                               <div className="flex gap-2">
                                   <select name="stars" className="bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50">
                                       <option value="5">⭐⭐⭐⭐⭐</option>
                                       <option value="4">⭐⭐⭐⭐</option>
                                       <option value="3">⭐⭐⭐</option>
                                       <option value="2">⭐⭐</option>
                                       <option value="1">⭐</option>
                                   </select>
                                   <input name="comment" type="text" placeholder="Escribe un comentario..." className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500/50" />
                               </div>
                               <button type="submit" className="w-full bg-white/10 text-white px-3 py-2 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors">Enviar Comentario</button>
                           </form>
                       </div>
                   )}
                </div>

                {selectedUserModal.username !== user.username && (
                    <div className="flex flex-col items-center gap-2 mt-4">
                        <button
                          onClick={() => setReportTarget(selectedUserModal.username)}
                          className="text-xs text-gray-500 hover:text-red-400 underline decoration-dotted underline-offset-4"
                        >
                          Reportar Usuario
                        </button>
                        {(user.role === "admin" || user.username.toUpperCase() === "AXISS") && (
                            <button
                                onClick={() => {
                                    if(confirm(`¿Estás seguro de que quieres eliminar la cuenta de ${selectedUserModal.username}?`)) {
                                        socket.emit("admin_delete_user", selectedUserModal.username, (res: any) => {
                                            if(res.success) {
                                                alert("Cuenta eliminada y correo enviado.");
                                                setSelectedUserModal(null);
                                            } else {
                                                alert("Error: " + res.error);
                                            }
                                        });
                                    }
                                }}
                                className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(220,38,38,0.5)] transition-all"
                            >
                                ELIMINAR CUENTA (Admin)
                            </button>
                        )}
                        {user.username.toUpperCase() === "AXISS" && selectedUserModal.role !== "admin" && selectedUserModal.username.toUpperCase() !== "AXISS" && (
                            <button
                                onClick={() => {
                                    if(confirm(`¿Promover a ${selectedUserModal.username} como Administrador?`)) {
                                        socket.emit("admin_promote_user", selectedUserModal.username, (res: any) => {
                                            if(res.success) {
                                                alert("Usuario promovido a Administrador.");
                                                setSelectedUserModal(null);
                                            }
                                        });
                                    }
                                }}
                                className="mt-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all"
                            >
                                PROMOVER A ADMIN
                            </button>
                        )}
                    </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Friends Sidebar (Inbox) */}
      {isFriendsSidebarOpen && (
        <div className="fixed inset-y-0 right-0 w-80 bg-[#0f111a] backdrop-blur-md border-l border-white/10 shadow-2xl z-[105] flex flex-col transform transition-transform animate-in slide-in-from-right">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageSquare size={24} className="text-cyan-400" />
              Buzón de Mensajes
            </h2>
            <button
              onClick={() => setIsFriendsSidebarOpen(false)}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {chatList.length === 0 ? (
              <p className="text-gray-500 text-center text-sm mt-10">
                Tu buzón está vacío. ¡Empieza a chatear!
              </p>
            ) : (
              chatList.map((chatInfo) => {
                const friendUsername = chatInfo.withUser;
                const isOnline = usersOnline.some(
                  (u) => u.username === friendUsername,
                );
                const friendInfo =
                  usersOnline.find((u) => u.username === friendUsername) ||
                  userCache[friendUsername];

                return (
                  <div
                    key={friendUsername}
                    className="flex items-center gap-2 group p-2 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5"
                  >
                    <div
                      onClick={() => {
                        setActiveChat(friendUsername);
                        setUnreadPMs((prev) => ({
                          ...prev,
                          [friendUsername]: false,
                        }));
                        setIsFriendsSidebarOpen(false);
                      }}
                      className="flex-1 flex items-center gap-3 cursor-pointer min-w-0"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-white/5 overflow-hidden relative flex-shrink-0">
                        <img
                          referrerPolicy="no-referrer"
                          src={
                            friendInfo?.profilePic ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${friendUsername}`
                          }
                          className="w-full h-full object-cover"
                        />
                        <div
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f111a] ${isOnline ? "bg-green-500" : "bg-gray-500"}`}
                        ></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <p className="text-white font-medium text-sm truncate">
                            {friendUsername}
                          </p>
                          {unreadPMs[friendUsername] && (
                            <div className="w-2 h-2 rounded-full bg-cyan-500 ml-2"></div>
                          )}
                        </div>
                        <p className={`text-sm truncate ${unreadPMs[friendUsername] ? "text-white font-semibold" : "text-gray-400"}`}>
                          {chatInfo.lastMessage || "Conversación"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(
                            "¿Eliminar esta conversación de tu buzón?",
                          )
                        ) {
                          deleteDoc(
                            doc(
                              db,
                              "userChats",
                              user.username,
                              "chats",
                              friendUsername,
                            ),
                          );
                        }
                      }}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-full opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                      title="Eliminar del buzón"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      {/* Games Menu Modal */}
      {isGamesMenuOpen && (
        <GamesMenuModal
          onClose={() => setIsGamesMenuOpen(false)}
          user={user}
          onSelectGame={(gameId) => {
            if (gameId.startsWith("chess_")) {
              const parsedBet = parseInt(gameId.split("_")[1], 10);
              const bet = isNaN(parsedBet) ? 10 : parsedBet;
              if ((user.lizCoins || 0) < bet) {
                alert("No tienes suficientes Liz-Moneditas.");
                return;
              }
              const msgData = {
                id: Date.now().toString(),
                text:
                  bet > 0
                    ? `¡Reto de Ajedrez por ${bet * 2} LM!`
                    : `¡Reto de Ajedrez Amistoso!`,
                type: "chess_invite",
                sender: user.username,
                senderId: user.username,
                avatar: user.profilePic,
                inviteData: {
                  gameId: `chess_${Date.now()}_${user.username}`,
                  bet: bet,
                  host: user.username,
                  gameType: "chess",
                },
              };
              socket.emit("send_global", msgData);
              setActiveChat("global");
              setMessages((prev) => [...prev, msgData]);
              setTimeout(
                scrollToBottom,
                100,
              );
            } else if (gameId.startsWith("chessbot_")) {
              const parsedBet = parseInt(gameId.split("_")[1], 10);
              const bet = isNaN(parsedBet) ? 10 : parsedBet;
              if ((user.lizCoins || 0) < bet) {
                alert("No tienes suficientes Liz-Moneditas.");
                return;
              }
              // Ask server to start bot game and deduct bet
              socket.emit("start_chess_bot", { bet }, (res: any) => {
                if (res.success) {
                  setActiveChessGame({
                    gameId: res.gameId,
                    opponent: {
                      username: "Elizabeth_Bot",
                      elo: 800,
                      profilePic:
                        "https://api.dicebear.com/7.x/bottts/svg?seed=Elizabeth",
                    } as any,
                    bet: bet,
                    isHost: true,
                    isBot: true,
                  });
                } else {
                  alert(res.error || "Error al iniciar vs Bot");
                }
              });
            }
          }}
        />
      )}

      {/* Store Modal */}
      {isSongRequestOpen && (
        <SongRequestModal
          onClose={() => setIsSongRequestOpen(false)}
          onSubmit={(title, url, dedication) => {
            socket.emit("song_request", { title, url, dedication });
            setIsSongRequestOpen(false);
            setIsDjPanelOpen(false);
          }}
        />
      )}

      {isStoreOpen && (
        <StoreModal
          onClose={() => setIsStoreOpen(false)}
          user={user}
          decorations={DECORATIONS}
          initialCategory={storeCategory}
          onSelectGame={(gameId) => {
            if (gameId.startsWith("chess_")) {
              const parsedBet = parseInt(gameId.split("_")[1], 10);
              const bet = isNaN(parsedBet) ? 10 : parsedBet;
              if ((user.lizCoins || 0) < bet) {
                alert("No tienes suficientes Liz-Moneditas.");
                return;
              }
              const msgData = {
                id: Date.now().toString(),
                text:
                  bet > 0
                    ? `¡Reto de Ajedrez por ${bet * 2} LM!`
                    : `¡Reto de Ajedrez Amistoso!`,
                type: "chess_invite",
                sender: user.username,
                senderId: user.username,
                avatar: user.profilePic,
                inviteData: {
                  gameId: `chess_${Date.now()}_${user.username}`,
                  bet: bet,
                  host: user.username,
                  gameType: "chess",
                },
              };
              socket.emit("send_global", msgData);
              setActiveChat("global");
              setMessages((prev) => [...prev, msgData]);
              setTimeout(
                scrollToBottom,
                100,
              );
            } else if (gameId.startsWith("chessbot_")) {
              const parsedBet = parseInt(gameId.split("_")[1], 10);
              const bet = isNaN(parsedBet) ? 10 : parsedBet;
              if ((user.lizCoins || 0) < bet) {
                alert("No tienes suficientes Liz-Moneditas.");
                return;
              }
              socket.emit("start_chess_bot", { bet }, (res: any) => {
                if (res.success) {
                  setActiveChessGame({
                    gameId: res.gameId,
                    opponent: {
                      username: "Elizabeth_Bot",
                      elo: 800,
                      profilePic:
                        "https://api.dicebear.com/7.x/bottts/svg?seed=Elizabeth",
                    } as any,
                    bet: bet,
                    isHost: true,
                    isBot: true,
                  });
                } else {
                  alert(res.error || "Error al iniciar vs Bot");
                }
              });
            }
          }}
        />
      )}

      {/* Limpiador de Sala Global Modal */}
      {showRoomCleanerModal && (
        <RoomCleanerModal
          isOpen={showRoomCleanerModal}
          onClose={() => setShowRoomCleanerModal(false)}
          messageCount={activeChat === "global" ? messages.length : 0}
          maxLimit={20}
          lastMessage={messages.length > 0 ? messages[messages.length - 1] : null}
          onCleanKeepLast={async () => {
            return new Promise<void>((resolve, reject) => {
              socket.emit("clean_global_room_keep_last", (res: any) => {
                if (res && res.success) {
                  resolve();
                } else {
                  reject(new Error(res?.error || "Error al limpiar sala"));
                }
              });
            });
          }}
          onClearAll={async () => {
            return new Promise<void>((resolve, reject) => {
              socket.emit("clear_global_chat", (res: any) => {
                if (res && res.success) {
                  resolve();
                } else {
                  reject(new Error(res?.error || "Error al vaciar sala"));
                }
              });
            });
          }}
          onReplyLastMessage={() => {
            if (messages.length > 0) {
              setReplyingTo(messages[messages.length - 1]);
              setShowRoomCleanerModal(false);
              if (inputRef.current) inputRef.current.focus();
            }
          }}
          isAdmin={user.username.toUpperCase() === "AXISS"}
        />
      )}

      {/* Admin Panel Modal (AXISS / Axiss & Delegated Admins) */}
      {isAdminPanelOpen && (
        <AdminPanelModal
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          currentUser={user}
          messagesCount={messages.length}
          delegatedAdmins={delegatedAdmins}
          bannedUsers={bannedAdminsOrUsers}
          allUsersList={usersOnline.map((u) => ({
            username: u.username,
            profilePic: u.profilePic,
            role: delegatedAdmins.includes(u.username)
              ? "admin"
              : u.username.toUpperCase() === "AXISS"
              ? "admin"
              : "user",
          }))}
          onOpenCleaner={() => {
            setIsAdminPanelOpen(false);
            setShowRoomCleanerModal(true);
          }}
          onOpenSyncToAxis={() => {
            setIsAdminPanelOpen(false);
            setShowSyncToAxisModal(true);
          }}
          onOpenCustomizer={() => {
            setIsAdminPanelOpen(false);
            setShowChatConfig(true);
          }}
          onOpenAiConfig={() => {
            setIsAdminPanelOpen(false);
            setAdminConfigAiOpen(true);
          }}
          onPromoteToAdmin={async (target) => {
            handlePromoteToAdmin(target);
            socket.emit("admin_promote_user", { targetUsername: target });
          }}
          onDemoteAdmin={async (target) => {
            handleDemoteAdmin(target);
            socket.emit("admin_demote_user", { targetUsername: target });
          }}
          onBanAdminOrUser={async (target) => {
            handleBanAdminOrUser(target);
            socket.emit("admin_ban_user", target);
          }}
          onUnbanUser={async (target) => {
            handleUnbanUser(target);
            socket.emit("admin_unban_user", target);
          }}
          onSetGlobalBackground={handleSetGlobalBackground}
        />
      )}

      {/* Notification Bell Modal */}
      {isNotificationBellOpen && (
        <NotificationBellModal
          isOpen={isNotificationBellOpen}
          onClose={() => setIsNotificationBellOpen(false)}
          notifications={bellNotifications}
          onClear={handleClearNotifications}
          onDismissNotification={handleDismissNotification}
          onViewProfile={openUserProfileByName}
          onOpenPrivateChat={handleOpenPrivateChatWith}
        />
      )}

      {/* Friends & Friend Requests Modal */}
      {isFriendsModalOpen && (
        <FriendsModal
          isOpen={isFriendsModalOpen}
          onClose={() => setIsFriendsModalOpen(false)}
          friends={myFriends}
          pendingRequests={pendingFriendRequests}
          onlineUsers={usersOnline.map((u) => ({ username: u.username, profilePic: u.profilePic }))}
          onAcceptRequest={handleAcceptFriendRequest}
          onRejectRequest={handleRejectFriendRequest}
          onRemoveFriend={handleRemoveFriend}
          onViewProfile={openUserProfileByName}
          onOpenPrivateChat={handleOpenPrivateChatWith}
        />
      )}

      {/* Mailbox Modal */}
      {isMailboxModalOpen && (
        <MailboxModal
          isOpen={isMailboxModalOpen}
          onClose={() => setIsMailboxModalOpen(false)}
          items={mailboxItems}
          onClear={() => setMailboxItems([])}
          onNavigateToRoom={(room) => {
            changeChat(room);
            closeAllModals();
          }}
          onOpenPrivateChat={handleOpenPrivateChatWith}
        />
      )}
    </div>
  );
}

export default function App() {
  useEffect(() => {
    if (!document.getElementById("tailwind-cdn")) {
      const script = document.createElement("script");
      script.id = "tailwind-cdn";
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body {
          font-family: 'Inter', sans-serif;
          background-color: #07090e;
          color: #e2e8f0;
          margin: 0;
          overflow: hidden;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 5px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
      <MainApp />
    </>
  );
}
