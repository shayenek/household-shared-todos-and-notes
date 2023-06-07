import { create } from 'zustand';

import { type TaskAuthorType } from '~/types/author';

export interface ThemeState {
	theme: 'light' | 'dark';
	setTheme: (theme: 'light' | 'dark') => void;
}

export interface TaskAuthorState {
	taskAuthor: TaskAuthorType;
	setTaskAuthor: (taskAuthor: TaskAuthorType) => void;
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
	setTaskAuthor: (taskAuthor: TaskAuthorType) => set({ taskAuthor }),
}));

export interface AuthorizedUserState {
	isAuthorized: boolean;
	setIsAuthorized: (isAuthorized: boolean) => void;
}

export const useAuthorizedUserStore = create<AuthorizedUserState>()((set) => ({
	isAuthorized: false,
	setIsAuthorized: (isAuthorized) => set({ isAuthorized }),
}));
