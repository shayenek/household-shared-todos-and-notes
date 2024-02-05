import { Button, Select, TextInput } from '@mantine/core';
import { type ShoppingItem, type ShoppingCategoriesList } from '@prisma/client';
import { useEffect, useState } from 'react';

import { useShoppingStore } from '~/store/shopping';
import { api } from '~/utils/api';

import { CategoriesWindow } from './categorieswindow';
import { DatabaseItemsList } from './databaseitemslist';

export const SearchBar = () => {
	const { totalPriceForItems, amountValue, searchItemInputVal, selectedItem, addButtonClicked } =
		useShoppingStore((state) => ({
			totalPriceForItems: state.totalPrice,
			amountValue: state.amountValue,
			searchItemInputVal: state.searchInputVal,
			selectedItem: state.selectedItem,
			addButtonClicked: state.addButtonClicked,
		}));

	const createDatabaseItem = api.shoppingDatabase.createNewItem.useMutation();

	const [inputValue, setInputValue] = useState('');

	useEffect(() => {
		setInputValue(searchItemInputVal);
	}, [searchItemInputVal]);

	const handleNewItemState = (newShoppingItem: ShoppingItem) => {
		useShoppingStore.setState({
			shoppingList: [...useShoppingStore.getState().shoppingList, newShoppingItem],
			amountValue: 1,
			selectedItem: null,
			searchInputVal: '',
			addButtonClicked: false,
		});
	};

	const handleNewItemCategorySelection = (
		category: ShoppingCategoriesList,
		refreshCategoriesList: boolean
	) => {
		const newDatabaseItem = {
			name: searchItemInputVal,
			categoryId: category.id,
			quantity: useShoppingStore.getState().amountValue,
		};
		createDatabaseItem.mutate(
			{
				createNewShoppingItem: true,
				dataBaseObject: newDatabaseItem,
			},
			{
				onSuccess: (data) => {
					const newShoppingItem = {
						id: data.id,
						name: data.name,
						quantity: useShoppingStore.getState().amountValue,
						checked: false,
						categoryId: data.categoryId,
						createdAt: data.createdAt,
						updatedAt: data.updatedAt,
						location: data.location,
						price: data.price,
					};
					handleNewItemState(newShoppingItem);
					useShoppingStore.setState({
						shoppingDatabase: [...useShoppingStore.getState().shoppingDatabase, data],
						isCategoriesModalOpen: false,
					});

					if (refreshCategoriesList) {
						useShoppingStore.setState({
							shoppingCategories: [
								...useShoppingStore.getState().shoppingCategories,
								category,
							],
						});
					}
				},
			}
		);
	};

	const handleAddButtonClick = () => {
		if (!addButtonClicked) {
			useShoppingStore.setState({ addButtonClicked: true });
		}
	};

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
					<DatabaseItemsList newItemState={handleNewItemState} />
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
						handleAddButtonClick();
					}}
					disabled={!searchItemInputVal}
				>
					Dodaj
				</Button>
			</div>
			<CategoriesWindow onCategorySelection={handleNewItemCategorySelection} />
		</div>
	);
};
