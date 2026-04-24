"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readCart } from "@/lib/cart";
import {
    getCurrentUser,
    isLoggedIn,
    loginUser,
    logoutUser,
    registerUser,
    requestPasswordReset,
} from "@/lib/auth";
import {
    isAdminSessionActive,
    disableAdminSession,
    enableAdminSession,
    saveAdminKey,
} from "@/lib/admin-session";
import BrandLogo from "@/components/BrandLogo";

type Props = {
    brand?: string;
    theme?: "dark" | "light";
};

type AuthView = "login" | "signup" | "forgot";

type StoredAdminUser = {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    username: string;
    interestedCategory: string;
    craftSpecialty: string;
    password: string;
    createdAt: string;
};

const SEARCH_SUGGESTIONS = [
    "Scarves",
    "Coasters",
    "Pet sweaters",
    "Crochet tops",
    "Cardigans",
    "Custom knitwear",
    "Blankets",
    "Jewellery",
];

const ADMIN_USERS_KEY = "loomiere_admin_users_v1";

const SOCIAL_LINKS = [
    { label: "Instagram", href: "https://www.instagram.com", icon: "instagram" },
    { label: "Facebook", href: "https://www.facebook.com", icon: "facebook" },
    { label: "Twitter / X", href: "https://x.com", icon: "x" },
    { label: "Pinterest", href: "https://www.pinterest.com", icon: "pinterest" },
    { label: "TikTok", href: "https://www.tiktok.com", icon: "tiktok" },
    { label: "YouTube", href: "https://www.youtube.com", icon: "youtube" },
] as const;

function readAdminUsers(): StoredAdminUser[] {
    if (typeof window === "undefined") return [];

    try {
        const raw = window.localStorage.getItem(ADMIN_USERS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeAdminUsers(users: StoredAdminUser[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ADMIN_USERS_KEY, JSON.stringify(users));
}

function MenuIcon() {
    return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

function SearchIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.9" />
            <path d="M16 16l4.2 4.2" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
        </svg>
    );
}

function CartIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M6.5 6h15l-1.6 8.2a2 2 0 0 1-2 1.6H9.1a2 2 0 0 1-2-1.6L5.2 3.8A1.5 1.5 0 0 0 3.7 2.6H2"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <circle cx="9.5" cy="20" r="1.3" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="18" cy="20" r="1.3" stroke="currentColor" strokeWidth="1.8" />
        </svg>
    );
}

function InstagramIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
            <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
        </svg>
    );
}

function FacebookIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M13.2 20v-7h2.4l.5-3h-2.9V8.3c0-.9.3-1.5 1.6-1.5H16V4.2c-.2 0-.9-.2-2-.2-2.5 0-4.1 1.5-4.1 4.4V10H7.5v3h2.4v7h3.3Z"
                fill="currentColor"
            />
        </svg>
    );
}

function XIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M5 4h3.6l4 5.4L17.1 4H19l-5.6 6.5L19.5 20H16l-4.2-5.7L6.8 20H5l5.9-6.9L5 4Z"
                fill="currentColor"
            />
        </svg>
    );
}

function PinterestIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M12.1 4.2c-4.2 0-6.3 3-6.3 5.5 0 1.5.6 2.9 1.8 3.5.2.1.3 0 .4-.2l.4-1.4c.1-.2 0-.3-.1-.5-.4-.5-.7-1.2-.7-2.2 0-2.8 2.1-5.3 5.5-5.3 3 0 4.6 1.8 4.6 4.3 0 3.2-1.4 5.9-3.5 5.9-1.2 0-2.1-1-1.8-2.3.3-1.5.9-3 1.1-4 .2-.9-.5-1.7-1.5-1.7-1.2 0-2.1 1.2-2.1 2.8 0 1 .3 1.7.3 1.7l-1.3 5.4c-.4 1.6-.1 3.7 0 3.9.1.1.2.1.3 0 .1-.1 1.2-1.6 1.6-3 .1-.4.7-2.8.7-2.8.4.7 1.5 1.3 2.8 1.3 3.7 0 6.3-3.4 6.3-7.9 0-3.4-2.9-6.5-7.3-6.5Z"
                fill="currentColor"
            />
        </svg>
    );
}

function TikTokIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M14.5 4c.3 1.9 1.4 3.3 3.3 3.8v2.4c-1.3 0-2.4-.4-3.3-1.1v5.6c0 2.9-2.3 5.1-5.3 5.1-2.8 0-5-2.1-5-4.8 0-3 2.4-5.2 5.6-4.8v2.4c-1.4-.2-2.8.7-2.8 2.2 0 1.2 1 2.1 2.2 2.1 1.3 0 2.3-.9 2.3-2.5V4h3Z"
                fill="currentColor"
            />
        </svg>
    );
}

function YouTubeIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
                d="M20.3 8.3c-.2-.9-.9-1.6-1.8-1.8C16.9 6 12 6 12 6s-4.9 0-6.5.5c-.9.2-1.6.9-1.8 1.8C3.2 10 3.2 12 3.2 12s0 2 .5 3.7c.2.9.9 1.6 1.8 1.8C7.1 18 12 18 12 18s4.9 0 6.5-.5c.9-.2 1.6-.9 1.8-1.8.5-1.7.5-3.7.5-3.7s0-2-.5-3.7ZM10.3 14.8v-5.6l4.8 2.8-4.8 2.8Z"
                fill="currentColor"
            />
        </svg>
    );
}

function SocialIcon({ icon }: { icon: (typeof SOCIAL_LINKS)[number]["icon"] }) {
    if (icon === "instagram") return <InstagramIcon />;
    if (icon === "facebook") return <FacebookIcon />;
    if (icon === "x") return <XIcon />;
    if (icon === "pinterest") return <PinterestIcon />;
    if (icon === "tiktok") return <TikTokIcon />;
    return <YouTubeIcon />;
}

export default function Navbar({ theme = "dark" }: Props) {
    const router = useRouter();
    const isDark = theme === "dark";

    const [menuOpen, setMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [authView, setAuthView] = useState<AuthView>("login");

    const [searchTerm, setSearchTerm] = useState("");
    const [cartCount, setCartCount] = useState(0);
    const [loggedIn, setLoggedIn] = useState(false);
    const [adminActive, setAdminActive] = useState(false);
    const [currentName, setCurrentName] = useState("");
    const [accessWarning, setAccessWarning] = useState("");

    const [loginIdentifier, setLoginIdentifier] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const [adminLoginIdentifier, setAdminLoginIdentifier] = useState("");
    const [adminLoginPassword, setAdminLoginPassword] = useState("");
    const [adminLoginError, setAdminLoginError] = useState("");

    const [signupFirstName, setSignupFirstName] = useState("");
    const [signupLastName, setSignupLastName] = useState("");
    const [signupPhone, setSignupPhone] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupUsername, setSignupUsername] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
    const [signupError, setSignupError] = useState("");

    const [adminSignupFirstName, setAdminSignupFirstName] = useState("");
    const [adminSignupLastName, setAdminSignupLastName] = useState("");
    const [adminSignupPhone, setAdminSignupPhone] = useState("");
    const [adminSignupEmail, setAdminSignupEmail] = useState("");
    const [adminSignupUsername, setAdminSignupUsername] = useState("");
    const [adminSignupCategory, setAdminSignupCategory] = useState("");
    const [adminSignupCraftType, setAdminSignupCraftType] = useState("");
    const [adminSignupPassword, setAdminSignupPassword] = useState("");
    const [adminSignupConfirmPassword, setAdminSignupConfirmPassword] = useState("");
    const [adminSignupError, setAdminSignupError] = useState("");

    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotMessage, setForgotMessage] = useState("");

    const [contactName, setContactName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [contactPhone, setContactPhone] = useState("");
    const [contactQuery, setContactQuery] = useState("");
    const [contactSubmitting, setContactSubmitting] = useState(false);
    const [contactMessage, setContactMessage] = useState("");
    const [contactError, setContactError] = useState("");

    function refreshAuthState() {
        const user = getCurrentUser();
        setLoggedIn(isLoggedIn());
        setCurrentName(user ? `${user.firstName} ${user.lastName}`.trim() : "");
    }

    function refreshAdminState() {
        setAdminActive(isAdminSessionActive());
    }

    useEffect(() => {
        const updateCart = () => {
            const cart = readCart();
            setCartCount(cart.reduce((sum, item) => sum + (item.qty || 0), 0));
        };

        updateCart();
        refreshAuthState();
        refreshAdminState();

        const authListener = () => refreshAuthState();
        const adminListener = () => refreshAdminState();

        window.addEventListener("focus", updateCart);
        window.addEventListener("storage", updateCart);
        window.addEventListener("focus", authListener);
        window.addEventListener("storage", authListener);
        window.addEventListener("loomiere-auth-changed", authListener as EventListener);
        window.addEventListener("focus", adminListener);
        window.addEventListener("storage", adminListener);
        window.addEventListener("loomiere-admin-changed", adminListener as EventListener);

        return () => {
            window.removeEventListener("focus", updateCart);
            window.removeEventListener("storage", updateCart);
            window.removeEventListener("focus", authListener);
            window.removeEventListener("storage", authListener);
            window.removeEventListener("loomiere-auth-changed", authListener as EventListener);
            window.removeEventListener("focus", adminListener);
            window.removeEventListener("storage", adminListener);
            window.removeEventListener("loomiere-admin-changed", adminListener as EventListener);
        };
    }, []);

    useEffect(() => {
        function onEsc(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setMenuOpen(false);
                setSearchOpen(false);
                setAuthOpen(false);
            }
        }

        document.addEventListener("keydown", onEsc);
        return () => document.removeEventListener("keydown", onEsc);
    }, []);

    function resetAuthForms() {
        setLoginIdentifier("");
        setLoginPassword("");
        setLoginError("");

        setAdminLoginIdentifier("");
        setAdminLoginPassword("");
        setAdminLoginError("");

        setSignupFirstName("");
        setSignupLastName("");
        setSignupPhone("");
        setSignupEmail("");
        setSignupUsername("");
        setSignupPassword("");
        setSignupConfirmPassword("");
        setSignupError("");

        setAdminSignupFirstName("");
        setAdminSignupLastName("");
        setAdminSignupPhone("");
        setAdminSignupEmail("");
        setAdminSignupUsername("");
        setAdminSignupCategory("");
        setAdminSignupCraftType("");
        setAdminSignupPassword("");
        setAdminSignupConfirmPassword("");
        setAdminSignupError("");

        setForgotEmail("");
        setForgotMessage("");
    }

    function openSearch() {
        setMenuOpen(false);
        setAuthOpen(false);
        setSearchOpen(true);
    }

    function openAuth(view: AuthView, warning = "") {
        setMenuOpen(false);
        setSearchOpen(false);
        setAuthView(view);
        setAuthOpen(true);
        setLoginError("");
        setAdminLoginError("");
        setSignupError("");
        setAdminSignupError("");
        setForgotMessage("");
        setAccessWarning(warning);
    }

    function closeAuth() {
        setAuthOpen(false);
        setAccessWarning("");
        resetAuthForms();
    }

    function requireProfileAccess(path: string) {
        if (loggedIn || adminActive) {
            setMenuOpen(false);
            router.push(path);
            return;
        }

        openAuth(
            "login",
            "This page can be accessed only when logged in. Please create a profile or log in first. Continue as guest cannot access this page."
        );
    }

    function goPublic(path: string) {
        setMenuOpen(false);
        router.push(path);
    }

    function submitSearch(term?: string) {
        const finalTerm = (term ?? searchTerm).trim();
        if (!finalTerm) return;
        setSearchOpen(false);
        setSearchTerm("");
        router.push(`/shop?search=${encodeURIComponent(finalTerm)}`);
    }

    function handleLogin() {
        setLoginError("");

        if (!loginIdentifier.trim() || !loginPassword.trim()) {
            setLoginError("Please enter your username/email and password.");
            return;
        }

        const result = loginUser(loginIdentifier, loginPassword);
        if (!result.ok) {
            setLoginError(result.message);
            return;
        }

        refreshAuthState();
        closeAuth();
        router.push("/account");
    }

    function handleAdminLogin() {
        setAdminLoginError("");

        if (!adminLoginIdentifier.trim() || !adminLoginPassword.trim()) {
            setAdminLoginError("Please enter your admin username/email and password.");
            return;
        }

        const admins = readAdminUsers();
        const normalizedIdentifier = adminLoginIdentifier.trim().toLowerCase();

        const admin = admins.find(
            (item) =>
                item.email.trim().toLowerCase() === normalizedIdentifier ||
                item.username.trim().toLowerCase() === normalizedIdentifier
        );

        if (!admin) {
            setAdminLoginError("No admin subscriber account found with that email or username.");
            return;
        }

        if (admin.password !== adminLoginPassword) {
            setAdminLoginError("Incorrect admin password.");
            return;
        }

        enableAdminSession();
        saveAdminKey(admin.id);
        refreshAdminState();
        closeAuth();
        router.push("/upload-products");
    }

    function handleSignup() {
        setSignupError("");

        if (
            !signupFirstName.trim() ||
            !signupLastName.trim() ||
            !signupPhone.trim() ||
            !signupEmail.trim() ||
            !signupUsername.trim() ||
            !signupPassword.trim() ||
            !signupConfirmPassword.trim()
        ) {
            setSignupError("Please fill in all fields.");
            return;
        }

        if (signupPassword !== signupConfirmPassword) {
            setSignupError("Passwords do not match.");
            return;
        }

        if (signupPassword.length < 6) {
            setSignupError("Password must be at least 6 characters.");
            return;
        }

        const result = registerUser({
            firstName: signupFirstName,
            lastName: signupLastName,
            phone: signupPhone,
            email: signupEmail,
            username: signupUsername,
            password: signupPassword,
        });

        if (!result.ok) {
            setSignupError(result.message);
            return;
        }

        refreshAuthState();
        closeAuth();
        router.push("/account");
    }

    function handleAdminSignup() {
        setAdminSignupError("");

        if (
            !adminSignupFirstName.trim() ||
            !adminSignupLastName.trim() ||
            !adminSignupPhone.trim() ||
            !adminSignupEmail.trim() ||
            !adminSignupUsername.trim() ||
            !adminSignupCategory.trim() ||
            !adminSignupCraftType.trim() ||
            !adminSignupPassword.trim() ||
            !adminSignupConfirmPassword.trim()
        ) {
            setAdminSignupError("Please fill in all admin subscriber fields.");
            return;
        }

        if (adminSignupPassword !== adminSignupConfirmPassword) {
            setAdminSignupError("Admin passwords do not match.");
            return;
        }

        if (adminSignupPassword.length < 6) {
            setAdminSignupError("Admin password must be at least 6 characters.");
            return;
        }

        const admins = readAdminUsers();
        const normalizedEmail = adminSignupEmail.trim().toLowerCase();
        const normalizedUsername = adminSignupUsername.trim().toLowerCase();

        const emailExists = admins.some((admin) => admin.email.trim().toLowerCase() === normalizedEmail);
        if (emailExists) {
            setAdminSignupError("An admin subscriber account with this email already exists.");
            return;
        }

        const usernameExists = admins.some((admin) => admin.username.trim().toLowerCase() === normalizedUsername);
        if (usernameExists) {
            setAdminSignupError("This admin username is already taken.");
            return;
        }

        const nextAdmin: StoredAdminUser = {
            id: `admin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            firstName: adminSignupFirstName.trim(),
            lastName: adminSignupLastName.trim(),
            phone: adminSignupPhone.trim(),
            email: normalizedEmail,
            username: adminSignupUsername.trim(),
            interestedCategory: adminSignupCategory.trim(),
            craftSpecialty: adminSignupCraftType.trim(),
            password: adminSignupPassword,
            createdAt: new Date().toISOString(),
        };

        writeAdminUsers([...admins, nextAdmin]);
        enableAdminSession();
        saveAdminKey(nextAdmin.id);
        refreshAdminState();
        closeAuth();
        router.push("/subscriptions");
    }

    function handleForgotPassword() {
        if (!forgotEmail.trim()) {
            setForgotMessage("Please enter your email.");
            return;
        }

        const result = requestPasswordReset(forgotEmail);
        setForgotMessage(result.message);
    }

    function handleLogout() {
        logoutUser();
        disableAdminSession();
        refreshAuthState();
        refreshAdminState();
        setAccessWarning("");
        setMenuOpen(false);
        router.push("/");
    }

    async function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setContactSubmitting(true);
        setContactError("");
        setContactMessage("");

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: contactName,
                    email: contactEmail,
                    phone: contactPhone,
                    query: contactQuery,
                }),
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                throw new Error(data?.message || "Failed to submit contact request.");
            }

            setContactName("");
            setContactEmail("");
            setContactPhone("");
            setContactQuery("");
            setContactMessage(data?.message || "Contact request submitted successfully.");
        } catch (error: any) {
            setContactError(error?.message || "Something went wrong. Try again.");
        } finally {
            setContactSubmitting(false);
        }
    }

    const pillBase =
        "inline-flex items-center gap-2 rounded-full px-7 py-3 text-[12px] uppercase tracking-[0.22em] transition";

    const pill = isDark
        ? `${pillBase} border border-white/60 text-white hover:border-white hover:bg-white/10`
        : `${pillBase} bg-[#e84a93] text-white hover:bg-[#d63c7f]`;

    const iconBtn = isDark
        ? "inline-flex h-11 w-12 items-center justify-center rounded-full border border-white/60 text-white hover:bg-white/10 transition"
        : "inline-flex h-11 w-12 items-center justify-center rounded-full bg-[#e84a93] text-white hover:bg-[#d63c7f] transition";

    return (
        <>
            <header className="fixed left-0 right-0 top-0 z-[2000]">
                <div className="flex w-full items-start justify-between px-10 pt-4 pb-6 lg:px-16">
                    <div style={{ marginLeft: "-28px" }}>
                        <BrandLogo
                            href="/"
                            size="lg"
                            variant={isDark ? "light" : "dark"}
                            className="!m-0 !block !p-0"
                        />
                    </div>

                    <div className="flex items-start gap-4 pt-1">
                        <Link href="/orders" className={pill}>
                            My Orders
                        </Link>

                        <Link href="/cart" className={`${pill} relative`}>
                            <CartIcon />
                            <span>Cart</span>
                            {cartCount > 0 && (
                                <span
                                    className={
                                        isDark
                                            ? "absolute -right-2 -top-2 inline-flex h-6 min-w-[22px] items-center justify-center rounded-full bg-white px-1 text-[11px] font-semibold text-black"
                                            : "absolute -right-2 -top-2 inline-flex h-6 min-w-[22px] items-center justify-center rounded-full bg-black px-1 text-[11px] font-semibold text-white"
                                    }
                                >
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        <button type="button" className={iconBtn} onClick={openSearch} aria-label="Search">
                            <SearchIcon />
                        </button>

                        <button
                            type="button"
                            className={iconBtn}
                            onClick={() => {
                                setSearchOpen(false);
                                setAuthOpen(false);
                                setMenuOpen(true);
                            }}
                            aria-label="Menu"
                        >
                            <MenuIcon />
                        </button>
                    </div>
                </div>
            </header>

            {menuOpen && (
                <div className="fixed inset-0 z-[3000]">
                    <div className="absolute inset-0 bg-black/35" onClick={() => setMenuOpen(false)} />
                    <aside className="absolute right-0 top-0 h-full w-[320px] overflow-y-auto border-l border-[#f2cddd] bg-[#fff7fa] shadow-2xl">
                        <div className="flex items-start justify-between border-b border-[#f2cddd] pr-5 pt-3 pb-4">
                            <div className="flex flex-col items-start pl-7">
                                <BrandLogo href="/" size="lg" variant="dark" className="!m-0 !block !p-0" />
                                <div className="-mt-2 text-sm font-medium text-black/55">Loomèira Menu</div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setMenuOpen(false)}
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#efc5d7] bg-white text-black/65 transition hover:bg-[#ffe3ee]"
                                aria-label="Close menu"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="flex flex-col px-3 py-3">
                            {adminActive ? (
                                <button
                                    type="button"
                                    onClick={() => requireProfileAccess("/my-dashboard")}
                                    className="rounded-xl px-4 py-3 text-left text-sm text-black/80 hover:bg-[#ffe3ee]"
                                >
                                    My Dashboard
                                </button>
                            ) : null}

                            <button
                                type="button"
                                className="rounded-xl px-4 py-3 text-left text-sm text-black/80 hover:bg-[#ffe3ee]"
                                onClick={() => requireProfileAccess("/loomiere-ai")}
                            >
                                Loomeira AI
                            </button>

                            <button
                                type="button"
                                className="rounded-xl px-4 py-3 text-left text-sm text-black/80 hover:bg-[#ffe3ee]"
                                onClick={() => requireProfileAccess("/customize")}
                            >
                                Customize
                            </button>

                            {adminActive ? (
                                <button
                                    type="button"
                                    className="rounded-xl px-4 py-3 text-left text-sm text-black/80 hover:bg-[#ffe3ee]"
                                    onClick={() => requireProfileAccess("/loomeira-milan")}
                                >
                                    Loomeira - MILAN
                                </button>
                            ) : null}

                            {adminActive ? (
                                <button
                                    type="button"
                                    className="rounded-xl px-4 py-3 text-left text-sm text-black/80 hover:bg-[#ffe3ee]"
                                    onClick={() => requireProfileAccess("/loomeira-learning")}
                                >
                                    Loomeira Learning
                                </button>
                            ) : null}

                            {adminActive ? (
                                <button
                                    type="button"
                                    onClick={() => requireProfileAccess("/customize/requests")}
                                    className="rounded-xl px-4 py-3 text-left text-sm text-black/80 hover:bg-[#ffe3ee]"
                                >
                                    Submitted Requests
                                </button>
                            ) : null}

                            {adminActive ? (
                                <button
                                    type="button"
                                    onClick={() => requireProfileAccess("/upload-products")}
                                    className="rounded-xl px-4 py-3 text-left text-sm text-black/80 hover:bg-[#ffe3ee]"
                                >
                                    Upload your products
                                </button>
                            ) : null}

                            <button
                                type="button"
                                className="rounded-xl px-4 py-3 text-left text-sm text-black/80 hover:bg-[#ffe3ee]"
                                onClick={() => goPublic("/subscriptions")}
                            >
                                Subscriptions
                            </button>

                            <div className="mt-4 px-4">
                                <div className="mb-3 text-[11px] uppercase tracking-[0.22em] text-black/45">
                                    Follow Loomiere
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {SOCIAL_LINKS.map((item) => (
                                        <a
                                            key={item.label}
                                            href={item.href}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={item.label}
                                            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#efc5d7] bg-white text-black/70 transition hover:bg-[#ffe3ee] hover:text-black"
                                        >
                                            <SocialIcon icon={item.icon} />
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div className="my-3 border-t border-[#f2cddd]" />

                            {!loggedIn && !adminActive ? (
                                <button
                                    type="button"
                                    className="rounded-xl px-4 py-3 text-left text-sm text-black/80 hover:bg-[#ffe3ee]"
                                    onClick={() => openAuth("login")}
                                >
                                    Login / Signup
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="rounded-xl px-4 py-3 text-left text-sm text-black/80 hover:bg-[#ffe3ee]"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            )}

                            {loggedIn && currentName ? (
                                <div className="mt-4 px-4 text-xs text-black/45">Signed in as {currentName}</div>
                            ) : null}

                            {!loggedIn && adminActive ? (
                                <div className="mt-4 px-4 text-xs text-black/45">Signed in as subscriber admin</div>
                            ) : null}

                            <div className="mt-5 px-4">
                                <div className="rounded-[22px] border border-[#efc5d7] bg-[#ffe9f2] p-4">
                                    <div className="text-[11px] uppercase tracking-[0.22em] text-black/45">
                                        Contact Loomière
                                    </div>

                                    <div className="mt-3 text-sm leading-7 text-black/80">
                                        <div>
                                            Email: <span className="font-semibold">hello@loomiere.com</span>
                                        </div>
                                        <div className="mt-1">
                                            WhatsApp/Text: <span className="font-semibold">xxx-xxx-xxxx</span>
                                        </div>
                                        <div className="mt-2 text-xs text-black/55">
                                            Feel free to email us or send a WhatsApp message anytime.
                                        </div>
                                    </div>

                                    <form onSubmit={handleContactSubmit} className="mt-5 grid gap-3">
                                        <input
                                            type="text"
                                            value={contactName}
                                            onChange={(e) => setContactName(e.target.value)}
                                            placeholder="Your name"
                                            required
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />
                                        <input
                                            type="email"
                                            value={contactEmail}
                                            onChange={(e) => setContactEmail(e.target.value)}
                                            placeholder="you@email.com"
                                            required
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />
                                        <input
                                            type="tel"
                                            value={contactPhone}
                                            onChange={(e) => setContactPhone(e.target.value)}
                                            placeholder="(xxx) xxx-xxxx"
                                            required
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />
                                        <textarea
                                            rows={4}
                                            value={contactQuery}
                                            onChange={(e) => setContactQuery(e.target.value)}
                                            placeholder="Tell us what you’re looking for — product questions, custom requests, pricing, timeline, etc."
                                            required
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />

                                        {contactError ? (
                                            <div className="rounded-xl border border-[#efc5d7] bg-white/80 p-3 text-sm text-[#c8487d]">
                                                {contactError}
                                            </div>
                                        ) : null}

                                        {contactMessage ? (
                                            <div className="rounded-xl border border-[#efc5d7] bg-white/80 p-3 text-sm text-black/70">
                                                {contactMessage}
                                            </div>
                                        ) : null}

                                        <button
                                            type="submit"
                                            disabled={contactSubmitting}
                                            className="inline-flex items-center justify-center rounded-full bg-[#e84a93] px-5 py-3 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#d63c7f] disabled:opacity-60"
                                        >
                                            {contactSubmitting ? "Submitting..." : "Submit"}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            )}

            {searchOpen && (
                <div className="fixed inset-0 z-[4000] bg-black/35 backdrop-blur-[2px]">
                    <div className="mx-auto mt-24 w-[92%] max-w-2xl rounded-[28px] border border-[#f2cddd] bg-[#fff7fa] p-5 shadow-2xl">
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-medium text-black/90">Search products</h3>
                                <p className="mt-1 text-sm text-black/55">
                                    Search for scarves, coasters, crochet tops, blankets, and more.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSearchOpen(false)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#efc5d7] bg-white text-black/65 transition hover:bg-[#ffe3ee]"
                                aria-label="Close search"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") submitSearch();
                                }}
                                placeholder="Search for scarves, coasters, cardigans..."
                                className="h-14 flex-1 rounded-full border border-[#efc5d7] bg-white px-5 text-sm text-black/85 outline-none placeholder:text-black/35 focus:border-[#d86b98]"
                            />

                            <button
                                type="button"
                                onClick={() => submitSearch()}
                                className="h-14 rounded-full bg-[#ef5f9a] px-6 text-xs uppercase tracking-[0.18em] text-white transition hover:bg-[#de4d8b]"
                            >
                                Search
                            </button>
                        </div>

                        <div className="mt-5">
                            <div className="mb-3 text-xs uppercase tracking-[0.18em] text-black/45">
                                Popular searches
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {SEARCH_SUGGESTIONS.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => submitSearch(item)}
                                        className="rounded-full border border-[#efc5d7] bg-white px-4 py-2 text-sm text-black/70 hover:bg-[#ffe3ee]"
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {authOpen && (
                <div className="fixed inset-0 z-[5000] bg-black/35 backdrop-blur-[2px]">
                    <div className="mx-auto mt-20 w-[92%] max-w-4xl rounded-[30px] border border-[#f2cddd] bg-[#fff7fa] p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-xs uppercase tracking-[0.22em] text-black/45">
                                    Loomeira Account
                                </div>
                                <h3 className="mt-2 text-2xl font-light italic text-black/90">
                                    {authView === "login" && "Login"}
                                    {authView === "signup" && "Create Profile"}
                                    {authView === "forgot" && "Forgot Password"}
                                </h3>
                            </div>

                            <button
                                type="button"
                                onClick={closeAuth}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#efc5d7] bg-white text-black/65 transition hover:bg-[#ffe3ee]"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        {accessWarning ? (
                            <div className="mt-5 rounded-2xl border border-[#efc5d7] bg-[#fff4f8] px-4 py-3 text-sm text-[#b4235f]">
                                {accessWarning}
                            </div>
                        ) : null}

                        <div className="mt-5 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setAuthView("login");
                                    setLoginError("");
                                    setAdminLoginError("");
                                }}
                                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] ${authView === "login"
                                        ? "bg-[#ef5f9a] text-white"
                                        : "border border-[#efc5d7] bg-white text-black/70"
                                    }`}
                            >
                                Login
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setAuthView("signup");
                                    setSignupError("");
                                    setAdminSignupError("");
                                }}
                                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] ${authView === "signup"
                                        ? "bg-[#ef5f9a] text-white"
                                        : "border border-[#efc5d7] bg-white text-black/70"
                                    }`}
                            >
                                Sign Up
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setAuthView("forgot");
                                    setForgotMessage("");
                                }}
                                className={`rounded-full px-4 py-2 text-xs uppercase tracking-[0.18em] ${authView === "forgot"
                                        ? "bg-[#ef5f9a] text-white"
                                        : "border border-[#efc5d7] bg-white text-black/70"
                                    }`}
                            >
                                Forgot Password
                            </button>
                        </div>

                        {authView === "login" && (
                            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                                <div className="rounded-[24px] border border-[#efc5d7] bg-white/70 p-5">
                                    <div className="text-[11px] uppercase tracking-[0.22em] text-black/45">
                                        Shopper Login
                                    </div>

                                    <div className="mt-4 grid gap-4">
                                        <input
                                            value={loginIdentifier}
                                            onChange={(e) => setLoginIdentifier(e.target.value)}
                                            placeholder="Username or Email"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />
                                        <input
                                            type="password"
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            placeholder="Password"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleLogin();
                                            }}
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />

                                        {loginError ? <div className="text-sm text-[#c8487d]">{loginError}</div> : null}

                                        <div className="flex flex-wrap items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={handleLogin}
                                                className="rounded-full bg-[#ef5f9a] px-6 py-3 text-xs uppercase tracking-[0.18em] text-white hover:bg-[#de4d8b]"
                                            >
                                                Login
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setAuthView("forgot")}
                                                className="text-sm text-black/55 underline underline-offset-4"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[24px] border border-[#efc5d7] bg-[#ffeef5] p-5">
                                    <div className="text-[11px] uppercase tracking-[0.22em] text-black/45">
                                        Login as Admin
                                    </div>
                                    <p className="mt-2 text-sm text-black/55">
                                        Subscriber accounts for Loomiere sellers.
                                    </p>

                                    <div className="mt-4 grid gap-4">
                                        <input
                                            value={adminLoginIdentifier}
                                            onChange={(e) => setAdminLoginIdentifier(e.target.value)}
                                            placeholder="Admin Username or Email"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />
                                        <input
                                            type="password"
                                            value={adminLoginPassword}
                                            onChange={(e) => setAdminLoginPassword(e.target.value)}
                                            placeholder="Admin Password"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleAdminLogin();
                                            }}
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />

                                        {adminLoginError ? (
                                            <div className="text-sm text-[#c8487d]">{adminLoginError}</div>
                                        ) : null}

                                        <button
                                            type="button"
                                            onClick={handleAdminLogin}
                                            className="w-fit rounded-full bg-[#ef5f9a] px-6 py-3 text-xs uppercase tracking-[0.18em] text-white hover:bg-[#de4d8b]"
                                        >
                                            Login as Admin
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {authView === "signup" && (
                            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                                <div className="rounded-[24px] border border-[#efc5d7] bg-white/70 p-5">
                                    <div className="text-[11px] uppercase tracking-[0.22em] text-black/45">
                                        Shopper Sign Up
                                    </div>

                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                        <input
                                            value={signupFirstName}
                                            onChange={(e) => setSignupFirstName(e.target.value)}
                                            placeholder="First Name"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />
                                        <input
                                            value={signupLastName}
                                            onChange={(e) => setSignupLastName(e.target.value)}
                                            placeholder="Last Name"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />
                                        <input
                                            value={signupPhone}
                                            onChange={(e) => setSignupPhone(e.target.value)}
                                            placeholder="Phone Number"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />
                                        <input
                                            type="email"
                                            value={signupEmail}
                                            onChange={(e) => setSignupEmail(e.target.value)}
                                            placeholder="Email"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />
                                        <input
                                            value={signupUsername}
                                            onChange={(e) => setSignupUsername(e.target.value)}
                                            placeholder="Username"
                                            className="sm:col-span-2 w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />
                                        <input
                                            type="password"
                                            value={signupPassword}
                                            onChange={(e) => setSignupPassword(e.target.value)}
                                            placeholder="Password"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />
                                        <input
                                            type="password"
                                            value={signupConfirmPassword}
                                            onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                            placeholder="Confirm Password"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleSignup();
                                            }}
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />

                                        {signupError ? (
                                            <div className="sm:col-span-2 text-sm text-[#c8487d]">{signupError}</div>
                                        ) : null}

                                        <div className="sm:col-span-2">
                                            <button
                                                type="button"
                                                onClick={handleSignup}
                                                className="rounded-full bg-[#ef5f9a] px-6 py-3 text-xs uppercase tracking-[0.18em] text-white hover:bg-[#de4d8b]"
                                            >
                                                Create Shopper Profile
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-[24px] border border-[#efc5d7] bg-[#ffeef5] p-5">
                                    <div className="text-[11px] uppercase tracking-[0.22em] text-black/45">
                                        Sign Up as Admin
                                    </div>
                                    <p className="mt-2 text-sm text-black/55">
                                        Use this for Loomiere subscriber seller accounts.
                                    </p>

                                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                        <input
                                            value={adminSignupFirstName}
                                            onChange={(e) => setAdminSignupFirstName(e.target.value)}
                                            placeholder="First Name"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />

                                        <input
                                            value={adminSignupLastName}
                                            onChange={(e) => setAdminSignupLastName(e.target.value)}
                                            placeholder="Last Name"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />

                                        <input
                                            type="tel"
                                            value={adminSignupPhone}
                                            onChange={(e) => setAdminSignupPhone(e.target.value)}
                                            placeholder="Phone Number"
                                            className="sm:col-span-2 w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />

                                        <input
                                            type="email"
                                            value={adminSignupEmail}
                                            onChange={(e) => setAdminSignupEmail(e.target.value)}
                                            placeholder="Email"
                                            className="sm:col-span-2 w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />

                                        <input
                                            value={adminSignupUsername}
                                            onChange={(e) => setAdminSignupUsername(e.target.value)}
                                            placeholder="Admin Username"
                                            className="sm:col-span-2 w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />

                                        <select
                                            value={adminSignupCategory}
                                            onChange={(e) => setAdminSignupCategory(e.target.value)}
                                            className="sm:col-span-2 w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/60 outline-none focus:border-[#d86b98]"
                                        >
                                            <option value="">Interested Category</option>
                                            <option value="home-decor">Home Decor</option>
                                            <option value="pet">Pet Products</option>
                                            <option value="jewellery">Jewellery</option>
                                            <option value="apparel">Apparel</option>
                                        </select>

                                        <select
                                            value={adminSignupCraftType}
                                            onChange={(e) => setAdminSignupCraftType(e.target.value)}
                                            className="sm:col-span-2 w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm text-black/60 outline-none focus:border-[#d86b98]"
                                        >
                                            <option value="">Craft Specialty</option>
                                            <option value="knitting">Knitting</option>
                                            <option value="crochet">Crochet</option>
                                            <option value="embroidery">Embroidery</option>
                                            <option value="resin">Resin Art</option>
                                            <option value="clay">Mud / Clay Crafting</option>
                                            <option value="beadwork">Beadwork</option>
                                            <option value="macrame">Macramé</option>
                                            <option value="wood-crafting">Wood Crafting</option>
                                            <option value="candle-making">Candle Making</option>
                                            <option value="soap-making">Soap Making</option>
                                            <option value="other">Other Handmade Craft</option>
                                        </select>

                                        <input
                                            type="password"
                                            value={adminSignupPassword}
                                            onChange={(e) => setAdminSignupPassword(e.target.value)}
                                            placeholder="Password"
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />

                                        <input
                                            type="password"
                                            value={adminSignupConfirmPassword}
                                            onChange={(e) => setAdminSignupConfirmPassword(e.target.value)}
                                            placeholder="Confirm Password"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") handleAdminSignup();
                                            }}
                                            className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                        />

                                        {adminSignupError ? (
                                            <div className="sm:col-span-2 text-sm text-[#c8487d]">
                                                {adminSignupError}
                                            </div>
                                        ) : null}

                                        <div className="sm:col-span-2">
                                            <button
                                                type="button"
                                                onClick={handleAdminSignup}
                                                className="rounded-full bg-[#ef5f9a] px-6 py-3 text-xs uppercase tracking-[0.18em] text-white hover:bg-[#de4d8b]"
                                            >
                                                Create Admin Account & Choose Plan
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {authView === "forgot" && (
                            <div className="mt-6 grid gap-4">
                                <input
                                    type="email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    placeholder="Email"
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleForgotPassword();
                                    }}
                                    className="w-full rounded-xl border border-[#efc5d7] bg-white px-4 py-3 text-sm outline-none focus:border-[#d86b98]"
                                />

                                <button
                                    type="button"
                                    onClick={handleForgotPassword}
                                    className="w-fit rounded-full bg-[#ef5f9a] px-6 py-3 text-xs uppercase tracking-[0.18em] text-white hover:bg-[#de4d8b]"
                                >
                                    Send Reset Link
                                </button>

                                {forgotMessage ? <div className="text-sm text-black/60">{forgotMessage}</div> : null}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}