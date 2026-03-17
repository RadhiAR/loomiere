import { CollectionHero, HealthResponse } from "./types";

const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

    const res = await fetch(url, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {})
        }
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
    }
    return (await res.json()) as T;
}

export async function getHealth(): Promise<HealthResponse> {
    return apiFetch<HealthResponse>("/health");
}

export async function getHero(): Promise<CollectionHero> {
    return apiFetch<CollectionHero>("/ui/hero");
}