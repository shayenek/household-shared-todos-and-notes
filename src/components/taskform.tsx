import { TextInput, Button, Group, Textarea, Select, Input } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { api } from '~/utils/api';

const TaskForm = ({ className, onSubmit }: { className?: string; onSubmit?: () => void }) => {
	const { data: sessionData } = useSession();
	const [formType, setFormType] = useState<'note' | 'task'>('note');
	const [startDate, setStartDate] = useState<Date | null>(null);
	const [startTime, setStartTime] = useState<string | null>(null);
	const [endDate, setEndDate] = useState<Date | null>(null);
	const [endTime, setEndTime] = useState<string | null>(null);

	const { refetch } = api.tasks.getTasksForUser.useQuery(undefined, {
		enabled: sessionData?.user !== undefined,
	});

	const addTaskForm = useForm({
		initialValues: {
			title: '',
			description: '',
			startDate: new Date(),
			startTime: '',
			endDate: new Date(),
			endTime: '',
		},
	});

	const addTask = api.tasks.createTask.useMutation({
		onSuccess: () => {
			addTaskForm.reset();
			onSubmit?.();
			void refetch();
		},
	});

	const createTimesThroughDay = () => {
		const times: string[] = [];
		for (let i = 0; i < 24; i++) {
			for (let j = 0; j < 60; j += 15) {
				if (i < 10) {
					if (j < 10) {
						times.push(`0${i}:0${j}`);
					} else {
						times.push(`0${i}:${j}`);
					}
				} else {
					if (j < 10) {
						times.push(`${i}:0${j}`);
					} else {
						times.push(`${i}:${j}`);
					}
				}
			}
		}
		return times;
	};

	return (
		<div
			className={`w-full rounded-lg bg-white p-4 md:max-w-[20rem] md:self-start lg:min-w-[20rem] ${
				className ?? ''
			}`}
		>
			<div className="flex justify-center gap-2">
				<button
					onClick={() => setFormType('note')}
					className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
				>
					Note
				</button>
				<button
					onClick={() => setFormType('task')}
					className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
				>
					Task
				</button>
			</div>
			<hr className="my-4 border-gray-200" />
			<form onSubmit={addTaskForm.onSubmit((values) => console.log(values))}>
				<TextInput
					label="Task title"
					placeholder="title"
					{...addTaskForm.getInputProps('title')}
				/>

				<Textarea
					withAsterisk
					label="Task description"
					placeholder="desc"
					minRows={8}
					{...addTaskForm.getInputProps('description')}
				/>

				{formType === 'task' && (
					<>
						<DatePickerInput
							clearable
							valueFormat="DD-MM-YYYY"
							label="Start date"
							placeholder="Start date"
							maw={400}
							mx="auto"
							{...addTaskForm.getInputProps('startDate')}
						/>
						<Select
							label="Start time"
							placeholder="Start time"
							data={createTimesThroughDay()}
							{...addTaskForm.getInputProps('startTime')}
						/>
						<DatePickerInput
							clearable
							valueFormat="DD-MM-YYYY"
							label="End date"
							placeholder="End date"
							maw={400}
							mx="auto"
							minDate={startDate ?? undefined}
							{...addTaskForm.getInputProps('endDate')}
						/>
						<Select
							label="End time"
							placeholder="End time"
							data={createTimesThroughDay()}
							{...addTaskForm.getInputProps('endTime')}
						/>
					</>
				)}

				<Group position="center" mt="md">
					<Button
						onClick={() => {
							addTask.mutate({ ...addTaskForm.values, type: formType });
						}}
						type="submit"
						className="bg-blue-500 hover:bg-blue-600"
					>
						Add {formType === 'task' ? 'task' : 'note'}
					</Button>
				</Group>
			</form>
		</div>
	);
};

export default TaskForm;
