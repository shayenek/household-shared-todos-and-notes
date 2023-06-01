import { TextInput, Group, Textarea, Select } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconCalendar } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';

import { api } from '~/utils/api';

const TaskForm = ({ className, onSubmit }: { className?: string; onSubmit?: () => void }) => {
	const { data: sessionData } = useSession();
	const [formType, setFormType] = useState<'note' | 'task'>('note');

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
			className={`w-full rounded-lg bg-[#1d1f20] p-4 md:max-w-[20rem] md:self-start lg:min-w-[20rem] ${
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
			<hr className="my-2 mt-3 border-[#2d2f31] transition duration-200 ease-in-out" />
			<form onSubmit={addTaskForm.onSubmit((values) => console.log(values))}>
				<TextInput
					label="Task title"
					placeholder="Title"
					{...addTaskForm.getInputProps('title')}
					styles={{
						label: {
							color: '#fff',
							fontSize: '0.75rem',
						},
						input: {
							color: '#fff',
							background: '#2d3338',
							borderColor: '#2d3338',
						},
					}}
					mb="sm"
				/>

				<Textarea
					withAsterisk
					label="Task description"
					placeholder="desc"
					minRows={8}
					{...addTaskForm.getInputProps('description')}
					styles={{
						label: {
							color: '#fff',
							fontSize: '0.75rem',
						},
						input: {
							color: '#fff',
							background: '#2d3338',
							borderColor: '#2d3338',
						},
					}}
					mb="sm"
				/>

				{formType === 'task' && (
					<>
						<DatePickerInput
							icon={<IconCalendar size="1.1rem" stroke={1.5} />}
							clearable
							valueFormat="DD-MM-YYYY"
							label="Start date"
							placeholder="Start date"
							maw={400}
							mx="auto"
							{...addTaskForm.getInputProps('startDate')}
							styles={{
								label: {
									color: '#fff',
									fontSize: '0.75rem',
								},
								input: {
									color: '#fff',
									background: '#2d3338!important',
									borderColor: '#2d3338!important',
								},
							}}
							mb="sm"
						/>
						<Select
							label="Start time"
							placeholder="Start time"
							data={createTimesThroughDay()}
							{...addTaskForm.getInputProps('startTime')}
							styles={{
								label: {
									color: '#fff',
									fontSize: '0.75rem',
								},
								input: {
									color: '#fff',
									background: '#2d3338!important',
									borderColor: '#2d3338!important',
								},
							}}
							mb="sm"
						/>
						<DatePickerInput
							icon={<IconCalendar size="1.1rem" stroke={1.5} />}
							clearable
							valueFormat="DD-MM-YYYY"
							label="End date"
							placeholder="End date"
							maw={400}
							mx="auto"
							minDate={addTaskForm.values.startDate}
							{...addTaskForm.getInputProps('endDate')}
							styles={{
								label: {
									color: '#fff',
									fontSize: '0.75rem',
								},
								input: {
									color: '#fff',
									background: '#2d3338!important',
									borderColor: '#2d3338!important',
								},
								rightSection: {
									background: '#2d3338!important',
									borderColor: '#2d3338!important',
								},
							}}
							mb="sm"
						/>
						<Select
							label="End time"
							placeholder="End time"
							data={createTimesThroughDay()}
							{...addTaskForm.getInputProps('endTime')}
							styles={{
								label: {
									color: '#fff',
									fontSize: '0.75rem',
								},
								input: {
									color: '#fff',
									background: '#2d3338!important',
									borderColor: '#2d3338!important',
								},
							}}
							mb="sm"
						/>
					</>
				)}

				<Group position="center" mt="md">
					<button
						onClick={() => {
							addTask.mutate({ ...addTaskForm.values, type: formType });
						}}
						type="submit"
						className="basis-1/2 rounded-lg border-2 border-[#2b3031] bg-[#17181c] p-2 text-sm text-white hover:bg-blue-500"
					>
						Add {formType === 'task' ? 'task' : 'note'}
					</button>
				</Group>
			</form>
		</div>
	);
};

export default TaskForm;
