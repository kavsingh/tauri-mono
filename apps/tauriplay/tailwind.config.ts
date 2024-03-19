import type { Config } from "tailwindcss";

export default {
	content: ["./index.html", "./src/**/*.tsx"],
	theme: {
		extend: {
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
