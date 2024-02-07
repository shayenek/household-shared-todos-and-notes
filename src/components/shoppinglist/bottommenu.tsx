import { Popover } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconDots } from '@tabler/icons-react';

import { useShoppingStore } from '~/store/shopping';
import { api } from '~/utils/api';

export const BottomMenu = ({
	markAllChecked,
	clearShoppingList,
	setAllPatternsWeightToOne,
}: {
	markAllChecked: () => void;
	clearShoppingList: () => void;
	setAllPatternsWeightToOne: () => void;
}) => {
	const clearItemsList = api.item.clearItems.useMutation();

	const handleClearItemsList = () => {
		modals.openConfirmModal({
			title: 'Do you really wanna delete all shopping list items?',
			styles: {
				content: {
					background: '#1d1f20',
					borderWidth: '2px',
					borderColor: '#2b3031',
				},
				body: {
					color: '#fff',
					background: '#1d1f20',
				},
				header: {
					color: '#fff',
					background: '#1d1f20',
				},
				close: {
					background: '#17181c',
					borderWidth: '2px',
					borderColor: '#2b3031',
				},
			},
			centered: true,
			labels: { confirm: 'Confirm', cancel: 'Cancel' },
			onConfirm: () => {
				clearItemsList.mutate();
				clearShoppingList();
			},
		});
	};

	const patternsView = useShoppingStore.getState().patternsView;

	return (
		<div className="relative rounded-lg bg-white p-4 transition duration-200 ease-in-out dark:bg-[#1d1f20] ">
			<div className="flex justify-center gap-2 pt-2">
				<button
					className="w-32 rounded-lg bg-blue-500 py-2 text-sm font-bold text-white opacity-100 hover:bg-blue-800"
					onClick={() => markAllChecked()}
					disabled={patternsView}
				>
					Mark all checked
				</button>
				<button
					className="w-32 rounded-lg bg-red-500 py-2 text-sm font-bold text-white opacity-100 hover:bg-red-800"
					onClick={() => handleClearItemsList()}
					disabled={patternsView}
				>
					Clear list
				</button>
				<Popover width={300} trapFocus position="bottom" withArrow shadow="md">
					<Popover.Target>
						<button className="rounded-lg bg-gray-500 px-2 py-2 text-sm font-bold text-white opacity-100 hover:bg-gray-800">
							<IconDots size="1.5rem" />
						</button>
					</Popover.Target>
					<Popover.Dropdown>
						<button
							className="w-full rounded-lg bg-gray-500 py-2 text-sm font-bold text-white opacity-100 hover:bg-gray-800"
							onClick={() =>
								useShoppingStore.setState({ patternsView: !patternsView })
							}
						>
							{patternsView ? 'Show items list' : 'Show patterns list'}
						</button>
						<button
							className="hover:bg-gray-80 mt-2 w-full rounded-lg bg-gray-500 py-2 text-sm font-bold text-white opacity-100"
							onClick={() => setAllPatternsWeightToOne}
						>
							Set all weight to 1
						</button>
					</Popover.Dropdown>
				</Popover>
			</div>
		</div>
	);
};
