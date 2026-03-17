export type SubscriptionPlan = "none" | "pink" | "silver" | "bronze";

export type UserProfile = {
    fullName: string;
    username: string;
    email: string;
    phone: string;
    address: string;
    subscription: SubscriptionPlan;
    subscriptionUpdatedAt: string;
};

const KEY = "loomiere_profile_v3";

export const defaultProfile: UserProfile = {
    fullName: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    subscription: "none",
    subscriptionUpdatedAt: "",
};

export function readProfile(): UserProfile {
    if (typeof window === "undefined") return defaultProfile;

    try {
        const raw = window.localStorage.getItem(KEY);
        if (!raw) return defaultProfile;

        const parsed = JSON.parse(raw);

        return {
            ...defaultProfile,
            ...parsed,
        };
    } catch {
        return defaultProfile;
    }
}

export function writeProfile(profile: UserProfile) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, JSON.stringify(profile));
}

export function subscriptionLabel(plan: SubscriptionPlan) {
    if (plan === "pink") return "Pink — Annual — $99.99";
    if (plan === "silver") return "Silver — Quarterly — $39.99";
    if (plan === "bronze") return "Bronze — Monthly — $19.99";
    return "No active subscription";
}