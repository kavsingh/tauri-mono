import type { Config } from "tailwindcss";

export default {
	content: ["./index.html", "./src/**/*.tsx"],
	darkMode: "media",
	theme: {
		extend: {
			colors: {
				bg0: "rgb(var(--color-bg-0) / <alpha-value>)",
				text100: "rgb(var(--color-text-100) / <alpha-value>)",
				text400: "rgb(var(--color-text-400) / <alpha-value>)",
				accent100: "rgb(var(--color-accent-100) / <alpha-value>)",
				accent400: "rgb(var(--color-accent-400) / <alpha-value>)",
			},
			keyframes: {
				"pulse-out": {
					"0%": { opacity: "0" },
					"10%": { opacity: "1" },
					"100%": { opacity: "0" },
				},
			},
		},
	},
} satisfies Config;
