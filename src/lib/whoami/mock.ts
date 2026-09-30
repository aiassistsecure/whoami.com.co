import type {
  CreatorCard,
  CreatorProfileView,
  DiscoverView,
  HomeView,
} from "./contracts";

const creators: CreatorCard[] = [
  {
    handle: "marisa",
    displayName: "Marisa",
    verified: true,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    location: "Winter Park, FL",
    category: "Beauty",
    followersLabel: "4.8K",
    engagementLabel: "8.2%",
    platform: "instagram",
    rates: {
      post: { video: 75, photo: 100 },
      story: { video: 35, photo: 55 },
      reel: { video: 150, photo: 200 },
    },
    paymentMethods: ["x_money", "cash_app"],
  },
  {
    handle: "interchained",
    displayName: "Mark Evans Jr.",
    verified: true,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    location: "Orlando, FL",
    category: "Technology",
    followersLabel: "6.7K",
    engagementLabel: "7.4%",
    platform: "x",
    rates: {
      post: { video: 100, photo: 125 },
      story: { video: 50, photo: 75 },
      reel: { video: 175, photo: 225 },
    },
    paymentMethods: ["x_money", "cash_app"],
  },
  {
    handle: "maya",
    displayName: "Maya",
    verified: false,
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    location: "Miami, FL",
    category: "Lifestyle",
    followersLabel: "3.2K",
    engagementLabel: "9.1%",
    platform: "instagram",
    rates: {
      post: { video: 65, photo: 90 },
      story: { video: 30, photo: 45 },
      reel: { video: 135, photo: 180 },
    },
    paymentMethods: ["cash_app"],
  },
];

export const homeView: HomeView = {
  hero: {
    eyebrow: "WHOAMI",
    title: "Everyone's social media has value.",
    subtitle: "What's your price?",
    primaryCta: "List Yourself",
    secondaryCta: "Find Creators",
  },
  featuredCreators: creators,
};

export const discoverView: DiscoverView = {
  query: "",
  filters: {},
  creators,
};

export const profileViews: Record<string, CreatorProfileView> = Object.fromEntries(
  creators.map((creator) => [
    creator.handle,
    {
      ...creator,
      bio:
        creator.handle === "interchained"
          ? "AI, technology, entrepreneurship, and building in public."
          : "Available for direct creator collaborations.",
      available: true,
      audience: [
        { platform: creator.platform, followersLabel: creator.followersLabel },
      ],
      completedDeals: creator.handle === "interchained" ? 18 : 9,
      repeatPartners: creator.handle === "interchained" ? 7 : 3,
      paymentConfirmedPercent: 100,
    },
  ]),
);
