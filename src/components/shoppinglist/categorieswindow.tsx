import { Button, TextInput } from '@mantine/core';
import { type ShoppingCategoriesList } from '@prisma/client';
import { useEffect, useRef, useState } from 'react';

import { api } from '~/utils/api';

import { DialogWindow } from './dialogwindow';

export const CategoriesWindow = ({
	isOpen,
	onClose,
	categoriesList,
	onCategorySelection,
}: {
	isOpen: boolean;
	onClose: () => void;
	categoriesList: ShoppingCategoriesList[];
	onCategorySelection: (category: ShoppingCategoriesList, refreshCategoriesList: boolean) => void;
}) => {
	const [inputVal, setInputVal] = useState('');
	const [filteredCategoriesList, setFilteredCategoriesList] = useState(categoriesList);
	const [selectedItem, setSelectedItem] = useState<ShoppingCategoriesList | null>(null);
	const inputRef = useRef<HTMLInputElement>(null);

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

	useEffect(() => {
		if (isOpen) {
			inputRef.current?.focus();
		}
	}, [isOpen]);

	useEffect(() => {
		const filteredCategories = categoriesList
			.filter((category) => category.name.toLowerCase().includes(inputVal.toLowerCase()))
			.sort((a, b) => {
				const aStartsWithInputVal = a.name.toLowerCase().startsWith(inputVal.toLowerCase());
				const bStartsWithInputVal = b.name.toLowerCase().startsWith(inputVal.toLowerCase());

				if (aStartsWithInputVal && !bStartsWithInputVal) {
					return -1;
				} else if (!aStartsWithInputVal && bStartsWithInputVal) {
					return 1;
				} else {
					return a.name.localeCompare(b.name);
				}
			});
		if (inputVal !== '' && filteredCategories.length > 0) {
			setSelectedItem(filteredCategories[0] ?? null);
		} else {
			setSelectedItem(null);
		}
		setFilteredCategoriesList(filteredCategories);
	}, [inputVal, categoriesList]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Enter' && selectedItem) {
				console.log(selectedItem);
				onCategorySelection(selectedItem, false);
			} else {
				const index = filteredCategoriesList.findIndex(
					(category) => category.name === selectedItem?.name
				);
				if (event.key === 'ArrowUp') {
					if (index === 0) {
						setSelectedItem(
							filteredCategoriesList[filteredCategoriesList.length - 1] ?? null
						);
					} else {
						setSelectedItem(filteredCategoriesList[index - 1] ?? null);
					}
				} else if (event.key === 'ArrowDown') {
					if (index === filteredCategoriesList.length - 1) {
						setSelectedItem(filteredCategoriesList[0] ?? null);
					} else {
						setSelectedItem(filteredCategoriesList[index + 1] ?? null);
					}
				}
			}
		};
		if (isOpen) {
			document.body.addEventListener('keydown', handleKeyDown);
		} else {
			document.body.removeEventListener('keydown', handleKeyDown);
		}

		return () => {
			document.body.removeEventListener('keydown', handleKeyDown);
		};
	}, [isOpen, selectedItem]);

	return (
		<DialogWindow
			isOpen={isOpen}
			onClose={onClose}
			hasCloseButton={true}
			header={
				<div className="flex gap-2 bg-white dark:bg-[#1d1f20]">
					<TextInput
						ref={inputRef}
						placeholder="Nowa kategoria"
						className="w-full"
						value={inputVal}
						onChange={(e) => setInputVal(e.currentTarget.value)}
						onSubmitCapture={() => handleNewCategory()}
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
			}
		>
			<div className="max-h-80 overflow-y-scroll pr-2">
				{filteredCategoriesList.length === 0 && (
					<div className="text-center text-gray-500 dark:text-gray-400">
						Brak kategorii
					</div>
				)}
				{filteredCategoriesList.map((category) => (
					<>
						<div
							key={category.name}
							onClick={() => onCategorySelection(category, false)}
							onKeyDown={() => onCategorySelection(category, false)}
							role="button"
							tabIndex={0}
							className={`my-1 flex cursor-pointer bg-gray-200 px-2 py-1 dark:bg-[#232527] dark:text-white dark:hover:!bg-gray-800 ${
								selectedItem?.name === category.name ? '!bg-gray-800' : ''
							}`}
						>
							{category.name.charAt(0).toUpperCase() + category.name.slice(1)}
						</div>
					</>
				))}
			</div>
		</DialogWindow>
	);
};
