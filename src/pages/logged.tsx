import { useSession } from "next-auth/react";

import TaskForm from '~/components/taskform';
import Tasks from '~/components/tasks';
import { api } from "~/utils/api";


const Logged: React.FC = () => {
    const { data: sessionData } = useSession();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: userData } = api.users.getUserData.useQuery(
        undefined,
        { enabled: sessionData?.user !== undefined },
    );

    return (
        <div className="flex gap-12 flex-col items-center md:flex-row w-full justify-center">
            <TaskForm />
            <Tasks />
        </div>
    )
};

export default Logged;