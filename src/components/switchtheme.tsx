import { useEffect, useState } from 'react';

import { type ThemeState, useThemeStore, useLayoutStore, type LayoutState } from '~/store/store';

const ThemeSwitcher = ({ size }: { size: string }) => {
	const currentTheme = useThemeStore((state: ThemeState) => state.theme);
	const [currentLayout] = useLayoutStore((state: LayoutState) => [state.layout]);
	const [globalTheme, setGlobalTheme] = useState<'dark' | 'light'>('light');

	useEffect(() => {
		if (currentTheme === 'dark') {
			setGlobalTheme('dark');
		} else {
			setGlobalTheme('light');
		}
	}, [currentTheme]);

	return (
		<>
			<button
				onClick={() => {
					useLayoutStore.setState({
						layout: currentLayout === 'mobile' ? 'desktop' : 'mobile',
					});
					window.localStorage.setItem(
						'layout',
						currentLayout === 'mobile' ? 'desktop' : 'mobile'
					);
				}}
			>
				{currentLayout === 'mobile' ? (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className={`h-[36px] transition-all duration-500 ease-out ${
							globalTheme === 'dark' ? 'stroke-white' : 'stroke-[#101213]'
						}`}
						viewBox="0 0 24 24"
						stroke-width="2"
						fill="none"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
						<rect x="4" y="4" width="6" height="5" rx="2"></rect>
						<rect x="4" y="13" width="6" height="7" rx="2"></rect>
						<rect x="14" y="4" width="6" height="16" rx="2"></rect>
					</svg>
				) : (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className={`h-[36px] transition-all duration-500 ease-out ${
							globalTheme === 'dark' ? 'stroke-white' : 'stroke-[#101213]'
						}`}
						viewBox="0 0 24 24"
						stroke-width="2"
						fill="none"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
						<rect x="4" y="4" width="16" height="16" rx="2"></rect>
						<line x1="4" y1="15" x2="20" y2="15"></line>
					</svg>
				)}
			</button>

			<button
				onClick={() => {
					useThemeStore.setState({
						theme: globalTheme === 'dark' ? 'light' : 'dark',
					});
					window.localStorage.setItem('theme', globalTheme === 'dark' ? 'light' : 'dark');
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox={`0 0 ${globalTheme === 'dark' ? '384 512' : '640 512'}`}
					className={`transition-all duration-500 ease-out ${size} ${
						globalTheme === 'dark' ? 'fill-white' : 'fill-[#101213]'
					}`}
				>
					{globalTheme === 'dark' ? (
						<path d="M112.1 454.3c0 6.297 1.816 12.44 5.284 17.69l17.14 25.69c5.25 7.875 17.17 14.28 26.64 14.28h61.67c9.438 0 21.36-6.401 26.61-14.28l17.08-25.68c2.938-4.438 5.348-12.37 5.348-17.7L272 415.1h-160L112.1 454.3zM191.4 .0132C89.44 .3257 16 82.97 16 175.1c0 44.38 16.44 84.84 43.56 115.8c16.53 18.84 42.34 58.23 52.22 91.45c.0313 .25 .0938 .5166 .125 .7823h160.2c.0313-.2656 .0938-.5166 .125-.7823c9.875-33.22 35.69-72.61 52.22-91.45C351.6 260.8 368 220.4 368 175.1C368 78.61 288.9-.2837 191.4 .0132zM192 96.01c-44.13 0-80 35.89-80 79.1C112 184.8 104.8 192 96 192S80 184.8 80 176c0-61.76 50.25-111.1 112-111.1c8.844 0 16 7.159 16 16S200.8 96.01 192 96.01z" />
					) : (
						<path d="M240.1 454.4c.125 6.25 1.983 12.43 5.359 17.68l17.09 25.69c5.25 7.875 17.27 14.28 26.65 14.28h61.72c9.5 0 21.38-6.395 26.63-14.27l17.09-25.69c3.25-5.375 5.109-11.43 5.359-17.68v-38.36l-159.9 .0048L240.1 454.4zM319.5 .0154C217.5 .2654 144 82.1 144 175.1c0 42.62 15.4 83.76 43.52 115.8c16.62 18.87 42.36 58.23 52.24 91.48c0 .25 .1146 .5105 .1146 .7604l160.3 .0007c0-.25 .0833-.5111 .0833-.7611c9.875-33.25 35.61-72.61 52.24-91.48c28.12-32 43.52-73.14 43.52-115.8C496 78.62 416.8-.2346 319.5 .0154zM320 96.01c-44.13 0-80 35.87-80 79.1c0 8.875-7.125 16-16 16s-16-7.125-16-16C208.1 114.1 258.1 64.14 320 64.01c8.875 0 16 7.126 16 16S328.9 96.01 320 96.01zM112 192c0-13.25-10.75-24-24-24h-64c-13.25 0-24 10.75-24 24s10.75 24 24 24h64C101.2 216 112 205.3 112 192zM616 168h-64c-13.25 0-24 10.75-24 24s10.75 24 24 24h64c13.25 0 24-10.75 24-24S629.3 168 616 168zM131.1 55.25l-55.5-32c-7.375-4.5-16.63-4.625-24.25-.375c-7.5 4.375-12.13 12.38-12.13 21c.125 8.75 4.875 16.75 12.38 20.88L107.1 96.75c7.375 4.5 16.63 4.625 24.25 .375c7.5-4.375 12.12-12.38 12.12-21C143.4 67.38 138.6 59.38 131.1 55.25zM588.4 319.3l-55.5-32c-7.375-4.5-16.62-4.625-24.25-.375c-7.5 4.375-12.12 12.38-12.12 21c.125 8.75 4.875 16.75 12.38 20.88l55.5 32c11.38 6.375 25.88 2.375 32.38-9C603.3 340.5 599.5 326 588.4 319.3zM107.1 287.3L51.62 319.3c-7.5 4.125-12.25 12.13-12.38 20.88c0 8.625 4.625 16.63 12.13 21c7.625 4.25 16.87 4.125 24.25-.375l55.5-32c11.12-6.75 14.87-21.25 8.375-32.5C133 284.9 118.5 280.9 107.1 287.3zM521 100c4.125 0 8.25-1.125 12-3.25l55.38-32c11.25-6.75 14.88-21.25 8.375-32.5c-6.5-11.37-21-15.38-32.38-9L509 55.25c-9.5 5.375-14 16.5-11.25 27C500.6 92.75 510.1 100 521 100z" />
					)}
				</svg>
			</button>
		</>
	);
};

export default ThemeSwitcher;
