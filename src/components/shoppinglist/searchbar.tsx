import { Button, Select, TextInput } from '@mantine/core';
import {
	type ShoppingItem,
	type ShoppingCategoriesList,
	type ShoppingDataBase,
} from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';

import { useShoppingStore } from '~/store/shopping';
import { api } from '~/utils/api';

import { CategoriesWindow } from './categorieswindow';
import { DatabaseItemsList } from './databaseitemslist';

export const SearchBar = () => {
	const { totalPriceForItems, amountValue, searchItemInputVal, selectedItem } = useShoppingStore(
		(state) => ({
			totalPriceForItems: state.totalPrice,
			amountValue: state.amountValue,
			searchItemInputVal: state.searchInputVal,
			selectedItem: state.selectedItem,
		})
	);

	// const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
	// const createDatabaseItem = api.shoppingDatabase.createNewItem.useMutation();

	const [inputValue, setInputValue] = useState('');

	useEffect(() => {
		setInputValue(searchItemInputVal);
	}, [searchItemInputVal]);

	// const handleSelectItem = (item: ShoppingDataBase, autoSelect?: boolean) => {
	// 	setSearchItemInputVal(item.name);
	// 	setShowDatabaseList(false);
	// 	if (autoSelect) {
	// 		handleAddItemToShoppingList(item);
	// 	}
	// 	setTimeout(() => {
	// 		onClicksOnListBlockedChange(false);
	// 	}, 500);
	// };

	// const handleAddButtonClick = () => {
	// 	const item = allShoppingDatabaseItems.find(
	// 		(item) => item.name.toLowerCase() === searchItemInputVal.toLowerCase()
	// 	);
	// 	if (item) {
	// 		handleAddItemToShoppingList(item);
	// 	} else {
	// 		setIsCategoriesModalOpen(true);
	// 	}
	// };

	// const handleNewItemCategorySelection = (
	// 	category: ShoppingCategoriesList,
	// 	refreshCategoriesList: boolean
	// ) => {
	// 	const newDatabaseItem = {
	// 		name: searchItemInputVal,
	// 		categoryId: category.id,
	// 		quantity: parseInt(amountValue || '1'),
	// 	};
	// 	createDatabaseItem.mutate(
	// 		{
	// 			createNewShoppingItem: false,
	// 			dataBaseObject: newDatabaseItem,
	// 		},
	// 		{
	// 			onSuccess: (data) => {
	// 				setShoppingDatabaseItems((prev) => [...prev, data]);
	// 				handleAddItemToShoppingList(data);
	// 				if (refreshCategoriesList) {
	// 					setCategoriesList((prev) => [...prev, category]);
	// 				}
	// 				setIsCategoriesModalOpen(false);
	// 			},
	// 		}
	// 	);
	// };

	return (
		<div className="relative rounded-lg bg-white p-4 transition duration-200 ease-in-out dark:bg-[#1d1f20] ">
			<div className="flex items-center justify-between">
				<div className="flex w-full items-center justify-between text-base font-bold text-[#030910] dark:text-[#e0e2e4] md:text-xl">
					<span>
						Lista zakupów (łącznie: {totalPriceForItems.toFixed(2).replace('.', ',')}):
					</span>
				</div>
			</div>
			<hr className="my-2 mt-3 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
			<div className="relative flex justify-between gap-2">
				<div className="w-full flex-auto md:relative">
					<TextInput
						placeholder="Nazwa"
						className="mb-1 w-full"
						value={inputValue}
						onChange={(event) => {
							setInputValue(event.currentTarget.value);
							useShoppingStore.setState({
								searchInputVal: event.currentTarget.value,
							});
						}}
						onClick={() => {
							useShoppingStore.setState({ showDatabaseList: true });
							useShoppingStore.setState({ clicksOnListBlocked: true });
						}}
						onBlur={() => {
							setTimeout(() => {
								// useShoppingStore.setState({ showDatabaseList: false });
								// useShoppingStore.setState({ clicksOnListBlocked: false });
								useShoppingStore.setState({
									showDatabaseList: false,
									clicksOnListBlocked: false,
								});
							}, 200);
						}}
						onMouseDown={() => {
							setTimeout(() => {
								useShoppingStore.setState({ showDatabaseList: true });
								useShoppingStore.setState({ clicksOnListBlocked: true });
							}, 200);
						}}
						onSubmitCapture={() => {
							if (selectedItem) {
								useShoppingStore.setState({ addButtonClicked: true });
							}
						}}
						rightSection={
							searchItemInputVal.length > 0 && (
								<div
									className="cursor-pointer text-blue-700"
									onClick={() =>
										useShoppingStore.setState({ searchInputVal: '' })
									}
									onKeyDown={() =>
										useShoppingStore.setState({ searchInputVal: '' })
									}
									role="button"
									tabIndex={0}
								>
									X
								</div>
							)
						}
					/>
					<DatabaseItemsList />
				</div>
				<Select
					data={[
						{ value: '1', label: '1' },
						{ value: '2', label: '2' },
						{ value: '3', label: '3' },
						{ value: '4', label: '4' },
						{ value: '5', label: '5' },
						{ value: '6', label: '6' },
						{ value: '7', label: '7' },
						{ value: '8', label: '8' },
						{ value: '9', label: '9' },
						{ value: '10', label: '10' },
						{ value: '11', label: '11' },
						{ value: '12', label: '12' },
						{ value: '13', label: '13' },
						{ value: '14', label: '14' },
						{ value: '15', label: '15' },
						{ value: '16', label: '16' },
						{ value: '17', label: '17' },
						{ value: '18', label: '18' },
						{ value: '19', label: '19' },
						{ value: '20', label: '20' },
					]}
					placeholder="ilość"
					defaultValue="1"
					required
					className="w-16 shrink-0"
					value={amountValue.toString()}
					onChange={(value) => {
						useShoppingStore.setState({ amountValue: Number(value) });
					}}
				/>
				<Button
					onClick={() => {
						useShoppingStore.setState({ addButtonClicked: true });
					}}
					disabled={!searchItemInputVal}
				>
					Dodaj
				</Button>
			</div>
			{/* <CategoriesWindow
				isOpen={isCategoriesModalOpen}
				onClose={() => setIsCategoriesModalOpen(false)}
				categoriesList={categoriesList}
				onCategorySelection={handleNewItemCategorySelection}
			/> */}
		</div>
	);
};
