import { Loader } from '@mantine/core';
import { type Task } from '@prisma/client';
import React from 'react';

const TaskElement = ({
	task,
	deleteAction,
	updateAction,
	isBeingDeleted,
}: {
	task: Task;
	deleteAction: () => void;
	updateAction: () => void;
	isBeingDeleted: boolean;
}) => {
	const startDate = task.startDate;
	const endDate = task.endDate;
	const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString() : '';
	const formattedEndDate = endDate ? new Date(endDate).toLocaleDateString() : '';

	return (
		<div
			key={task.id}
			className={`relative overflow-hidden rounded-lg p-4 transition duration-200 ease-in-out ${
				task.completed ? 'bg-green-100' : 'bg-white'
			}`}
		>
			{task.title && (
				<>
					<div className="flex items-center justify-between">
						<span className="mr-20 mt-1 block text-xs text-gray-500 md:text-sm">
							{task.title}
						</span>
						{task.type === 'task' && (
							<span className="text-xs">
								{task.startTime}, {formattedStartDate} - {task.endTime},{' '}
								{formattedEndDate}
							</span>
						)}
					</div>
					<hr
						className={`my-2 mt-3 transition duration-200 ease-in-out ${
							task.completed ? 'border-white' : 'border-gray-300'
						}`}
					/>
				</>
			)}

			<p className="mr-20 block text-sm md:text-base" style={{ whiteSpace: 'pre-line' }}>
				{task.description}
			</p>

			<hr className="my-2 mt-3 transition duration-200 ease-in-out" />

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
