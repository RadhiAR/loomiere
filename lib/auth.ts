import { readProfile, writeProfile, type UserProfile } from "@/lib/profile";

export type StoredUser = {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    username: string;
    password: string;
    createdAt: string;
};

type RegisterInput = {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    username: string;
    password: string;
};

const USERS_KEY = "loomiere_auth_users_v1";
const CURRENT_USER_KEY = "loomiere_auth_current_user_v1";
const RESET_REQUESTS_KEY = "loomiere_password_reset_requests_v1";

function emitAuthChange() {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event("loomiere-auth-changed"));
}

function readUsers(): StoredUser[] {
    if (typeof window === "undefined") return [];

    try {
        const raw = window.localStorage.getItem(USERS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeUsers(users: StoredUser[]) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readCurrentUserId(): string {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(CURRENT_USER_KEY) || "";
}

function writeCurrentUserId(userId: string) {
    if (typeof window === "undefined") return;
    if (userId) {
        window.localStorage.setItem(CURRENT_USER_KEY, userId);
    } else {
        window.localStorage.removeItem(CURRENT_USER_KEY);
    }
    emitAuthChange();
}

function mergeProfileFromUser(user: StoredUser) {
    const existingProfile = readProfile();

    const nextProfile: UserProfile = {
        ...existingProfile,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        username: user.username,
        email: user.email,
        phone: user.phone,
    };

    writeProfile(nextProfile);
}

export function getCurrentUser(): StoredUser | null {
    const userId = readCurrentUserId();
    if (!userId) return null;

    const users = readUsers();
    return users.find((user) => user.id === userId) || null;
}

export function isLoggedIn() {
    return !!getCurrentUser();
}

export function logoutUser() {
    writeCurrentUserId("");
}

export function registerUser(input: RegisterInput) {
    const users = readUsers();

    const normalizedEmail = input.email.trim().toLowerCase();
    const normalizedUsername = input.username.trim().toLowerCase();

    const emailExists = users.some(
        (user) => user.email.trim().toLowerCase() === normalizedEmail
    );

    if (emailExists) {
        return {
            ok: false as const,
            message: "An account with this email already exists.",
        };
    }

    const usernameExists = users.some(
        (user) => user.username.trim().toLowerCase() === normalizedUsername
    );

    if (usernameExists) {
        return {
            ok: false as const,
            message: "This username is already taken.",
        };
    }

    const nextUser: StoredUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone.trim(),
        email: normalizedEmail,
        username: input.username.trim(),
        password: input.password,
        createdAt: new Date().toISOString(),
    };

    const nextUsers = [...users, nextUser];
    writeUsers(nextUsers);
    writeCurrentUserId(nextUser.id);
    mergeProfileFromUser(nextUser);

    return {
        ok: true as const,
        user: nextUser,
    };
}

export function loginUser(identifier: string, password: string) {
    const users = readUsers();
    const normalizedIdentifier = identifier.trim().toLowerCase();

    const user = users.find(
        (item) =>
            item.email.trim().toLowerCase() === normalizedIdentifier ||
            item.username.trim().toLowerCase() === normalizedIdentifier
    );

    if (!user) {
        return {
            ok: false as const,
            message: "No account found with that email or username.",
        };
    }

    if (user.password !== password) {
        return {
            ok: false as const,
            message: "Incorrect password.",
        };
    }

    writeCurrentUserId(user.id);
    mergeProfileFromUser(user);

    return {
        ok: true as const,
        user,
    };
}

export function verifyCurrentPassword(password: string) {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        return {
            ok: false as const,
            message: "You need to be logged in to change your password.",
        };
    }

    if (currentUser.password !== password) {
        return {
            ok: false as const,
            message: "Current password is incorrect.",
        };
    }

    return {
        ok: true as const,
    };
}

export function updateCurrentUserPassword(currentPassword: string, newPassword: string) {
    const currentUser = getCurrentUser();

    if (!currentUser) {
        return {
            ok: false as const,
            message: "You need to be logged in to update your password.",
        };
    }

    if (currentUser.password !== currentPassword) {
        return {
            ok: false as const,
            message: "Current password is incorrect.",
        };
    }

    if (!newPassword.trim() || newPassword.trim().length < 6) {
        return {
            ok: false as const,
            message: "New password must be at least 6 characters.",
        };
    }

    const users = readUsers();
    const nextUsers = users.map((user) =>
        user.id === currentUser.id
            ? {
                ...user,
                password: newPassword,
            }
            : user
    );

    writeUsers(nextUsers);
    emitAuthChange();

    return {
        ok: true as const,
        message: "Password updated successfully.",
    };
}

export function requestPasswordReset(email: string) {
    const users = readUsers();
    const normalizedEmail = email.trim().toLowerCase();

    const user = users.find(
        (item) => item.email.trim().toLowerCase() === normalizedEmail
    );

    const existingRequestsRaw =
        typeof window !== "undefined"
            ? window.localStorage.getItem(RESET_REQUESTS_KEY)
            : null;

    let existingRequests: Array<{ email: string; requestedAt: string }> = [];

    try {
        existingRequests = existingRequestsRaw ? JSON.parse(existingRequestsRaw) : [];
        if (!Array.isArray(existingRequests)) existingRequests = [];
    } catch {
        existingRequests = [];
    }

    if (typeof window !== "undefined" && user) {
        existingRequests.push({
            email: normalizedEmail,
            requestedAt: new Date().toISOString(),
        });

        window.localStorage.setItem(
            RESET_REQUESTS_KEY,
            JSON.stringify(existingRequests)
        );
    }

    return {
        ok: true as const,
        exists: !!user,
        message:
            "If an account exists with this email, a password reset link has been sent.",
    };
}
