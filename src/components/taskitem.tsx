/* eslint-disable @next/next/no-img-element */
import { Loader } from '@mantine/core';
import { type Task } from '@prisma/client';
import { IconLink } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import React, { useState, type ReactNode, useEffect } from 'react';

import isDarkColor from '~/utils/isDarkColor';

const TaskHeader: (
	taskTitle: string,
	handleClick: (buttonText: string) => void,
	activatedHashFilter: string
) => ReactNode = (taskTitle, handleClickWord, activatedHashFilter) => {
	const handleClickWrapper: (text: string) => void = (text) => {
		console.log(text, activatedHashFilter);
		handleClickWord(text);
	};

	if (taskTitle.includes('#')) {
		const taskTitleArray = taskTitle.split('#');
		const firstPart = taskTitleArray[0]?.trim();
		const hashtags = taskTitleArray.slice(1);

		return (
			<>
				<span>{firstPart}</span>
				<div className="flex gap-1">
					{hashtags.map((word) => {
						const wordArray = word.split('-');
						let cleanWord = '';
						if (typeof wordArray[0] !== 'undefined') {
							cleanWord = wordArray[0];
						}
						let wordBgColor = 'transparent';
						if (typeof wordArray[1] !== 'undefined') {
							wordBgColor = wordArray[1];
							wordBgColor = wordBgColor.replace('[', '').replace(']', '');
						}

						return (
							<button
								onClick={() => handleClickWrapper(`#${cleanWord}`)}
								className={`rounded-full px-2.5 py-1.5 text-xs font-bold${
									isDarkColor(wordBgColor) ? ' text-white' : ' text-black'
								}`}
								style={{
									backgroundColor:
										activatedHashFilter !== cleanWord
											? wordBgColor
													.replace('rgb(', 'rgba(')
													.replace(')', ', 0.5)')
											: wordBgColor,
								}}
								key={cleanWord}
							>
								#{cleanWord}
							</button>
						);
					})}
				</div>
			</>
		);
	} else {
		return <span>{taskTitle}</span>;
	}
};

const TaskDescription: (taskDescription: string) => ReactNode = (taskDescription) => {
	if (taskDescription.includes('https://') || taskDescription.includes('http://')) {
		const descriptionArray = taskDescription.split(/(https?:\/\/\S+)/gi);
		const newDescription = descriptionArray.map((word) => {
			if (word.includes('https://') || word.includes('http://')) {
				return (
					<a
						href={word}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-block text-blue-500 hover:underline"
						key={word}
					>
						<IconLink size={18} className="mr-1 inline" />
						<img
							src={`https://s2.googleusercontent.com/s2/favicons?domain=${word}`}
							alt={word}
							className="mr-1 inline rounded-sm"
						/>
						{word.replace('https://', '').replace('http://', '').replace('www.', '')}
					</a>
				);
			} else {
				return word;
			}
		});
		return <span>{newDescription}</span>;
	} else {
		return <span>{taskDescription}</span>;
	}
};

const TaskElement = ({
	task,
	updateElement,
	deleteAction,
	updateTaskStatus,
	isBeingDeleted,
	deletionInProgress,
	handleHashButtonClick,
	activatedHashFilter,
}: {
	task: Task;
	updateElement: () => void;
	deleteAction: () => void;
	updateTaskStatus: () => void;
	isBeingDeleted: boolean;
	deletionInProgress: boolean;
	handleHashButtonClick: (buttonText: string) => void;
	activatedHashFilter: string;
}) => {
	const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
	const { data: sessionData } = useSession();
	// const [taskDescription, setTaskDescription] = useState<string | ReactNode>('');

	const startDate = task.startDate;
	const endDate = task.endDate;
	const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString() : '';
	const formattedEndDate = endDate ? new Date(endDate).toLocaleDateString() : '';

	const handleTouchStart = () => {
		setTimer(setTimeout(onLongPress, 500));
	};

	const onLongPress = () => {
		alert('long press is triggered');
	};

	const handleTouchEnd = () => {
		if (timer) {
			clearTimeout(timer);
			// alert('short press is triggered');
		}
	};

	return (
		<div
			key={task.id}
			className={`relative overflow-hidden rounded-lg p-4 transition duration-200 ease-in-out ${
				task.completed ? 'bg-green-100' : 'bg-white dark:bg-[#1d1f20]'
			}`}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
		>
			{task.title && (
				<>
					<div className="flex items-center justify-between">
						<div className="flex w-full items-center justify-between text-xs font-bold text-[#030910] dark:text-[#e0e2e4] md:text-sm">
							{TaskHeader(task.title, handleHashButtonClick, activatedHashFilter)}
						</div>
						{task.type === 'task' && (
							<span className="text-xs">
								{task.startTime}, {formattedStartDate} - {task.endTime},{' '}
								{formattedEndDate}
							</span>
						)}
					</div>
					<hr
						className={`my-2 mt-3 transition duration-200 ease-in-out ${
							task.completed
								? 'border-white'
								: 'border-[#dce2e7] dark:border-[#2d2f31]'
						}`}
					/>
				</>
			)}

			<p
				className="block text-sm text-[#7c7e82] dark:text-[#7e8083] md:text-base"
				style={{ whiteSpace: 'pre-line' }}
			>
				{task.description && TaskDescription(task.description)}
			</p>

			{task.description && (
				<hr className="my-2 mt-3 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]" />
			)}

			<div className="flex justify-center gap-2">
				{task.type === 'task' && (
					<>
						<button
							className={`w-20 rounded-lg px-4 py-2 text-sm font-bold text-white  ${
								task.completed
									? 'bg-orange-500 hover:bg-orange-600'
									: 'bg-green-600 hover:bg-green-800'
							}`}
							onClick={updateTaskStatus}
						>
							{task.completed ? 'Undone' : 'Done'}
						</button>
					</>
				)}
				{sessionData && (
					<>
						<button
							onClick={updateElement}
							className={`w-20 rounded-lg bg-blue-500 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 ${
								deletionInProgress ? 'opacity-50' : 'opacity-100'
							}`}
							disabled={deletionInProgress || isBeingDeleted}
						>
							Edit
						</button>
						<button
							onClick={deleteAction}
							className={`w-20 rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-800 ${
								deletionInProgress ? 'opacity-50' : 'opacity-100'
							}`}
							disabled={deletionInProgress || isBeingDeleted}
						>
							Delete
						</button>
					</>
				)}
			</div>
			{isBeingDeleted && (
				<div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-[#000000ab]">
					<Loader color="red" />;
				</div>
			)}
		</div>
	);
};

export default TaskElement;
