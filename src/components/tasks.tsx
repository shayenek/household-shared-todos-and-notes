import { modals } from '@mantine/modals';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import TaskElement from '~/components/taskitem';
import { api } from '~/utils/api';
import { PusherProvider, useSubscribeToEvent } from '~/utils/pusher';

const Tasks = ({
	isMobile,
	taskAuthor,
	setTaskAuthor,
}: {
	isMobile: boolean;
	taskAuthor: string;
	setTaskAuthor: (display: string) => void;
}) => {
	const { data: sessionData } = useSession();
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
			styles: {
				content: {
					background: '#1d1f20',
					borderWidth: '2px',
					borderColor: '#2b3031',
				},
				body: {
					color: '#fff',
					background: '#1d1f20',
				},
				header: {
					color: '#fff',
					background: '#1d1f20',
				},
				close: {
					background: '#17181c',
					borderWidth: '2px',
					borderColor: '#2b3031',
				},
			},
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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleTouchStart = () => {
		setTimer(setTimeout(onLongPress, 500)); // Adjust the duration as needed
	};

	const onLongPress = () => {
		alert('long press is triggered');
	};

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleTouchEnd = () => {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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
			<div className="align-center flex justify-between gap-2">
				{/* <button
					className="basis-1/2 bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
					onTouchStart={handleTouchStart}
					onTouchEnd={handleTouchEnd}
				>
					Wszystkie
				</button> */}
				{!isMobile && (
					<>
						<button
							className="basis-1/2 rounded-lg border-2 border-[#2b3031] bg-[#17181c] p-2 text-sm text-white hover:bg-blue-500"
							onClick={() => setTaskAuthor('all')}
						>
							All
						</button>
						<button
							className="basis-1/2 rounded-lg border-2 border-[#2b3031] bg-[#17181c] p-2 text-sm text-white hover:bg-blue-500"
							onClick={() => setTaskAuthor('mine')}
						>
							Mine
						</button>
					</>
				)}
			</div>
			<div className="flex flex-col gap-2">
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
		</div>
	);
};

// Can this code below take props from parent?
export default function TasksWrapper({
	isMobile,
	taskAuthor,
	setTaskAuthor,
}: {
	isMobile: boolean;
	taskAuthor: string;
	setTaskAuthor: (display: string) => void;
}) {
	const { data: sessionData } = useSession();

	if (!sessionData || !sessionData.user?.id) return null;

	return (
		<PusherProvider slug={`user-shayenek`}>
			<Tasks taskAuthor={taskAuthor} setTaskAuthor={setTaskAuthor} isMobile={isMobile} />
		</PusherProvider>
	);
}
