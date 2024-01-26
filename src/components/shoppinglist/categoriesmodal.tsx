import { Button, Modal, TextInput } from '@mantine/core';
import { type ShoppingCategoriesList } from '@prisma/client';
import { useState } from 'react';

import { api } from '~/utils/api';

export const CategoriesModal = ({
	categoriesList,
	onCategorySelection,
	modalOpened,
	closeModal,
}: {
	categoriesList: ShoppingCategoriesList[];
	onCategorySelection: (category: ShoppingCategoriesList, refreshCategoriesList: boolean) => void;
	modalOpened: boolean;
	closeModal: () => void;
}) => {
	const [inputVal, setInputVal] = useState('');
	const createCategory = api.shoppingDatabase.createNewCategory.useMutation();

	const handleNewCategory = () => {
		createCategory.mutate(
			{
				name: inputVal,
			},
			{
				onSuccess: (data) => {
					onCategorySelection(data, true);
					setInputVal('');
				},
			}
		);
	};

	return (
		<Modal opened={modalOpened} onClose={closeModal} withCloseButton={false}>
			<div className="flex gap-2">
				<TextInput
					placeholder="Nowa kategoria"
					className="mb-4 w-full"
					value={inputVal}
					onChange={(e) => setInputVal(e.currentTarget.value)}
				/>
				<Button
					variant="outline"
					color="green"
					onClick={() => handleNewCategory()}
					disabled={!inputVal}
				>
					Dodaj
				</Button>
			</div>
			{categoriesList.map((category) => (
				<>
					<div
						key={category.name}
						onClick={() => onCategorySelection(category, false)}
						onKeyDown={() => onCategorySelection(category, false)}
						role="button"
						tabIndex={0}
						className="flex cursor-pointer py-1 hover:!bg-gray-200"
					>
						{category.name.charAt(0).toUpperCase() + category.name.slice(1)}
					</div>
					<hr className="border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
				</>
			))}
		</Modal>
	);
};
