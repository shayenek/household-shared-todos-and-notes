import { useState, useEffect } from 'react';

export const useScrollPosition = (): number => {
	const [scrollPosition, setScrollPosition] = useState<number>(0);

	const handleScroll = () => {
		const height =
			document.documentElement.scrollHeight - document.documentElement.clientHeight;
		const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
		const scrolled = (winScroll / height) * 100;

		setScrollPosition(scrolled);
	};

	useEffect(() => {
		window.addEventListener('scroll', handleScroll, {
			passive: true,
		});

		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	return scrollPosition;
};
