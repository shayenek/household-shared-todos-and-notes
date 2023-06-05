import { useTaskAuthorStore, type TaskAuthorState } from '~/store/store';

const MobileNavbar = () => {
	const taskAuthor = useTaskAuthorStore((state: TaskAuthorState) => state.taskAuthor);

	const handleAuthorChange = (author: 'all' | 'mine') => {
		useTaskAuthorStore.setState({ taskAuthor: author });
	};
	return (
		<div className="fixed left-0 right-0 top-0 z-50 flex items-center justify-center gap-1 bg-white p-4 shadow-main transition duration-200 dark:bg-[#1d1f20] md:hidden">
			<button
				className={`basis-1/2 rounded-lg border-2 border-[#eeedf0] bg-white p-2 text-sm font-bold text-[#02080f] transition duration-200 dark:border-[#2b3031] dark:bg-[#17181c] dark:text-white ${
					taskAuthor === 'all' ? '!bg-blue-500 text-white' : ''
				}`}
				onClick={() => handleAuthorChange('all')}
			>
				All
			</button>
			<button
				className={`basis-1/2 rounded-lg border-2 border-[#eeedf0] bg-white p-2 text-sm font-bold text-[#02080f] transition duration-200 dark:border-[#2b3031] dark:bg-[#17181c] dark:text-white ${
					taskAuthor === 'mine' ? '!bg-blue-500 text-white' : ''
				}`}
				onClick={() => handleAuthorChange('mine')}
			>
				Mine
			</button>
		</div>
	);
};

export default MobileNavbar;
