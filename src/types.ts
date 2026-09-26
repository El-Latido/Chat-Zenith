export interface UserObj {
  username: string;
  profilePic?: string;
  frameId?: number;
  statusMessage?: string;
  role?: string;
  isMasterAdmin?: boolean;
  adminType?: string;
  djSchedule?: { start: string, end: string };
  countryLanguage?: string;
  pais_idioma?: string;
  securityEmail?: string;
  timezone?: string;
  systemInstruction?: string;
  friends_list?: string[];
  blocked_list?: string[];
  is_friends_public?: boolean;
  incognito?: boolean;
  gender?: string;
  mood?: string;
  is_first_time?: boolean;
  awards?: string[];
  friend_requests?: any[];
  preferred_background?: string;
  preferred_theme?: string;
  isAi?: boolean;
  replyTo?: { id: string, sender: string, text: string };
  reactions?: Record<string, string[]>;
  lizCoins?: number;
  activeDecoration?: string | null;
    ownedDecorations?: string[];
  elo?: number;
  uid?: string;
  googleUid?: string;
  profileLikes?: number;
  profileLikedBy?: string[];
  profileComments?: { author: string, text: string, timestamp: number, stars?: number }[];
  bubbleColor?: string;
  bubbleBorder?: string;
  bubbleShape?: string;
  bubbleTexture?: string;
  birthdate?: string;
  age?: number;
  audioVisualizerStyle?: string;
  audioVisualizerColor1?: string;
  audioVisualizerColor2?: string;
}

export interface TutiFruttiState {
  isActive: boolean;
  players: string[];
  currentLetter: string;
  scores: Record<string, number>;
  roundEndTime: number;
  answers: Record<string, any>;
  maxPlayers: number;
  currentRound: number;
  totalRounds: number;
  isCalculating?: boolean;
  roundResults?: any;
}

export interface HallOfFameEntry {
  id: string;
  title: string;
  phrases: { sender: string, text: string }[];
  authors: string[];
  date: number;
}

export interface MessageObj {
  id: string;
  text: string;
  sender: string;
  senderId?: string;
  frameId?: number;
  createdAt: number | Date | any;
  audio?: string;
  image?: string;
  type?: string;
  isAi?: boolean;
  reactions?: Record<string, string[]>;
  inviteData?: {
    gameId: string;
    gameType: string;
    bet: number;
    host: string;
  };
}

export interface PostObj {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  frameId?: number;
  text: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  likes: string[]; // Array of usernames or uids
  createdAt: number;
}

export interface CommentObj {
  id: string;
  postId: string;
  username: string;
  userAvatar?: string;
  frameId?: number;
  text: string;
  createdAt: number;
}

export interface StoryObj {
  id: string;
  userId: string;
  username: string;
  userAvatar?: string;
  frameId?: number;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: number;
}
