import { useSession } from 'next-auth/react';

import TaskForm from '~/components/taskform';
import Tasks from '~/components/tasks';
import { api } from '~/utils/api';

const Logged: React.FC = () => {
	const { data: sessionData } = useSession();

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { data: userData } = api.users.getUserData.useQuery(undefined, {
		enabled: sessionData?.user !== undefined,
	});

	return (
		<div className="flex w-full flex-col items-center justify-center gap-12 md:flex-row">
			<TaskForm />
			<Tasks />
		</div>
	);
};

export default Logged;
