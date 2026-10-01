export type SocialPlatform = "instagram" | "tiktok" | "x" | "youtube" | "linkedin";
export type Placement = "post" | "story" | "reel";
export type MediaType = "video" | "photo";
export type WaitlistRole = "creator" | "brand" | "both";

export interface RatePair {
  video: number;
  photo: number;
}

export interface CreatorCard {
  handle: string;
  displayName: string;
  verified: boolean;
  avatarUrl: string;
  coverUrl?: string;
  location: string;
  category: string;
  followersLabel: string;
  engagementLabel: string;
  platform: SocialPlatform;
  rates: Record<Placement, RatePair>;
  paymentMethods: Array<"x_money" | "cash_app">;
  socialHandles?: Partial<Record<SocialPlatform, string>>;
  shortBio?: string;
}

export interface HomeView {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
  };
  featuredCreators: CreatorCard[];
}

export interface DiscoverView {
  query: string;
  filters: {
    platform?: SocialPlatform;
    category?: string;
    location?: string;
    maxPrice?: number;
    availableOnly?: boolean;
    verifiedOnly?: boolean;
  };
  creators: CreatorCard[];
}

export interface CreatorProfileView extends CreatorCard {
  bio: string;
  available: boolean;
  audience: Array<{ platform: SocialPlatform; followersLabel: string }>;
  completedDeals: number;
  repeatPartners: number;
  paymentConfirmedPercent: number;
  portfolio: Array<{
    title: string;
    format: "photo" | "video";
    platform: SocialPlatform;
    imageUrl: string;
    reachLabel: string;
  }>;
}

export interface OfferDraft {
  creatorHandle: string;
  platform: SocialPlatform;
  placement: Placement;
  mediaType: MediaType;
  listedPrice: number;
  amount: number;
  message: string;
}


export interface WaitlistJoinInput {
  email: string;
  role: WaitlistRole;
  source: string;
}

export interface WaitlistJoinResponse {
  ok: true;
  status: "joined" | "already_joined";
}
