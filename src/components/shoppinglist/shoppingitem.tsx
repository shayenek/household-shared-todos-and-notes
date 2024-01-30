import { type ShoppingItem } from '@prisma/client';
import { IconCheck } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';

import { api } from '~/utils/api';

export const ShoppingItemEl = ({
	className,
	item,
	onItemDeletion,
	onItemCheck,
	onQuantityChange,
	done,
}: {
	className?: string;
	item: ShoppingItem;
	onItemDeletion: () => void;
	onItemCheck: () => void;
	onQuantityChange: (id: number, quantity: number) => void;
	done: boolean | null;
}) => {
	const [checked, setChecked] = useState(false);
	const [itemQuantity, setItemQuantity] = useState(item.quantity);
	const checkItem = api.shoppingList.checkItem.useMutation();
	const deleteItem = api.shoppingList.deleteItemFromList.useMutation();
	const updateQuantity = api.shoppingList.updateItemQuantity.useMutation();

	const handleCheck = () => {
		setChecked(!checked);
		onItemCheck();
		checkItem.mutate({ id: item.id, checked: !checked });
	};

	const handleDeleteItem = () => {
		onItemDeletion();
		deleteItem.mutate({ id: item.id });
	};

	const handleChangeQuantity = (action: 'add' | 'subtract') => {
		let newQuantity = itemQuantity;
		if (action === 'add') {
			newQuantity = newQuantity + 1;
		} else {
			newQuantity = Math.max(1, newQuantity - 1);
		}
		setItemQuantity(newQuantity);
		onQuantityChange(item.id, newQuantity);
		updateQuantity.mutate({ id: item.id, quantity: newQuantity });
	};

	useEffect(() => {
		setChecked(item.checked);
	}, [item.checked]);

	return (
		<div
			className={`my-1 flex cursor-pointer items-center justify-between rounded-md bg-white px-2 py-1 dark:bg-[#232527] ${
				className ?? ''
			}`}
		>
			<div
				className="flex w-full items-center justify-between"
				onClick={() => handleCheck()}
				onKeyDown={() => handleCheck()}
				role="button"
				tabIndex={0}
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
						{item.name}
					</span>
				</div>
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
	);
};
