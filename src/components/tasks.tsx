import { modals } from '@mantine/modals';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import TaskElement from '~/components/taskitem';
import { type TaskAuthorState, useTaskAuthorStore } from '~/store/store';
import { api } from '~/utils/api';
import { PusherProvider, useSubscribeToEvent } from '~/utils/pusher';

const Tasks = ({ isMobile }: { isMobile: boolean }) => {
	const { data: sessionData } = useSession();
	const [isBeingDeleted, setIsBeingDeleted] = useState<string | null>(null);
	const [deletionInProgress, setDeletionInProgress] = useState<boolean>(false);
	const [hashWord, setHashWord] = useState<string | null>(null);
	const taskAuthor = useTaskAuthorStore((state: TaskAuthorState) => state.taskAuthor);

	const { data: allTasksData, refetch } = api.tasks.getAllTasks.useQuery();

	const updateTaskStatus = api.tasks.updateTaskStatus.useMutation({
		onSuccess: () => {
			void refetch();
		},
	});

	const deleteTask = api.tasks.deleteTask.useMutation({
		onSuccess: () => {
			setDeletionInProgress(false);
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
				setDeletionInProgress(true);
				deleteTask.mutate({ id: taskId });
			},
		});

	const handleDeleteTask = (taskId: string) => {
		confirmDeletionModal(taskId);
	};

	let filteredTasks =
		taskAuthor === 'mine'
			? allTasksData?.filter((task) => task.authorId === sessionData?.user?.id)
			: allTasksData;

	const filterByHash = (buttonText: string) => {
		const cleanedButtonText = buttonText.replace('#', '').replace(' ', '');
		const cleanedHashWord = hashWord ? hashWord.replace('#', '').replace(' ', '') : null;

		if (cleanedButtonText === cleanedHashWord) {
			setHashWord(null);
			return;
		}

		setHashWord(cleanedButtonText);
	};

	if (hashWord) {
		filteredTasks = filteredTasks?.filter((task) => {
			const words = task.title.split(' ');
			const filteredWords = words.filter((word) => {
				if (word.includes('#')) {
					const cleanedWord = word.replace('#', '').replace(' ', '').split('-')[0];
					const cleanedHash = hashWord.replace(' ', '').replace('#', '');
					if (cleanedWord === cleanedHash) {
						return true;
					}
				}
				return false;
			});
			return filteredWords.length > 0;
		});
	}

	useSubscribeToEvent('new-task, delete-task', () => {
		console.log('event received');
		void refetch();
	});

	const setTaskAuthor = (author: 'all' | 'mine') => {
		useTaskAuthorStore.setState({ taskAuthor: author });
	};

	return (
		<div
			className={`flex w-full flex-col justify-center gap-4 md:self-start ${
				sessionData ? 'md:max-w-[36rem]' : ''
			}`}
		>
			<div className="align-center flex justify-between gap-2">
				{!isMobile && sessionData && (
					<>
						<button
							className={`basis-1/2 rounded-lg border-2 border-[#eeedf0] bg-white p-2 text-sm font-bold hover:bg-blue-500 dark:border-[#2b3031] dark:bg-[#17181c] dark:text-white ${
								taskAuthor === 'all' ? '!bg-blue-500 text-white' : ''
							}`}
							onClick={() => setTaskAuthor('all')}
						>
							All
						</button>
						<button
							className={`basis-1/2 rounded-lg border-2 border-[#eeedf0] bg-white p-2 text-sm font-bold hover:bg-blue-500 dark:border-[#2b3031] dark:bg-[#17181c] dark:text-white ${
								taskAuthor === 'mine' ? '!bg-blue-500 text-white' : ''
							}`}
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
						deletionInProgress={deletionInProgress}
						handleHashButtonClick={filterByHash}
						activatedHashFilter={hashWord ? hashWord : ''}
					/>
				))}
			</div>
		</div>
	);
};

export default function TasksWrapper({ isMobile }: { isMobile: boolean }) {
	return (
		<PusherProvider slug={`user-shayenek`}>
			<Tasks isMobile={isMobile} />
		</PusherProvider>
	);
}
