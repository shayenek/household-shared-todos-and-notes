import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';

import { useLayoutStore } from '~/store/store';
import { api } from '~/utils/api';

import '~/styles/globals.css';

const MyApp: AppType<{ session: Session | null }> = ({
	Component,
	pageProps: { session, ...pageProps },
}) => {
	// const [width, setWidth] = useState<number>(0);
	useEffect(() => {
		const handleWindowSizeChange = () => {
			if (typeof window !== 'undefined') {
				// setWidth(window.innerWidth);
				useLayoutStore.setState({ isMobile: window.innerWidth < 768 });
			}
		};

		if (typeof window !== 'undefined') {
			// setWidth(window.innerWidth);
			useLayoutStore.setState({ isMobile: window.innerWidth < 768 });
			window.addEventListener('resize', handleWindowSizeChange);
			return () => {
				window.removeEventListener('resize', handleWindowSizeChange);
			};
		}
	}, []);

	return (
		<MantineProvider withGlobalStyles withNormalizeCSS>
			<SessionProvider session={session}>
				<ModalsProvider>
					<Component {...pageProps} />
					<Notifications position="top-right" limit={5} />
				</ModalsProvider>
			</SessionProvider>
		</MantineProvider>
	);
};

export default api.withTRPC(MyApp);
