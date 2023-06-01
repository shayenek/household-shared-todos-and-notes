import { useSession } from "next-auth/react";

import { api } from "~/utils/api";
import { PusherProvider, useSubscribeToEvent } from "~/utils/pusher";

const Tasks: React.FC = () => {
    const { data: sessionData } = useSession();
    
    const { data: tasksDataForUser, refetch } = api.tasks.getTasksForUser.useQuery(
        undefined,
        { enabled: sessionData?.user !== undefined },
    );

    useSubscribeToEvent('new-task', () => {
        console.log('new task event received');
        void refetch();
    })

    const deleteTask = api.tasks.deleteTask.useMutation({
        onSuccess: () => {
            void refetch();
        }
    });

    return (
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
    )
};

export default function QuestionsViewWrapper() {
    const { data: sessionData } = useSession();

    if (!sessionData || !sessionData.user?.id) return null

    return (
        <PusherProvider slug={`user-${sessionData.user?.id}`}>
            <Tasks />
        </PusherProvider>
    )
}