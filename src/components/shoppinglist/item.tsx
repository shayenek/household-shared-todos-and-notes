import { modals } from '@mantine/modals';
import { type Item } from '@prisma/client';
import { IconCheck } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';

import { api } from '~/utils/api';

export const ItemEl = ({
	className,
	item,
	onItemDeletion,
	onItemCheck,
	onQuantityChange,
	done,
}: {
	className?: string;
	item: Item;
	onItemDeletion?: () => void;
	onItemCheck?: () => void;
	onQuantityChange?: (id: number, quantity: number) => void;
	done: boolean | null;
}) => {
	const [checked, setChecked] = useState(false);
	const [itemQuantity, setItemQuantity] = useState(item.quantity);
	const checkItem = api.item.checkItem.useMutation();
	const updateQuantity = api.item.updateItemQuantity.useMutation();
	const deleteItem = api.item.deleteItemFromList.useMutation();

	const handleCheck = () => {
		setChecked(!checked);
		if (onItemCheck) {
			onItemCheck();
		}
		checkItem.mutate({ id: item.id, checked: !checked });
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
				deleteItem.mutate({ id: item.id });
				if (onItemDeletion) {
					onItemDeletion();
				}
			},
		});
	};

	const handleChangeQuantity = (action: 'add' | 'subtract') => {
		let newQuantity = itemQuantity;
		if (action === 'add') {
			newQuantity = newQuantity + 1;
		} else {
			newQuantity = Math.max(1, newQuantity - 1);
		}
		setItemQuantity(newQuantity);
		if (onQuantityChange) {
			onQuantityChange(item.id, newQuantity);
		}
		updateQuantity.mutate({ id: item.id, quantity: newQuantity });
	};

	useEffect(() => {
		setChecked(item.checked);
	}, [item.checked]);

	useEffect(() => {
		setItemQuantity(item.quantity);
	}, [item.quantity]);

	return (
		<div
			className={`my-1 flex items-center justify-between rounded-md bg-white px-2 py-1 dark:bg-[#232527]  ${
				className ?? ''
			}`}
		>
			<div
				className={`flex w-full items-center justify-between ${
					!done ? 'cursor-pointer' : ''
				}`}
				onClick={() => handleCheck()}
				onKeyDown={() => handleCheck()}
				role="none"
			>
				<div className="flex items-center gap-2">
					<div
						className={
							'flex h-4 w-4 items-center justify-center rounded-full bg-[#f0f1f3] dark:bg-[#2b3031] md:h-6 md:w-6' +
							(checked ? ' !bg-green-500' : '')
						}
					>
						<IconCheck
							size="1rem"
							className={checked ? 'block text-black' : 'hidden'}
						/>
					</div>
					<span className="text-xs text-[#030910] dark:text-white md:text-base">
						{item.name.charAt(0).toUpperCase() + item.name.slice(1)}
					</span>
				</div>
			</div>
			<div className="flex items-center">
				<div className="flex w-16 justify-center">
					{done ? (
						<span className="flex items-center gap-1 text-xs text-[#030910] dark:text-white md:text-base">
							{itemQuantity}
						</span>
					) : (
						<span className="flex items-center gap-1 text-xs text-[#030910] dark:text-white md:text-base">
							<button
								className="flex h-3 w-3 items-center justify-center bg-green-600 px-1 text-[12px] text-white"
								onClick={(e) => {
									e.stopPropagation();
									handleChangeQuantity('add');
								}}
							>
								+
							</button>
							{itemQuantity}
							<button
								className="flex h-3 w-3 items-center justify-center bg-red-600 px-1 text-[12px] text-white"
								onClick={(e) => {
									e.stopPropagation();
									handleChangeQuantity('subtract');
								}}
							>
								-
							</button>
						</span>
					)}
				</div>
				{!done && (
					<div
						className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-sm bg-red-500 font-bold text-white"
						onClick={() => handleDeleteItem()}
						onKeyDown={() => handleDeleteItem()}
						role="button"
						tabIndex={0}
					>
						X
					</div>
				)}
			</div>
		</div>
	);
};
