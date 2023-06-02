import { type CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.shayenek.notes.todos',
	appName: 'Shayenek Todos App',
	webDir: 'out',
	server: {
		androidScheme: 'https',
	},
};

export default config;
