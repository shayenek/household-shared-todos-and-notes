import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';

import MobileNavbar from '~/components/mobilenavbar';
import TaskForm from '~/components/taskform';
import Tasks from '~/components/tasks';

const Logged: React.FC = () => {
	const [opened, { open, close }] = useDisclosure(false);

	const [width, setWidth] = useState<number>(window.innerWidth);

	function handleWindowSizeChange() {
		setWidth(window.innerWidth);
	}
	useEffect(() => {
		window.addEventListener('resize', handleWindowSizeChange);
		return () => {
			window.removeEventListener('resize', handleWindowSizeChange);
		};
	}, []);

	const isMobile = width <= 768;

	return (
		<div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:gap-12">
			<Modal opened={opened} onClose={close} title="Add new item" centered>
				<TaskForm onSubmit={close} />
			</Modal>

			{!isMobile && <TaskForm />}

			<Tasks />
			{isMobile && <MobileNavbar addNewButton={open} />}
		</div>
	);
};

export default Logged;
