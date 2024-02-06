import { modals } from '@mantine/modals';
import { type Pattern } from '@prisma/client';
import { useState } from 'react';

import { useShoppingStore } from '~/store/shopping';
import { api } from '~/utils/api';

export const PatternItemEl = ({ item }: { item: Pattern }) => {
	const deleteItem = api.pattern.deleteItem.useMutation();
	const updateWeight = api.pattern.setItemWeight.useMutation();
	const [itemWeight, setItemWeight] = useState(item.weight);

	const handleChangeWeight = (type: 'add' | 'subtract') => {
		const newWeight = type === 'add' ? itemWeight + 1 : itemWeight - 1;
		setItemWeight((prev) => prev + (type === 'add' ? 1 : -1));
		updateWeight.mutate({ id: item.id, weight: newWeight });
		useShoppingStore.setState({
			patterns: useShoppingStore.getState().patterns.map((pattern) => {
				if (pattern.id === item.id) {
					return { ...pattern, weight: newWeight };
				}
				return pattern;
			}),
		});
	};

	const handleDeleteItem = () => {
		modals.openConfirmModal({
			title: `Do you really wanna delete: ${item.name}?`,
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
				useShoppingStore.setState({
					patterns: useShoppingStore
						.getState()
						.patterns.filter((pattern) => pattern.id !== item.id),
				});
				deleteItem.mutate({ id: item.id });
			},
		});
	};

	return (
		<div
			className={`my-1 flex items-center justify-between rounded-md bg-white px-2 py-1 dark:bg-[#232527]`}
		>
			<div className={`flex w-full items-center justify-between`} role="none">
				<div className="flex items-center gap-2">
					<span className="text-xs text-[#030910] dark:text-white md:text-base">
						{item.name.charAt(0).toUpperCase() + item.name.slice(1)}
					</span>
				</div>
			</div>
			<div className="flex items-center">
				<div className="flex w-16 justify-center">
					<span className="flex items-center gap-1 text-xs text-[#030910] dark:text-white md:text-base">
						<button
							className="flex h-3 w-3 items-center justify-center bg-green-600 px-1 text-[12px] text-white"
							onClick={(e) => {
								e.stopPropagation();
								handleChangeWeight('add');
							}}
						>
							+
						</button>
						{itemWeight}
						<button
							className="flex h-3 w-3 items-center justify-center bg-red-600 px-1 text-[12px] text-white"
							onClick={(e) => {
								e.stopPropagation();
								handleChangeWeight('subtract');
							}}
						>
							-
						</button>
					</span>
				</div>
				<div
					className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm bg-red-500 font-bold text-white"
					onClick={() => handleDeleteItem()}
					onKeyDown={() => handleDeleteItem()}
					role="button"
					tabIndex={0}
				>
					X
				</div>
			</div>
		</div>
	);
};
