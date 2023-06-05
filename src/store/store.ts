import { create } from 'zustand';

export interface ThemeState {
	theme: 'light' | 'dark';
	setTheme: (theme: 'light' | 'dark') => void;
}

export interface TaskAuthorState {
	taskAuthor: 'all' | 'mine';
	setTaskAuthor: (taskAuthor: 'all' | 'mine') => void;
}

export const useThemeStore = create<ThemeState>()((set) => ({
	theme:
		typeof window !== 'undefined'
			? window.localStorage.getItem('theme') === 'dark'
				? 'dark'
				: 'light'
			: 'dark',
	setTheme: (theme) => set({ theme }),
}));

export const useTaskAuthorStore = create<TaskAuthorState>()((set) => ({
	taskAuthor: 'all',
	setTaskAuthor: (taskAuthor: 'all' | 'mine') => set({ taskAuthor }),
}));
