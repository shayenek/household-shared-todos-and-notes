import { TextInput, Group, Textarea, ActionIcon } from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { isNotEmpty, useForm } from '@mantine/form';
import { closeModal } from '@mantine/modals';
import { type Task } from '@prisma/client';
import { IconCalendar, IconClock } from '@tabler/icons-react';
import { type MutableRefObject, useEffect, useRef, useState } from 'react';

import { type ThemeState, useThemeStore } from '~/store/store';
import { api } from '~/utils/api';

const TaskForm = ({ className, task }: { className?: string; task?: Task }) => {
	const [formType, setFormType] = useState<'note' | 'task'>('note');
	const currentTheme = useThemeStore((state: ThemeState) => state.theme);

	const startTimeRef = useRef<HTMLInputElement>();
	const endTimeRef = useRef<HTMLInputElement>();

	const addTaskForm = useForm({
		initialValues: {
			id: task?.id ?? '',
			title: task?.title.replace(/-\[rgb\(\d+,\d+,\d+\)\]/g, '') ?? '',
			description: task?.description ?? '',
			type: task?.type ?? '',
			startDate: new Date(),
			startTime: '',
			endDate: new Date(),
			endTime: '',
		},
		validate: {
			startDate: formType === 'task' ? isNotEmpty('Start date is required') : undefined,
			startTime: formType === 'task' ? isNotEmpty('Start time is required') : undefined,
			endDate: formType === 'task' ? isNotEmpty('End date is required') : undefined,
			endTime: formType === 'task' ? isNotEmpty('End time is required') : undefined,
		},
	});

	const addTask = api.tasks.createTask.useMutation({
		onSuccess: () => {
			addTaskForm.reset();
			closeModal('addTaskModal');
		},
	});

	const updateTask = api.tasks.updateTask.useMutation({
		onSuccess: () => {
			closeModal('editTaskModal');
		},
	});

	useEffect(() => {
		if (task) {
			setFormType(task.type as 'note' | 'task');
		}
	}, [task]);

	return (
		<div
			className={`top-5 w-full rounded-lg bg-white transition duration-200 dark:bg-[#1d1f20] md:sticky md:self-start md:p-4 lg:min-w-[20rem] ${
				className ?? ''
			} ${!task ? 'md:max-w-[20rem]' : ''}`}
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
			<hr className="my-2 mt-3 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]" />
			<form
				onSubmit={addTaskForm.onSubmit((values) => {
					console.log(values);
					if (task) {
						updateTask.mutate({ ...values });
						return;
					}
					addTask.mutate({ ...values, type: formType });
				})}
			>
				<TextInput
					label="Task title"
					placeholder="Title"
					{...addTaskForm.getInputProps('title')}
					styles={{
						label: {
							color: currentTheme === 'dark' ? '#fff' : '#030910',
							fontSize: '0.75rem',
							transition: 'all 200ms',
						},
						input: {
							color: currentTheme === 'dark' ? '#fff' : '#030910',
							background: currentTheme === 'dark' ? '#17181c' : '#ecf0f3',
							borderColor: currentTheme === 'dark' ? '#2d3338' : '#ecf0f3',
							transition: 'all 200ms',
						},
					}}
					mb="sm"
				/>

				<Textarea
					label="Task description"
					placeholder="desc"
					minRows={8}
					{...addTaskForm.getInputProps('description')}
					styles={{
						label: {
							color: currentTheme === 'dark' ? '#fff' : '#030910',
							fontSize: '0.75rem',
							transition: 'all 200ms',
						},
						input: {
							color: currentTheme === 'dark' ? '#fff' : '#030910',
							background: currentTheme === 'dark' ? '#17181c' : '#ecf0f3',
							borderColor: currentTheme === 'dark' ? '#2d3338' : '#ecf0f3',
							transition: 'all 200ms',
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
							mx="auto"
							{...addTaskForm.getInputProps('startDate')}
							styles={{
								label: {
									color: currentTheme === 'dark' ? '#fff' : '#030910',
									fontSize: '0.75rem',
									transition: 'all 200ms',
								},
								input: {
									color: currentTheme === 'dark' ? '#fff' : '#030910',
									background:
										currentTheme === 'dark'
											? '#2d3338!important'
											: '#ecf0f3!important',
									borderColor:
										currentTheme === 'dark'
											? '#2d3338!important'
											: '#ecf0f3!important',
									transition: 'all 200ms',
								},
							}}
							mb="sm"
						/>
						<TimeInput
							{...addTaskForm.getInputProps('startTime')}
							label="Start time"
							ref={startTimeRef as MutableRefObject<HTMLInputElement>}
							rightSection={
								<ActionIcon
									onClick={() => startTimeRef?.current?.showPicker()}
									className="hover:dark:bg-[#1d1f20]"
								>
									<IconClock size="1rem" stroke={1.5} />
								</ActionIcon>
							}
							styles={{
								label: {
									color: currentTheme === 'dark' ? '#fff' : '#030910',
									fontSize: '0.75rem',
									transition: 'all 200ms',
								},
								input: {
									color: currentTheme === 'dark' ? '#fff' : '#030910',
									background:
										currentTheme === 'dark'
											? '#2d3338!important'
											: '#ecf0f3!important',
									borderColor:
										currentTheme === 'dark'
											? '#2d3338!important'
											: '#ecf0f3!important',
									transition: 'all 200ms',
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
							mx="auto"
							minDate={addTaskForm.values.startDate}
							{...addTaskForm.getInputProps('endDate')}
							styles={{
								label: {
									color: currentTheme === 'dark' ? '#fff' : '#030910',
									fontSize: '0.75rem',
									transition: 'all 200ms',
								},
								input: {
									color: currentTheme === 'dark' ? '#fff' : '#030910',
									background:
										currentTheme === 'dark'
											? '#2d3338!important'
											: '#ecf0f3!important',
									borderColor:
										currentTheme === 'dark'
											? '#2d3338!important'
											: '#ecf0f3!important',
									transition: 'all 200ms',
								},
								rightSection: {
									background:
										currentTheme === 'dark'
											? '#2d3338!important'
											: '#ecf0f3!important',
									borderColor:
										currentTheme === 'dark'
											? '#2d3338!important'
											: '#ecf0f3!important',
									transition: 'all 200ms',
								},
							}}
							mb="sm"
						/>
						<TimeInput
							{...addTaskForm.getInputProps('endTime')}
							label="End time"
							ref={endTimeRef as MutableRefObject<HTMLInputElement>}
							rightSection={
								<ActionIcon
									onClick={() => endTimeRef?.current?.showPicker()}
									className="hover:dark:bg-[#1d1f20]"
								>
									<IconClock size="1rem" stroke={1.5} />
								</ActionIcon>
							}
							styles={{
								label: {
									color: currentTheme === 'dark' ? '#fff' : '#030910',
									fontSize: '0.75rem',
									transition: 'all 200ms',
								},
								input: {
									color: currentTheme === 'dark' ? '#fff' : '#030910',
									background:
										currentTheme === 'dark'
											? '#2d3338!important'
											: '#ecf0f3!important',
									borderColor:
										currentTheme === 'dark'
											? '#2d3338!important'
											: '#ecf0f3!important',
									transition: 'all 200ms',
								},
							}}
							mb="sm"
						/>
					</>
				)}

				<Group position="center" mt="md">
					<button
						type="submit"
						className="basis-1/2 rounded-lg border-2 border-[#eeedf0] bg-white p-2 text-sm text-[#02080f] transition duration-200 hover:!bg-blue-500 dark:border-[#2b3031] dark:bg-[#17181c] dark:text-white"
					>
						{!task ? 'Add' : 'Update'} {formType === 'task' ? 'task' : 'note'}
					</button>
				</Group>
			</form>
		</div>
	);
};

export default TaskForm;
