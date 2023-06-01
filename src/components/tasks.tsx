import { useSession } from 'next-auth/react';

import { api } from '~/utils/api';
import { PusherProvider, useSubscribeToEvent } from '~/utils/pusher';

const Tasks: React.FC = () => {
	const { data: sessionData } = useSession();

	const { data: allTasksData, refetch } = api.tasks.getAllTasks.useQuery(undefined, {
		enabled: sessionData?.user !== undefined,
	});

	// const { data: tasksDataForUser } = api.tasks.getTasksForUser.useQuery(
	//     undefined,
	//     { enabled: sessionData?.user !== undefined },
	// );

	useSubscribeToEvent('new-task', () => {
		console.log('new task event received');
		void refetch();
	});

	const deleteTask = api.tasks.deleteTask.useMutation({
		onSuccess: () => {
			void refetch();
		},
	});

	return (
		<div className="flex w-full flex-col justify-center gap-4 md:max-w-[36rem] md:self-start">
			<button>Wszystie</button>
			<button>Moje</button>
			{allTasksData?.map((task) => (
				<div
					key={task.id}
					className="relative rounded-lg bg-white p-4 hover:bg-blue-100 focus:bg-gray-100"
				>
					<div className="flex items-center justify-between">
						<span className="block text-sm text-gray-500">{task.title}</span>
						<button
							onClick={() => {
								deleteTask.mutate({ id: task.id });
								void refetch();
							}}
							className="rounded-full bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
						>
							Delete
						</button>
					</div>
					<hr className="my-2" />
					<span className="block">{task.description}</span>
				</div>
			))}
		</div>
	);
};

export default function QuestionsViewWrapper() {
	const { data: sessionData } = useSession();

	if (!sessionData || !sessionData.user?.id) return null;

	return (
		<PusherProvider slug={`user-shayenek`}>
			<Tasks />
		</PusherProvider>
	);
}
