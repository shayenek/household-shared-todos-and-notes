import { Loader } from '@mantine/core';
import { modals } from '@mantine/modals';
import { type Task } from '@prisma/client';
import { IconDragDrop } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from 'react-beautiful-dnd';

import TaskElement from '~/components/taskitem';
import { type TaskAuthorState, useTaskAuthorStore } from '~/store/store';
import { type TaskAuthorType } from '~/types/author';
import { api } from '~/utils/api';
import { PusherProvider, useSubscribeToEvent } from '~/utils/pusher';
import { useScrollPosition } from '~/utils/useScrollPosition';

const TASKS_LIMIT_PER_PAGE = 5;
const SCROLL_POSITION_TO_FETCH_NEXT_PAGE = 85;

const Tasks = ({ isMobile }: { isMobile: boolean }) => {
	const { data: sessionData } = useSession();
	const taskAuthor = useTaskAuthorStore((state: TaskAuthorState) => state.taskAuthor);

	const [taskData, setTaskData] = useState<Task[]>([]);
	const [isBeingDeleted, setIsBeingDeleted] = useState<string | null>(null);
	const [deletionInProgress, setDeletionInProgress] = useState<boolean>(false);
	const [hashWord, setHashWord] = useState<string | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [page, setPage] = useState(0);

	const scrollPosition = useScrollPosition();
	const setTaskAuthor = (author: TaskAuthorType) => {
		useTaskAuthorStore.setState({ taskAuthor: author });
	};

	const {
		data: allTasksData,
		hasNextPage,
		fetchNextPage,
		isFetching,
		refetch,
	} = api.tasks.getInfiniteTasks.useInfiniteQuery(
		{ limit: TASKS_LIMIT_PER_PAGE },
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	);

	const updateTaskStatus = api.tasks.updateTaskStatus.useMutation({
		onSuccess: () => {
			void refetch();
		},
	});

	const updateTaskPosition = api.tasks.updateTaskPosition.useMutation({
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

	const filterByHash = (buttonText: string) => {
		const cleanedButtonText = buttonText.replace('#', '').replace(' ', '');
		const cleanedHashWord = hashWord ? hashWord.replace('#', '').replace(' ', '') : null;

		if (cleanedButtonText === cleanedHashWord) {
			setHashWord(null);
			return;
		}

		setHashWord(cleanedButtonText);
	};

	const onDragEndHandler = (result: DropResult) => {
		const { destination, source, draggableId } = result;

		if (!destination) {
			return;
		}

		if (destination.droppableId === source.droppableId && destination.index === source.index) {
			return;
		}

		const task = taskData?.find((task) => task.id === draggableId);

		if (!task) {
			return;
		}

		if (!taskData) return;

		const newTaskData = [...taskData];
		newTaskData.splice(source.index, 1);
		newTaskData.splice(destination.index, 0, task);

		setTaskData(newTaskData);

		let previousItemPosition = newTaskData[destination.index - 1]?.position;
		let nextItemPosition = newTaskData[destination.index + 1]?.position;
		let newPosition = 0;

		if (!previousItemPosition && nextItemPosition) {
			previousItemPosition = nextItemPosition + 1024;
			nextItemPosition = taskData[destination.index]?.position;
		}

		if (!nextItemPosition || !previousItemPosition) return;
		if (destination.index === 0) {
			newPosition = previousItemPosition;
		} else if (destination.index === taskData.length - 1) {
			newPosition = nextItemPosition - 1024;
		} else {
			newPosition = (previousItemPosition + nextItemPosition) / 2;
		}

		if (newPosition === nextItemPosition) {
			newPosition = newPosition - 1;
		}

		if (newPosition !== task.position) {
			updateTaskPosition.mutate({ id: task.id, position: newPosition });
		}
	};

	const sortByHash = (data: Task[], hash: string | null) => {
		if (!hash) return data;

		const newData = data?.filter((task) => {
			const words = task.title.split(' ');
			const filteredWords = words.filter((word) => {
				if (word.includes('#')) {
					const cleanedWord = word.replace('#', '').replace(' ', '').split('-')[0];
					const cleanedHash = hash.replace(' ', '').replace('#', '');
					if (cleanedWord === cleanedHash) {
						return true;
					}
				}
				return false;
			});
			return filteredWords.length > 0;
		});

		return newData;
	};

	useEffect(() => {
		if (allTasksData) {
			let newTaskData = allTasksData?.pages.flatMap((page) => page.items);

			if (taskAuthor === 'mine') {
				newTaskData = newTaskData.filter((task) => task.authorId === sessionData?.user?.id);
			}

			if (hashWord) {
				newTaskData = sortByHash(newTaskData, hashWord);
			}

			setTaskData(newTaskData);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [allTasksData, taskAuthor, hashWord]);

	useSubscribeToEvent(() => {
		console.log('event received');
		void refetch();
	});

	useEffect(() => {
		if (scrollPosition > SCROLL_POSITION_TO_FETCH_NEXT_PAGE && hasNextPage && !isFetching) {
			void fetchNextPage();
			setPage((prev) => prev + 1);
		}
	}, [scrollPosition, fetchNextPage, hasNextPage, isFetching]);

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
				<DragDropContext onDragEnd={onDragEndHandler}>
					<Droppable droppableId="droppable">
						{(droppableProvided) => (
							<div
								className={`flex flex-col gap-2`}
								ref={droppableProvided.innerRef}
								{...droppableProvided.droppableProps}
							>
								{taskData?.map((task, index) => (
									<Draggable draggableId={task.id} key={task.id} index={index}>
										{(draggableProvided, draggableSnapshot) => (
											<div
												{...draggableProvided.draggableProps}
												{...(isMobile
													? draggableProvided.dragHandleProps
													: {})}
												ref={draggableProvided.innerRef}
												data-position={task.position}
												className="relative"
											>
												{!isMobile && (
													<div
														className="absolute bottom-2 right-2 z-[1]"
														{...draggableProvided.dragHandleProps}
													>
														<IconDragDrop
															size={20}
															className="stroke-[#7c7e82] dark:stroke-[#7e8083]"
														/>
													</div>
												)}
												<TaskElement
													task={task}
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
													className={`${
														draggableSnapshot.isDragging
															? 'bg-[#e8e8e8] dark:bg-[#292c2d]'
															: ''
													}`}
												/>
											</div>
										)}
									</Draggable>
								))}
								{isFetching && (
									<div className="flex w-full items-center justify-center py-2">
										<Loader />
									</div>
								)}
								{droppableProvided.placeholder}
							</div>
						)}
					</Droppable>
				</DragDropContext>
			</div>
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
