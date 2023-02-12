/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.tsx"],
	darkMode: "media",
	theme: {
		extend: {
			textColor: {
				"100": "var(--color-text-100)",
				"400": "var(--color-text-400)",
				"inverse-0": "var(--color-bg-0)",
			},
			backgroundColor: {
				"0": "var(--color-bg-0)",
				"inverse-400": "var(--color-text-400)",
			},
			borderColor: {
				100: "var(--color-border-100)",
				400: "var(--color-border-400)",
			},
		},
	},
	plugins: [
		require("@tailwindcss/container-queries"),
		require("tailwindcss-logical"),
	],
};
