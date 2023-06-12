import { Loader, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import { type Task } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import TaskElement from '~/components/taskitem';
import {
	type TaskAuthorState,
	useTaskAuthorStore,
	useThemeStore,
	type ThemeState,
} from '~/store/store';
import { type TaskAuthorType } from '~/types/author';
import { api } from '~/utils/api';
import { PusherProvider, useSubscribeToEvent } from '~/utils/pusher';

import TaskForm from './taskform';

const useScrollPosition = () => {
	const [scrollPosition, setScrollPosition] = useState<number>(0);

	const handleScroll = () => {
		const height =
			document.documentElement.scrollHeight - document.documentElement.clientHeight;
		const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
		const scrolled = (winScroll / height) * 100;

		setScrollPosition(scrolled);
	};

	useEffect(() => {
		window.addEventListener('scroll', handleScroll, {
			passive: true,
		});
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	return scrollPosition;
};

const Tasks = ({ isMobile }: { isMobile: boolean }) => {
	const { data: sessionData } = useSession();
	const [isBeingDeleted, setIsBeingDeleted] = useState<string | null>(null);
	const [deletionInProgress, setDeletionInProgress] = useState<boolean>(false);
	const [hashWord, setHashWord] = useState<string | null>(null);
	const [editModalTask, setEditModalTask] = useState<Task | undefined>(undefined);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [page, setPage] = useState(0);

	const currentTheme = useThemeStore((state: ThemeState) => state.theme);

	const taskAuthor = useTaskAuthorStore((state: TaskAuthorState) => state.taskAuthor);

	const [editModalOpened, { open, close }] = useDisclosure(false);

	const {
		data: allTasksData,
		hasNextPage,
		fetchNextPage,
		isFetching,
		refetch,
	} = api.tasks.getInfiniteTasks.useInfiniteQuery(
		{ limit: 4 },
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);

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

	const handleUpdateTask = (task: Task) => {
		setEditModalTask(task);
		open();
	};

	let filteredTasks =
		taskAuthor === 'mine'
			? allTasksData?.pages
					.flatMap((page) => page.items)
					.filter((task) => task.authorId === sessionData?.user?.id)
			: allTasksData?.pages.flatMap((page) => page.items);

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

	const setTaskAuthor = (author: TaskAuthorType) => {
		useTaskAuthorStore.setState({ taskAuthor: author });
	};

	const ScrollPosition = useScrollPosition();

	useEffect(() => {
		if (ScrollPosition > 90 && hasNextPage && !isFetching) {
			console.log('test');
			void fetchNextPage();
			setPage((prev) => prev + 1);
		}
	}, [ScrollPosition, fetchNextPage, hasNextPage, isFetching]);

	return (
		<>
			<div
				className={`flex w-full flex-col justify-center gap-4 md:self-start ${
					sessionData ? 'md:max-w-[36rem]' : ''
				}`}
			>
				<div className="align-center flex justify-between gap-2">
					{!isMobile && sessionData && (
						<>
							<button
								className={`basis-1/2 rounded-lg border-2 border-[#eeedf0] bg-white p-2 text-sm font-bold hover:!bg-blue-500 dark:border-[#2b3031] dark:bg-[#17181c] dark:text-white ${
									taskAuthor === 'all' ? '!bg-blue-500 text-white' : ''
								}`}
								onClick={() => setTaskAuthor('all')}
							>
								All
							</button>
							<button
								className={`basis-1/2 rounded-lg border-2 border-[#eeedf0] bg-white p-2 text-sm font-bold hover:!bg-blue-500 dark:border-[#2b3031] dark:bg-[#17181c] dark:text-white ${
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
							updateElement={() => {
								handleUpdateTask(task);
							}}
							deleteAction={() => {
								handleDeleteTask(task.id);
							}}
							updateTaskStatus={() => {
								updateTaskStatus.mutate({
									id: task.id,
									completed: !task.completed,
								});
								void refetch();
							}}
							isBeingDeleted={isBeingDeleted === task.id}
							deletionInProgress={deletionInProgress}
							handleHashButtonClick={filterByHash}
							activatedHashFilter={hashWord ? hashWord : ''}
						/>
					))}
					{isFetching && (
						<div className="flex w-full items-center justify-center py-2">
							<Loader />
						</div>
					)}
				</div>
			</div>
			<Modal
				opened={editModalOpened}
				onClose={close}
				title="Edit task"
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
				<TaskForm onSubmit={close} task={editModalTask} />
			</Modal>
		</>
	);
};

export default function TasksWrapper({ isMobile }: { isMobile: boolean }) {
	return (
		<PusherProvider slug={`user-shayenek`}>
			<Tasks isMobile={isMobile} />
		</PusherProvider>
	);
}
