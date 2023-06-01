import { TextInput, Button, Group, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
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
		},
	});

	const addTask = api.tasks.createTask.useMutation({
		onSuccess: () => {
			addTaskForm.reset();
			onSubmit?.();
			void refetch();
		},
	});

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
			{formType === 'note' && (
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

					<Group position="center" mt="md">
						<Button
							onClick={() => {
								addTask.mutate(addTaskForm.values);
							}}
							type="submit"
							className="bg-blue-500 hover:bg-blue-600"
						>
							Add note
						</Button>
					</Group>
				</form>
			)}
			{formType === 'task' && <></>}
		</div>
	);
};

export default TaskForm;
