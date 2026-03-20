const ADMIN_SESSION_KEY = "loomiere_admin_session_v1";
const ADMIN_KEY_STORAGE = "loomiere_admin_key";

export function isAdminSessionActive() {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function enableAdminSession() {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ADMIN_SESSION_KEY, "true");
    window.dispatchEvent(new Event("loomiere-admin-changed"));
}

export function disableAdminSession() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
    window.localStorage.removeItem(ADMIN_KEY_STORAGE);
    window.dispatchEvent(new Event("loomiere-admin-changed"));
}

export function saveAdminKey(value: string) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ADMIN_KEY_STORAGE, value);
}

export function readAdminKey() {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem(ADMIN_KEY_STORAGE) || "";
}