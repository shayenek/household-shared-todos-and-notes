import { Burger } from '@mantine/core';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useContext } from 'react';

import { AppContext } from '~/providers/appcontext';
import {
	useTaskAuthorStore,
	type TaskAuthorState,
	type ThemeState,
	useThemeStore,
} from '~/store/store';
import { type TaskAuthorType } from '~/types/author';

export const CollapsibleSidebar = () => {
	const { sidebarVisible, toggleSidebar } = useContext(AppContext);
	const label = sidebarVisible ? 'Close navigation' : 'Open navigation';
	const currentTheme = useThemeStore((state: ThemeState) => state.theme);

	const taskAuthor = useTaskAuthorStore((state: TaskAuthorState) => state.taskAuthor);
	const setTaskAuthor = (author: TaskAuthorType) => {
		useTaskAuthorStore.setState({ taskAuthor: author });
	};

	const { data: sessionData } = useSession();

	return (
		<>
			{sidebarVisible && (
				<button
					onClick={toggleSidebar}
					className={`fixed left-0 top-0 z-[49] min-h-full w-screen bg-black opacity-20 transition-all duration-200 ease-in-out`}
				></button>
			)}
			<div
				className={`fixed left-0 top-0 z-[49] flex min-h-full w-4/5 overflow-hidden bg-white p-4 pb-24 shadow-main transition-all duration-200 ease-in-out dark:bg-[#1d1f20] ${
					sidebarVisible ? 'translate-x-0' : '-translate-x-full'
				}`}
			>
				<div className="flex w-full flex-col gap-4">
					<div className="flex items-center justify-between">
						<div className="text-2xl font-bold text-[#030910] transition duration-200 dark:text-white">
							Menu
						</div>
						<Burger
							opened={sidebarVisible}
							onClick={toggleSidebar}
							aria-label={label}
							color={currentTheme === 'dark' ? 'white' : '#030910'}
							className="transition duration-200"
						/>
					</div>
					<hr className="border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]" />
					<div className="flex flex-col gap-4">
						<span className="text-md font-bold text-[#030910] dark:text-[#e0e2e4]">
							Created by
						</span>
						<div className="align-center flex justify-between gap-2">
							<button
								className={`basis-1/2 rounded-lg border-2 border-[#eeedf0] bg-white p-2 text-sm font-bold hover:!bg-blue-500 dark:border-[#2b3031] dark:bg-[#17181c] dark:text-white ${
									taskAuthor === 'all' ? '!bg-blue-500 text-white' : ''
								}`}
								onClick={() => setTaskAuthor('all')}
							>
								Everyone
							</button>
							<button
								className={`basis-1/2 rounded-lg border-2 border-[#eeedf0] bg-white p-2 text-sm font-bold hover:!bg-blue-500 dark:border-[#2b3031] dark:bg-[#17181c] dark:text-white ${
									taskAuthor === 'mine' ? '!bg-blue-500 text-white' : ''
								}`}
								onClick={() => setTaskAuthor('mine')}
							>
								Me
							</button>
						</div>
					</div>
					<hr className="mt-auto border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31] " />
					<div className="flex items-center justify-center gap-2">
						<Image
							src={sessionData?.user?.image || ''}
							alt="Profile image"
							width={36}
							height={36}
							className="rounded-full"
						/>
						<span className="text-md text-[#030910] dark:text-[#e0e2e4]">
							{sessionData?.user?.email}
						</span>
					</div>
				</div>
			</div>
		</>
	);
};
