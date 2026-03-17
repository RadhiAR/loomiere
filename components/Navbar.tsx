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
import BrandLogo from "@/components/BrandLogo";

type Props = {
    brand?: string;
    theme?: "dark" | "light";
};

type AuthView = "login" | "signup" | "forgot";

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
    const [currentName, setCurrentName] = useState("");

    const [loginIdentifier, setLoginIdentifier] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loginError, setLoginError] = useState("");

    const [signupFirstName, setSignupFirstName] = useState("");
    const [signupLastName, setSignupLastName] = useState("");
    const [signupPhone, setSignupPhone] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupUsername, setSignupUsername] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
    const [signupError, setSignupError] = useState("");

    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotMessage, setForgotMessage] = useState("");

    function refreshAuthState() {
        const user = getCurrentUser();
        setLoggedIn(isLoggedIn());
        setCurrentName(user ? `${user.firstName} ${user.lastName}`.trim() : "");
    }

    useEffect(() => {
        const updateCart = () => {
            const cart = readCart();
            setCartCount(cart.reduce((sum, item) => sum + (item.qty || 0), 0));
        };

        updateCart();
        refreshAuthState();

        const authListener = () => refreshAuthState();

        window.addEventListener("focus", updateCart);
        window.addEventListener("storage", updateCart);
        window.addEventListener("focus", authListener);
        window.addEventListener("storage", authListener);
        window.addEventListener("loomiere-auth-changed", authListener as EventListener);

        return () => {
            window.removeEventListener("focus", updateCart);
            window.removeEventListener("storage", updateCart);
            window.removeEventListener("focus", authListener);
            window.removeEventListener("storage", authListener);
            window.removeEventListener("loomiere-auth-changed", authListener as EventListener);
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
        setSignupFirstName("");
        setSignupLastName("");
        setSignupPhone("");
        setSignupEmail("");
        setSignupUsername("");
        setSignupPassword("");
        setSignupConfirmPassword("");
        setSignupError("");
        setForgotEmail("");
        setForgotMessage("");
    }

    function openSearch() {
        setMenuOpen(false);
        setAuthOpen(false);
        setSearchOpen(true);
    }

    function openAuth(view: AuthView) {
        setMenuOpen(false);
        setSearchOpen(false);
        setAuthView(view);
        setAuthOpen(true);
        setLoginError("");
        setSignupError("");
        setForgotMessage("");
    }

    function closeAuth() {
        setAuthOpen(false);
        resetAuthForms();
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
        refreshAuthState();
        setMenuOpen(false);
        router.push("/");
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
            <header className="fixed top-0 left-0 right-0 z-[2000]">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
                    <BrandLogo href="/" size="sm" />

                    <div className="flex items-center gap-4">
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
                    <aside className="absolute right-0 top-0 h-full w-[320px] border-l border-[#f2cddd] bg-[#fff7fa] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#f2cddd] px-5 py-5">
                            <div>
                                <BrandLogo size="sm" />
                                <div className="mt-2 text-sm text-black/55">Menu</div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setMenuOpen(false)}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#efc5d7] bg-white text-black/65 transition hover:bg-[#ffe3ee]"
                                aria-label="Close menu"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="flex flex-col px-3 py-3">
                            <Link href="/loomiere-ai" className="rounded-xl px-4 py-3 text-sm text-black/80 hover:bg-[#ffe3ee]" onClick={() => setMenuOpen(false)}>
                                Loomeira AI
                            </Link>
                            <Link href="/customize" className="rounded-xl px-4 py-3 text-sm text-black/80 hover:bg-[#ffe3ee]" onClick={() => setMenuOpen(false)}>
                                Customize
                            </Link>
                            <Link href="/contact" className="rounded-xl px-4 py-3 text-sm text-black/80 hover:bg-[#ffe3ee]" onClick={() => setMenuOpen(false)}>
                                Contact
                            </Link>
                            <Link href="/returns" className="rounded-xl px-4 py-3 text-sm text-black/80 hover:bg-[#ffe3ee]" onClick={() => setMenuOpen(false)}>
                                Return Policy
                            </Link>
                            <Link href="/subscriptions" className="rounded-xl px-4 py-3 text-sm text-black/80 hover:bg-[#ffe3ee]" onClick={() => setMenuOpen(false)}>
                                Subscriptions
                            </Link>
                            <Link href="/account" className="rounded-xl px-4 py-3 text-sm text-black/80 hover:bg-[#ffe3ee]" onClick={() => setMenuOpen(false)}>
                                My Account
                            </Link>
                            {loggedIn ? (
                                <Link
                                    href="/upload-products"
                                    onClick={() => setMenuOpen(false)}
                                    className="block w-full rounded-2xl border border-[#efc5d7] bg-white px-5 py-4 text-left text-[13px] uppercase tracking-[0.22em] text-black/75 transition hover:bg-[#ffe3ee]"
                                >
                                    Upload your products
                                </Link>
                            ) : null}

                            <div className="my-3 border-t border-[#f2cddd]" />

                            {!loggedIn ? (
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
                            <div className="mb-3 text-xs uppercase tracking-[0.18em] text-black/45">Popular searches</div>
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
                    <div className="mx-auto mt-20 w-[92%] max-w-xl rounded-[30px] border border-[#f2cddd] bg-[#fff7fa] p-6 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <div className="text-xs uppercase tracking-[0.22em] text-black/45">Loomeira Account</div>
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

                        <div className="mt-5 flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setAuthView("login");
                                    setLoginError("");
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
                            <div className="mt-6 grid gap-4">
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
                        )}

                        {authView === "signup" && (
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
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

                                {signupError ? <div className="sm:col-span-2 text-sm text-[#c8487d]">{signupError}</div> : null}

                                <div className="sm:col-span-2">
                                    <button
                                        type="button"
                                        onClick={handleSignup}
                                        className="rounded-full bg-[#ef5f9a] px-6 py-3 text-xs uppercase tracking-[0.18em] text-white hover:bg-[#de4d8b]"
                                    >
                                        Create Profile
                                    </button>
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
