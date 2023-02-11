/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./index.html", "./src/**/*.tsx"],
	darkMode: "media",
	theme: {
		extend: {
			textColor: {
				primary: "var(--color-text-primary)",
			},
			backgroundColor: {
				primary: "var(--color-background-primary)",
			},
		},
	},
	plugins: [
		require("@tailwindcss/container-queries"),
		require("tailwindcss-logical"),
	],
};
