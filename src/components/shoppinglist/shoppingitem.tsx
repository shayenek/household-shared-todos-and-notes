import { type ShoppingItem } from '@prisma/client';
import { IconCheck } from '@tabler/icons-react';
import React, { useEffect, useState } from 'react';

import { api } from '~/utils/api';

export const ShoppingItemEl = ({
	item,
	onItemDeletion,
	onItemCheck,
}: {
	item: ShoppingItem;
	onItemDeletion: () => void;
	onItemCheck: () => void;
}) => {
	const [checked, setChecked] = useState(false);
	const checkItem = api.shoppingList.checkItem.useMutation();
	const deleteItem = api.shoppingList.deleteItemFromList.useMutation();

	const handleCheck = () => {
		setChecked(!checked);
		onItemCheck();
		checkItem.mutate({ id: item.id, checked: !checked });
	};

	const handleDeleteItem = () => {
		onItemDeletion();
		deleteItem.mutate({ id: item.id });
	};

	useEffect(() => {
		setChecked(item.checked);
	}, [item.checked]);

	return (
		<div className="my-1 flex cursor-pointer items-center justify-between rounded-md bg-white px-2 py-1 dark:bg-[#232527]">
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
							'flex h-6 w-6 items-center justify-center rounded-full bg-[#f0f1f3] dark:bg-[#2b3031]' +
							(checked ? ' !bg-green-500' : '')
						}
					>
						<IconCheck
							size="1rem"
							className={checked ? 'block text-black' : 'hidden'}
						/>
					</div>
					<span className="text-sm text-[#030910] dark:text-white md:text-base">
						{item.name}
					</span>
				</div>
				<div className="flex w-8 justify-center">
					<span className="text-sm text-[#030910] dark:text-white md:text-base">
						{item.quantity}
					</span>
				</div>
			</div>
			<div
				className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm bg-red-500 font-bold text-white"
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
