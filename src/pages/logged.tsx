import { useSession } from 'next-auth/react';

import MobileNavbar from '~/components/mobilenavbar';
import TaskForm from '~/components/taskform';
import Tasks from '~/components/tasks';
import TopNavbar from '~/components/topnavbar';

const Logged = ({ isMobile }: { isMobile: boolean }) => {
	const { data: sessionData } = useSession();

	return (
		<div className="flex w-full flex-col items-center justify-center gap-4 md:flex-row md:gap-12">
			{!isMobile && sessionData && <TaskForm />}

			<Tasks isMobile={isMobile} />
			{isMobile && sessionData && <TopNavbar />}
			{isMobile && <MobileNavbar />}
		</div>
	);
};

export default Logged;
