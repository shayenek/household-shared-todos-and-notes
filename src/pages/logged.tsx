import { deleteCookie } from 'cookies-next';
import { signOut, useSession } from 'next-auth/react';
import { useEffect } from 'react';

import { CollapsibleSidebar } from '~/components/collapsiblesidebar';
import MobileNavbar from '~/components/mobilenavbar';
import ThemeSwitcher from '~/components/switchtheme';
import TaskForm from '~/components/taskform';
import Tasks from '~/components/tasks';
import TopNavbar from '~/components/topnavbar';
import {
	type AuthorizedUserState,
	useAuthorizedUserStore,
	useLayoutStore,
	type LayoutState,
	type TaskTypeState,
	useTaskTypeStore,
} from '~/store/store';

const Logged = () => {
	const { data: sessionData } = useSession();
	const isAuthorized = useAuthorizedUserStore((state: AuthorizedUserState) => state.isAuthorized);
	const [currentLayout, isMobile] = useLayoutStore((state: LayoutState) => [
		state.layout,
		state.isMobile,
	]);
	const setTaskType = useTaskTypeStore((state: TaskTypeState) => state.setTaskType);

	const handleSignOut = async () => {
		await signOut();
		useAuthorizedUserStore.setState({ isAuthorized: false });
		deleteCookie('sessionToken');
	};

	useEffect(() => {
		setTaskType('shopping');
	}, []);

	return (
		<>
			{isAuthorized && currentLayout === 'desktop' && (
				<button
					className="mt-4 hidden rounded-full bg-red-500 px-10 py-3 font-semibold text-white no-underline transition hover:bg-red-800 md:absolute md:right-4 md:top-0 md:block"
					onClick={() => void handleSignOut()}
				>
					Sign Out
				</button>
			)}
			<div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:gap-12">
				{!isMobile && sessionData && currentLayout === 'desktop' && (
					<TaskForm className="md:max-w-[20rem]" />
				)}

				<Tasks />
				{isMobile && sessionData && <TopNavbar />}
				{(isMobile || currentLayout === 'mobile') && (
					<>
						<MobileNavbar />
						<CollapsibleSidebar />
					</>
				)}
			</div>
			{(!isMobile || !isAuthorized) && currentLayout === 'desktop' ? (
				<div className="fixed bottom-5 right-5 z-50">
					<div className="flex rounded-lg bg-white p-2 pl-4 shadow-lg dark:bg-[#252729]">
						<ThemeSwitcher size="h-[28px] w-[48px]" />
					</div>
				</div>
			) : null}
		</>
	);
};

export default Logged;
