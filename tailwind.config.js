/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.tsx"],
	darkMode: "media",
	theme: {
		extend: {
			colors: {
				bg0: "var(--color-bg0)",
				text100: "var(--color-text100)",
				text400: "var(--color-text400)",
				accent100: "var(--color-accent100)",
				accent400: "var(--color-accent400)",
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
	plugins: [
		require("@tailwindcss/container-queries"),
		require("tailwindcss-logical"),
	],
};
