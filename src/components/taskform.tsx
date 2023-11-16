import { TextInput, Group, Textarea, ActionIcon, Select, MultiSelect } from '@mantine/core';
import { DatePickerInput, TimeInput } from '@mantine/dates';
import { isNotEmpty, useForm } from '@mantine/form';
import { closeModal } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { type Task } from '@prisma/client';
import { IconCalendar, IconClock } from '@tabler/icons-react';
import { type MutableRefObject, useEffect, useRef, useState } from 'react';

import { env } from '~/env.mjs';
import {
	type ThemeState,
	useThemeStore,
	useUpdateTaskStore,
	type UpdateTaskState,
} from '~/store/store';
import { api } from '~/utils/api';

const TaskForm = ({ className, task }: { className?: string; task?: Task }) => {
	const [formType, setFormType] = useState<'note' | 'task'>('note');
	const currentTheme = useThemeStore((state: ThemeState) => state.theme);
	const updateTaskWithStore = useUpdateTaskStore((state: UpdateTaskState) => state.setTask);
	const [noneRemindersSelected, setNoneRemindersSelected] = useState<boolean>(true);

	const startTimeRef = useRef<HTMLInputElement>();
	const endTimeRef = useRef<HTMLInputElement>();

	const repeateEventValues = [
		{ value: 'none', label: 'Dont repeat' },
		{ value: 'RRULE:FREQ=DAILY', label: 'Daily' },
		{ value: 'RRULE:FREQ=WEEKLY', label: 'Weekly' },
		{ value: 'RRULE:FREQ=MONTHLY', label: 'Monthly' },
		{ value: 'RRULE:FREQ=WEEKLY;BYDAY=FR,MO,TH,TU,WE', label: 'Every work day (mon-fri)' },
	];

	const eventReminderValues = [
		{ value: 'none', label: 'None' },
		{ value: 'default', label: 'Default', disabled: noneRemindersSelected },
		{ value: '5', label: '5 minutes before', disabled: noneRemindersSelected },
		{ value: '10', label: '10 minutes before', disabled: noneRemindersSelected },
		{ value: '15', label: '15 minutes before', disabled: noneRemindersSelected },
		{ value: '30', label: '30 minutes before', disabled: noneRemindersSelected },
		{ value: '60', label: '1 hour before', disabled: noneRemindersSelected },
	];

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
			repeat: 'none',
			reminders: ['none'],
		},
		validate: {
			description: isNotEmpty('Description is required'),
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
			notifications.show({
				title: 'Task created',
				message: 'Task has been created successfully',
				color: 'green',
			});
		},
	});

	const updateTask = api.tasks.updateTask.useMutation({
		onSuccess: (data) => {
			closeModal('editTaskModal');
			updateTaskWithStore(data);
			notifications.show({
				title: 'Task updated',
				message: 'Task has been updated successfully',
				color: 'green',
			});
		},
	});

	const addTaskBulk = api.tasks.createTaskBulk.useMutation({
		onSuccess: () => {
			notifications.show({
				title: 'Tasks created',
				message: 'Tasks have been created successfully',
				color: 'green',
			});
		},
	});

	useEffect(() => {
		if (task) {
			setFormType(task.type as 'note' | 'task');
		}
	}, [task]);

	useEffect(() => {
		if (addTaskForm.values.reminders.includes('none')) {
			addTaskForm.values.reminders = ['none'];
			setNoneRemindersSelected(true);
			return;
		}
		setNoneRemindersSelected(false);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [addTaskForm.values.reminders]);

	return (
		<div
			className={`top-5 w-full rounded-lg bg-white transition duration-200 dark:bg-[#1d1f20] md:sticky md:self-start md:p-4 ${
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
			<hr className="my-2 mt-3 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]" />
			<form
				onSubmit={addTaskForm.onSubmit((values) => {
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
					minRows={5}
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
						<Select
							{...addTaskForm.getInputProps('repeat')}
							mx="auto"
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
							label="Repeat"
							placeholder="Repeat"
							data={repeateEventValues}
							defaultValue={repeateEventValues[0]?.value}
						/>
						<MultiSelect
							{...addTaskForm.getInputProps('reminders')}
							mx="auto"
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
								defaultValue: {
									background:
										currentTheme === 'dark'
											? '#17181c!important'
											: '#ffffff!important',
									transition: 'all 200ms',
								},
								defaultValueLabel: {
									color: currentTheme === 'dark' ? '#fff' : '#030910',
									fontSize: '0.75rem',
									transition: 'all 200ms',
								},
								defaultValueRemove: {
									color: currentTheme === 'dark' ? '#fff' : '#030910',
									transition: 'all 200ms',
								},
								itemsWrapper: {
									background:
										currentTheme === 'dark'
											? '#17181c!important'
											: '#ffffff!important',
									borderColor: '#2b3031',
									borderWidth: '0px',
									transition: 'all 200ms',
									padding: '.5rem',
									paddingRight: '1rem',
									gap: '0.5rem',
								},
								item: {
									color: currentTheme === 'dark' ? '#fff' : '#030910',
									background:
										currentTheme === 'dark'
											? '#2d3338!important'
											: '#ecf0f3!important',
									'&:hover:not([data-disabled])': {
										background: 'rgb(59,130,246)!important',
										color: currentTheme === 'dark' ? '#fff' : '#fff',
									},
									'&[data-disabled]': {
										cursor: 'not-allowed!important',
									},
									transition: 'all 200ms',
									width: '100%',
								},
								dropdown: {
									borderColor:
										currentTheme === 'dark'
											? '#2b3031!important'
											: '#eeedf0!important',
									transition: 'all 200ms',
								},
							}}
							mb="sm"
							label="Reminders"
							placeholder="Reminders"
							data={eventReminderValues}
							clearButtonProps={{ 'aria-label': 'Clear selection' }}
							clearable
						/>
					</>
				)}

				<Group position="center" mt="md">
					<button
						disabled={addTask.isLoading}
						type="submit"
						className={`basis-1/2 rounded-lg border-2 border-[#eeedf0] bg-white p-2 text-sm text-[#02080f] transition duration-200 hover:!bg-blue-500 dark:border-[#2b3031] dark:bg-[#17181c] dark:text-white ${
							addTask.isLoading ? 'cursor-not-allowed opacity-50' : ''
						}}`}
					>
						{!task ? 'Add' : 'Update'} {formType === 'task' ? 'task' : 'note'}
					</button>
				</Group>
			</form>
			{env.NEXT_PUBLIC_NODE_ENV === 'development' && (
				<button
					onClick={() => addTaskBulk.mutate()}
					className={`basis-1/2 rounded-lg border-2 border-[#eeedf0] bg-white p-2 text-sm text-[#02080f] transition duration-200 hover:!bg-blue-500 dark:border-[#2b3031] dark:bg-[#17181c] dark:text-white ${
						addTask.isLoading ? 'cursor-not-allowed opacity-50' : ''
					}}`}
				>
					Add bulk data
				</button>
			)}
		</div>
	);
};

export default TaskForm;
