import { TextInput, Button, Group, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useSession } from "next-auth/react";
import { useState } from 'react';

import { api } from "~/utils/api";

const TaskForm: React.FC = () => {
    const { data: sessionData } = useSession();
    const [formType, setFormType] = useState<'note' | 'task'>('note');
    
    const { refetch } = api.tasks.getTasksForUser.useQuery(
        undefined,
        { enabled: sessionData?.user !== undefined },
    );

    const addTaskForm = useForm({
        initialValues: {
            title: '',
            description: '',
        },
    });

    const addTask = api.tasks.createTask.useMutation({
        onSuccess: () => {
            addTaskForm.reset();
            void refetch();
        }
    });

    return (
        <div className="bg-white p-4 rounded-lg w-full md:self-start md:max-w-[20rem] lg:min-w-[20rem]">
            <div className="flex justify-center gap-2">
                <button
                    onClick={() => setFormType('note')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    Note
                </button>
                <button
                    onClick={() => setFormType('task')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                    Task
                </button>
            </div>
            <hr className="border-gray-200 my-4"/>
            {formType === 'note' && (
                <form onSubmit={addTaskForm.onSubmit((values) => console.log(values))}>
                    <TextInput
                        withAsterisk
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
            {formType === 'task' && (
                <></>
            )}
        </div>
    )
};

export default TaskForm;