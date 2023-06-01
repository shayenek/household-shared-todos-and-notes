import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { api } from '~/utils/api';
import { PusherProvider, useSubscribeToEvent } from '~/utils/pusher';

const Tasks: React.FC = () => {
	const { data: sessionData } = useSession();
	const [taskAuthor, setTaskAuthor] = useState<'all' | 'mine'>('all');

	const { data: allTasksData, refetch } = api.tasks.getAllTasks.useQuery(undefined, {
		enabled: sessionData?.user !== undefined,
	});

	useSubscribeToEvent('new-task', () => {
		console.log('new task event received');
		void refetch();
	});

	const deleteTask = api.tasks.deleteTask.useMutation({
		onSuccess: () => {
			void refetch();
		},
	});

	const filteredTasks =
		taskAuthor === 'mine'
			? allTasksData?.filter((task) => task.authorId === sessionData?.user?.id)
			: allTasksData;

	const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

	const handleTouchStart = () => {
		setTimer(setTimeout(onLongPress, 500)); // Adjust the duration as needed
	};

	const onLongPress = () => {
		alert('long press is triggered');
	};

	const handleTouchEnd = () => {
		clearTimeout(timer!);
		if (timer) {
			alert('test');
		}
	};

	return (
		<div className="flex w-full flex-col justify-center gap-4 md:max-w-[36rem] md:self-start">
			<div className="align-center flex justify-between gap-6">
				{/* <button
					className="basis-1/2 bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
					onTouchStart={handleTouchStart}
					onTouchEnd={handleTouchEnd}
				>
					Wszystkie
				</button> */}
				<button
					className="basis-1/2 rounded-lg bg-blue-500 p-4 text-white hover:bg-blue-600"
					onClick={() => setTaskAuthor('all')}
				>
					All
				</button>
				<button
					className="basis-1/2 rounded-lg bg-blue-500 p-4 text-white hover:bg-blue-600"
					onClick={() => setTaskAuthor('mine')}
				>
					Mine
				</button>
			</div>
			{filteredTasks?.map((task) => (
				<div
					key={task.id}
					className="relative rounded-lg bg-white p-4 hover:bg-blue-100 focus:bg-gray-100"
				>
					{task.title && (
						<>
							<span className="mr-20 mt-1 block text-xs text-gray-500 md:text-sm">
								{task.title}
							</span>
							<hr className="my-2 mt-3" />
						</>
					)}

					<p
						className="mr-20 block text-sm md:text-base"
						style={{ whiteSpace: 'pre-line' }}
					>
						{task.description}
					</p>

					<button
						onClick={() => {
							deleteTask.mutate({ id: task.id });
							void refetch();
						}}
						className="absolute right-2 top-2 rounded-full bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600"
					>
						Delete
					</button>
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
