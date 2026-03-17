import type { Config } from "tailwindcss";

export default {
    content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
    theme: {
        extend: {
            letterSpacing: {
                luxe: "0.24em"
            }
        }
    },
    plugins: []
} satisfies Config;