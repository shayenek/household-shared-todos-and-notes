import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { api } from '~/utils/api';

import '~/styles/globals.css';

const MyApp: AppType<{ session: Session | null }> = ({
	Component,
	pageProps: { session, ...pageProps },
}) => {
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
