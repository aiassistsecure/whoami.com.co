import type {
  CreatorCard,
  CreatorProfileView,
  DiscoverView,
  HomeView,
} from "./contracts";

const rates = {
  sophialee: {
    post: { video: 75, photo: 100 },
    story: { video: 35, photo: 55 },
    reel: { video: 150, photo: 200 },
  },
  jordantech: {
    post: { video: 60, photo: 85 },
    story: { video: 30, photo: 50 },
    reel: { video: 120, photo: 180 },
  },
  leilanix: {
    post: { video: 80, photo: 110 },
    story: { video: 40, photo: 65 },
    reel: { video: 160, photo: 220 },
  },
  chrisfoodie: {
    post: { video: 50, photo: 75 },
    story: { video: 25, photo: 45 },
    reel: { video: 100, photo: 160 },
  },
};

const discoverCreators: CreatorCard[] = [
  {
    handle: "sophialee",
    displayName: "Sophia Lee",
    verified: true,
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=90",
    coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=90",
    location: "Miami, FL",
    category: "Beauty",
    followersLabel: "12.4K",
    engagementLabel: "6.2%",
    platform: "instagram",
    rates: rates.sophialee,
    paymentMethods: ["x_money", "cash_app"],
    socialHandles: { instagram: "12.4K", tiktok: "8.1K", x: "4.2K" },
    shortBio: "Beauty, fashion, and lifestyle content. Partnering with brands I genuinely love.",
  },
  {
    handle: "jordantech",
    displayName: "Jordan",
    verified: false,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=90",
    location: "Orlando, FL",
    category: "Tech",
    followersLabel: "8.7K",
    engagementLabel: "4.1%",
    platform: "x",
    rates: rates.jordantech,
    paymentMethods: ["x_money"],
    socialHandles: { x: "8.7K", youtube: "5.2K", instagram: "2.1K" },
  },
  {
    handle: "leilanix",
    displayName: "Leilani",
    verified: false,
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=700&q=90",
    location: "New York, NY",
    category: "Lifestyle",
    followersLabel: "15.2K",
    engagementLabel: "7.8%",
    platform: "instagram",
    rates: rates.leilanix,
    paymentMethods: ["cash_app"],
    socialHandles: { instagram: "15.2K", tiktok: "11.4K" },
  },
  {
    handle: "chrisfoodie",
    displayName: "Chris",
    verified: false,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=90",
    location: "Tampa, FL",
    category: "Food",
    followersLabel: "21.3K",
    engagementLabel: "5.4%",
    platform: "instagram",
    rates: rates.chrisfoodie,
    paymentMethods: ["cash_app"],
    socialHandles: { instagram: "21.3K", tiktok: "13.9K", youtube: "4.8K" },
  },
];

const featuredCreators: CreatorCard[] = [
  {
    ...discoverCreators[0],
    handle: "mariaj",
    displayName: "Maria",
    avatarUrl: "/whoami/creators/mariaj.webp",
    location: "Miami, FL",
  },
  {
    ...discoverCreators[1],
    handle: "tylerp",
    displayName: "Tyler",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=90",
    location: "Orlando, FL",
  },
  {
    ...discoverCreators[2],
    handle: "leilanix",
    displayName: "Leilani",
    avatarUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=90",
    location: "NYC",
  },
];

export const homeView: HomeView = {
  hero: {
    eyebrow: "WHOAMI BY THE AGENCY",
    title: "Everyone's social media has value.",
    subtitle: "What's your price?",
    primaryCta: "List Yourself",
    secondaryCta: "Find Creators",
  },
  featuredCreators,
};

export const discoverView: DiscoverView = {
  query: "",
  filters: {},
  creators: discoverCreators,
};

function profileFrom(creator: CreatorCard): CreatorProfileView {
  return {
    ...creator,
    bio: creator.shortBio ?? "Available for direct creator collaborations.",
    available: true,
    audience: [
      { platform: "instagram", followersLabel: creator.socialHandles?.instagram ?? creator.followersLabel },
      { platform: "tiktok", followersLabel: creator.socialHandles?.tiktok ?? "8.1K" },
      { platform: "x", followersLabel: creator.socialHandles?.x ?? "4.2K" },
    ],
    completedDeals: 18,
    repeatPartners: 7,
    paymentConfirmedPercent: 100,
  };
}

export const profileViews: Record<string, CreatorProfileView> = Object.fromEntries(
  discoverCreators.map((creator) => [creator.handle, profileFrom(creator)]),
);

// Compatibility profile used by the existing BFF test and early development URL.
profileViews.interchained = profileFrom({
  ...discoverCreators[0],
  handle: "interchained",
  displayName: "Mark Evans Jr.",
  category: "Technology",
  location: "Orlando, FL",
  platform: "x",
  followersLabel: "6.7K",
  engagementLabel: "7.4%",
  rates: {
    post: { video: 100, photo: 125 },
    story: { video: 50, photo: 75 },
    reel: { video: 175, photo: 225 },
  },
  shortBio: "AI, technology, entrepreneurship, and building in public.",
});
