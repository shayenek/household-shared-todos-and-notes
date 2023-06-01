import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';

import MobileNavbar from '~/components/mobilenavbar';
import TaskForm from '~/components/taskform';
import Tasks from '~/components/tasks';
import TopNavbar from '~/components/topnavbar';

const Logged: React.FC = () => {
	const [opened, { open, close }] = useDisclosure(false);

	const [taskAuthor, setTaskAuthor] = useState<string>('all');

	const [width, setWidth] = useState<number>(0);

	useEffect(() => {
		const handleWindowSizeChange = () => {
			if (typeof window !== 'undefined') {
				setWidth(window.innerWidth);
			}
		};

		if (typeof window !== 'undefined') {
			setWidth(window.innerWidth);
			window.addEventListener('resize', handleWindowSizeChange);
			return () => {
				window.removeEventListener('resize', handleWindowSizeChange);
			};
		}
	}, []);

	const isMobile = width <= 768;

	return (
		<div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:gap-12">
			<Modal
				opened={opened}
				onClose={close}
				title="Add new item"
				centered
				styles={{
					content: {
						background: '#1d1f20',
						borderWidth: '2px',
						borderColor: '#2b3031',
					},
					header: {
						color: '#fff',
						background: '#1d1f20',
					},
				}}
			>
				<TaskForm onSubmit={close} />
			</Modal>

			{!isMobile && <TaskForm />}

			<Tasks taskAuthor={taskAuthor} setTaskAuthor={setTaskAuthor} isMobile={isMobile} />
			{isMobile && <TopNavbar setTaskAuthor={setTaskAuthor} />}
			{isMobile && <MobileNavbar addNewButton={open} />}
		</div>
	);
};

export default Logged;
