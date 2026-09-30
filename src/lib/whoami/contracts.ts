export type SocialPlatform = "instagram" | "x" | "linkedin";
export type Placement = "post" | "story" | "reel";
export type MediaType = "video" | "photo";

export interface RatePair {
  video: number;
  photo: number;
}

export interface CreatorCard {
  handle: string;
  displayName: string;
  verified: boolean;
  avatarUrl: string;
  location: string;
  category: string;
  followersLabel: string;
  engagementLabel: string;
  platform: SocialPlatform;
  rates: Record<Placement, RatePair>;
  paymentMethods: Array<"x_money" | "cash_app">;
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
