import { type Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		fontFamily: {
			sans: ['Poppins', 'sans-serif'],
			serif: ['Merriweather', 'serif'],
		},
		extend: {},
	},
	plugins: [],
} satisfies Config;
