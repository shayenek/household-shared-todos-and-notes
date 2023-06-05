import { type Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	darkMode: 'class',
	theme: {
		fontFamily: {
			sans: ['Poppins', 'sans-serif'],
			serif: ['Merriweather', 'serif'],
		},
		extend: {
			boxShadow: {
				main: '0 0 12px 0 rgba(0, 0, 0, 0.13)',
			},
		},
	},
	plugins: [],
} satisfies Config;
