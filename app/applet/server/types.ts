export interface DBState {
  users: Record<string, {
    password?: string,
    profilePic?: string,
    statusMessage?: string,
    role?: string,
    pais_idioma?: string,
    securityEmail?: string,
    timezone?: string,
    systemInstruction?: string,
    is_friends_public?: boolean,
    friends_list?: string[],
    blocked_list?: string[],
    awards?: string[],
    friend_requests?: any[],
    preferred_background?: string,
    preferred_theme?: string,
    lizCoins?: number,
    activeDecoration?: string | null,
    ownedDecorations?: string[],
    elo?: number,
    uid?: string,
    profileLikes?: number,
    username?: string
  }>;
  globalMessages: any[];
  hallOfFame?: any[];
  monthlyRankings?: any[];
}
