import { Popover } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconDots } from '@tabler/icons-react';

import { api } from '~/utils/api';

export const BottomMenu = ({
	markAllChecked,
	clearShoppingList,
	handleSetAllDatabaseItemsWeightToOne,
}: {
	markAllChecked: () => void;
	clearShoppingList: () => void;
	handleSetAllDatabaseItemsWeightToOne: () => void;
}) => {
	const clearShoppingListItems = api.shoppingList.clearShoppingList.useMutation();

	const handleClearShoppingList = () => {
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
				clearShoppingListItems.mutate();
				clearShoppingList();
			},
		});
	};

	return (
		<div className="relative rounded-lg bg-white p-4 transition duration-200 ease-in-out dark:bg-[#1d1f20] ">
			<div className="flex justify-center gap-2 pt-2">
				<button
					className="w-32 rounded-lg bg-blue-500 py-2 text-sm font-bold text-white opacity-100 hover:bg-blue-800"
					onClick={() => markAllChecked()}
				>
					Mark all checked
				</button>
				<button
					className="w-32 rounded-lg bg-red-500 py-2 text-sm font-bold text-white opacity-100 hover:bg-red-800"
					onClick={() => handleClearShoppingList()}
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
							onClick={() => handleSetAllDatabaseItemsWeightToOne}
						>
							Set all weight to 1
						</button>
					</Popover.Dropdown>
				</Popover>
			</div>
		</div>
	);
};
