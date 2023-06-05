import { Loader } from '@mantine/core';
import { type Task } from '@prisma/client';
import React, { useState, type ReactNode } from 'react';

const isDarkColor = (color: string) => {
	color = color.replace(/\s/g, '').toLowerCase();

	if (color.startsWith('rgb(') && color.endsWith(')')) {
		const rgbValues = color.substring(4, color.length - 1).split(',');

		let r,
			g,
			b = 0;

		if (typeof rgbValues[0] !== 'undefined') {
			r = parseInt(rgbValues[0]);
		}
		if (typeof rgbValues[1] !== 'undefined') {
			g = parseInt(rgbValues[1]);
		}
		if (typeof rgbValues[2] !== 'undefined') {
			b = parseInt(rgbValues[2]);
		}

		let luminance = 0;
		if (typeof r !== 'undefined' && typeof g !== 'undefined' && typeof b !== 'undefined') {
			luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
		}

		if (luminance <= 0.5) {
			return true;
		} else {
			return false;
		}
	}

	return false;
};

const TaskHeader: (taskTitle: string, handleClick: (buttonText: string) => void) => ReactNode = (
	taskTitle,
	handleClickWord
) => {
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

						const handleClickWrapper = () => {
							handleClickWord(`#${cleanWord}`);
						};

						return (
							<button
								onClick={handleClickWrapper}
								className={`mr-1 rounded-full px-2.5 py-1.5 text-xs font-bold${
									isDarkColor(wordBgColor) ? ' text-white' : ' text-black'
								}`}
								style={{ backgroundColor: wordBgColor }}
								key={cleanWord}
							>
								#{cleanWord.trim()}
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

const TaskElement = ({
	task,
	deleteAction,
	updateAction,
	isBeingDeleted,
	handleHashButtonClick,
}: {
	task: Task;
	deleteAction: () => void;
	updateAction: () => void;
	isBeingDeleted: boolean;
	handleHashButtonClick: (buttonText: string) => void;
}) => {
	const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

	const startDate = task.startDate;
	const endDate = task.endDate;
	const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString() : '';
	const formattedEndDate = endDate ? new Date(endDate).toLocaleDateString() : '';

	const handleButtonClick = (buttonText: string) => {
		handleHashButtonClick(buttonText);
	};

	const handleTouchStart = () => {
		setTimer(setTimeout(onLongPress, 500)); // Adjust the duration as needed
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
				task.completed ? 'bg-green-100' : 'bg-[#1d1f20]'
			}`}
			onTouchStart={handleTouchStart}
			onTouchEnd={handleTouchEnd}
		>
			{task.title && (
				<>
					<div className="flex items-center justify-between">
						<div className="mt-1 flex w-full items-center justify-between text-xs font-bold text-[#e0e2e4] md:text-sm">
							{TaskHeader(task.title, handleButtonClick)}
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
							task.completed ? 'border-white' : 'border-[#2d2f31]'
						}`}
					/>
				</>
			)}

			<p
				className="mr-20 block text-sm text-[#5f6163] md:text-base"
				style={{ whiteSpace: 'pre-line' }}
			>
				{task.description}
			</p>

			{task.description && (
				<hr className="my-2 mt-3 border-[#2d2f31] transition duration-200 ease-in-out" />
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
							onClick={updateAction}
						>
							{task.completed ? 'Undone' : 'Done'}
						</button>
					</>
				)}
				<button
					onClick={deleteAction}
					className="w-20 rounded-lg bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-800"
				>
					Delete
				</button>
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
