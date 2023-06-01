import { Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useSession } from 'next-auth/react';

import TaskForm from '~/components/taskform';
import Tasks from '~/components/tasks';
import { api } from '~/utils/api';

const Logged: React.FC = () => {
	const { data: sessionData } = useSession();
	const [opened, { open, close }] = useDisclosure(false);

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { data: userData } = api.users.getUserData.useQuery(undefined, {
		enabled: sessionData?.user !== undefined,
	});

	return (
		<div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:gap-12">
			<Modal opened={opened} onClose={close} title="Add new item" centered>
				<TaskForm onSubmit={close} />
			</Modal>

			<button
				onClick={open}
				className="w-full rounded-lg bg-green-700 py-4 text-white hover:bg-green-900 md:hidden"
			>
				Add new
			</button>

			<TaskForm className="hidden md:block" />
			<Tasks />
		</div>
	);
};

export default Logged;
