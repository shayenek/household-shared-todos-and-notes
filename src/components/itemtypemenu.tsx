import { useTaskTypeStore, type TaskTypeState } from '~/store/store';
import { type TaskType } from '~/types/author';

export const ItemTypeMenu = () => {
	const taskType = useTaskTypeStore((state: TaskTypeState) => state.taskType);

	const handleTaskTypeChange = (type: TaskType) => {
		useTaskTypeStore.setState({ taskType: type });
	};
	return (
		<>
			<button
				className={`basis-1/2 rounded-lg border-2 border-[#eeedf0] bg-white p-2 text-sm font-bold text-[#02080f] transition duration-200 dark:border-[#2b3031] dark:bg-[#17181c] dark:text-white ${
					taskType === 'note' ? '!bg-blue-500 text-white' : ''
				}`}
				onClick={() => handleTaskTypeChange(taskType !== 'note' ? 'note' : null)}
			>
				Notes
			</button>
			<button
				className={`basis-1/2 rounded-lg border-2 border-[#eeedf0] bg-white p-2 text-sm font-bold text-[#02080f] transition duration-200 dark:border-[#2b3031] dark:bg-[#17181c] dark:text-white ${
					taskType === 'task' ? '!bg-blue-500 text-white' : ''
				}`}
				onClick={() => handleTaskTypeChange(taskType !== 'task' ? 'task' : null)}
			>
				Tasks
			</button>
		</>
	);
};
