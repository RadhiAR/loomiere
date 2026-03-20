const CUSTOM_REQUEST_IDS_KEY = "loomiere_custom_request_ids_v1";

export function readTrackedRequestIds(): string[] {
    if (typeof window === "undefined") return [];

    try {
        const raw = window.localStorage.getItem(CUSTOM_REQUEST_IDS_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
        return [];
    }
}

export function trackRequestId(requestId: string) {
    if (typeof window === "undefined" || !requestId?.trim()) return;

    const existing = readTrackedRequestIds();
    const next = [requestId.trim(), ...existing.filter((id) => id !== requestId.trim())].slice(0, 50);

    window.localStorage.setItem(CUSTOM_REQUEST_IDS_KEY, JSON.stringify(next));
}

export function clearTrackedRequestIds() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(CUSTOM_REQUEST_IDS_KEY);
}