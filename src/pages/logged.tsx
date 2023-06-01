import { TextInput, Checkbox, Button, Group, Box, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useSession } from "next-auth/react";
import { useState } from 'react';

import { api } from "~/utils/api";

const Logged: React.FC = () => {
    const { data: sessionData } = useSession();
    const [formType, setFormType] = useState<'note' | 'task'>('note');

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: userData } = api.example.getUserData.useQuery(
        undefined,
        { enabled: sessionData?.user !== undefined },
    );

    const { data: tasksDataForUser, refetch } = api.tasks.getTasksForUser.useQuery(
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
            // tasksDataForUser?.unshift({
            //     id: Math.random().toString(),
            //     title: addTaskForm.values.title,
            //     description: addTaskForm.values.description,
            //     createdAt: new Date(),
            //     updatedAt: new Date(),
            //     completed: false,
            //     authorId: '',
            //     type: formType,
            // })
        }
    });

    const deleteTask = api.tasks.deleteTask.useMutation({
        onSuccess: () => {
            void refetch();
        }
    });

    return (
        <div className="flex gap-12 flex-col items-center md:flex-row w-full justify-center">
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
            <div className="flex flex-col justify-center gap-4 w-full md:max-w-[36rem] md:self-start">
                {tasksDataForUser?.map((task) => (
                <div key={task.id} className="relative bg-white p-4 rounded-lg hover:bg-blue-100 focus:bg-gray-100">
                    <div className="flex justify-between items-center">
                        <span className="block text-sm text-gray-500">{task.title}</span>
                        <button
                            onClick={() => {
                                deleteTask.mutate({id: task.id});
                                void refetch();
                            }}
                            className="bg-red-500 hover:bg-red-600 rounded-full px-4 py-2 text-white text-sm"
                        >
                            Delete
                        </button>
                    </div>
                    <hr className="my-2"/>
                    <span className="block">{task.description}</span>
                </div>
                ))}
            </div>
        </div>
    )
};

export default Logged;