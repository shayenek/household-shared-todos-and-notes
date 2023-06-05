import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

import MobileNavbar from '~/components/mobilenavbar';
import TaskForm from '~/components/taskform';
import Tasks from '~/components/tasks';
import TopNavbar from '~/components/topnavbar';
import { type ThemeState, useThemeStore } from '~/store/store';

const Logged = ({ isMobile }: { isMobile: boolean }) => {
	const [opened, { open, close }] = useDisclosure(false);
	const currentTheme = useThemeStore((state: ThemeState) => state.theme);

	return (
		<div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:gap-12">
			<Modal
				opened={opened}
				onClose={close}
				title="Add new item"
				centered
				styles={{
					content: {
						background: currentTheme === 'dark' ? '#1d1f20' : '#fff',
						borderWidth: '2px',
						borderColor: currentTheme === 'dark' ? '#2b3031' : '#ecf0f3',
					},
					header: {
						color: currentTheme === 'dark' ? '#fff' : '#030910',
						background: currentTheme === 'dark' ? '#1d1f20' : '#fff',
					},
				}}
				className={currentTheme}
			>
				<TaskForm onSubmit={close} />
			</Modal>

			{!isMobile && <TaskForm />}

			<Tasks isMobile={isMobile} />
			{isMobile && <TopNavbar />}
			{isMobile && <MobileNavbar addNewButton={open} />}
		</div>
	);
};

export default Logged;
