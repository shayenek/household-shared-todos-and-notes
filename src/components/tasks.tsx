import { modals } from '@mantine/modals';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import TaskElement from '~/components/taskitem';
import { api } from '~/utils/api';
import { PusherProvider, useSubscribeToEvent } from '~/utils/pusher';

const Tasks: React.FC = () => {
	const { data: sessionData } = useSession();
	const [taskAuthor, setTaskAuthor] = useState<'all' | 'mine'>('all');
	const [isBeingDeleted, setIsBeingDeleted] = useState<string | null>(null);

	const { data: allTasksData, refetch } = api.tasks.getAllTasks.useQuery(undefined, {
		enabled: sessionData?.user !== undefined,
	});

	const updateTaskStatus = api.tasks.updateTaskStatus.useMutation({
		onSuccess: () => {
			void refetch();
		},
	});

	const deleteTask = api.tasks.deleteTask.useMutation({
		onSuccess: () => {
			void refetch();
		},
		onError: (error, data) => {
			setIsBeingDeleted(data.id);
			console.log(error);
		},
	});

	const confirmDeletionModal = (taskId: string) =>
		modals.openConfirmModal({
			title: 'Do you really wanna delete that item?',
			centered: true,
			labels: { confirm: 'Confirm', cancel: 'Cancel' },
			onConfirm: () => {
				setIsBeingDeleted(taskId);
				deleteTask.mutate({ id: taskId });
			},
		});

	const handleDeleteTask = (taskId: string) => {
		confirmDeletionModal(taskId);
	};

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

	useSubscribeToEvent('new-task', () => {
		console.log('new task event received');
		void refetch();
	});

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
				<TaskElement
					key={task.id}
					task={task}
					deleteAction={() => {
						handleDeleteTask(task.id);
					}}
					updateAction={() => {
						updateTaskStatus.mutate({ id: task.id, completed: !task.completed });
						void refetch();
					}}
					isBeingDeleted={isBeingDeleted === task.id}
				/>
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
