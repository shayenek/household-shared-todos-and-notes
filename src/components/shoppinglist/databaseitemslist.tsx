import {
	type ShoppingDataBase,
	type ShoppingCategoriesList,
	type ShoppingItem,
} from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';

import { useShoppingStore } from '~/store/shopping';
import { api } from '~/utils/api';

export const DatabaseItemsList = () => {
	const filterByKeyword = useCallback(
		(items: ShoppingDataBase[], keyword: string, max: number) => {
			if (keyword.length === 0) {
				return items.slice(0, max);
			}
			return items
				.filter((item) => item.name.toLowerCase().includes(keyword.toLowerCase()))
				.sort((a, b) => {
					const aStartsWithInputVal = a.name
						.toLowerCase()
						.startsWith(keyword.toLowerCase());
					const bStartsWithInputVal = b.name
						.toLowerCase()
						.startsWith(keyword.toLowerCase());

					if (aStartsWithInputVal && !bStartsWithInputVal) {
						return -1;
					} else if (!aStartsWithInputVal && bStartsWithInputVal) {
						return 1;
					} else {
						return a.name.localeCompare(b.name);
					}
				})
				.slice(0, max);
		},
		[]
	);

	const {
		searchItemInputVal,
		categoriesList,
		filteredDatabaseItems,
		showDatabaseList,
		selectedItem,
		amountValue,
		addButtonClicked,
	} = useShoppingStore((state) => ({
		searchItemInputVal: state.searchInputVal,
		categoriesList: state.shoppingCategories,
		filteredDatabaseItems: state.shoppingDatabaseFiltered,
		showDatabaseList: state.showDatabaseList,
		selectedItem: state.selectedItem,
		amountValue: state.amountValue,
		addButtonClicked: state.addButtonClicked,
	}));

	const [itemsByWord, setItemsByWord] = useState<ShoppingDataBase[]>([]);

	const addItemToShoppingList = api.shoppingList.addItemToList.useMutation();

	const convertDatabaseItemToShoppingItem = useCallback(
		(item: ShoppingDataBase, quantity: string): ShoppingItem => {
			return {
				id: item.id,
				name: item.name,
				quantity: parseInt(quantity || '1', 10),
				checked: false,
				categoryId: item.categoryId,
				createdAt: new Date(),
				updatedAt: new Date(),
				location: item.location,
				price: item.price,
			};
		},
		[]
	);

	const handleAddItemToShoppingList = (item: ShoppingDataBase) => {
		const newDatabaseItem = { ...item, weight: item.weight + 1 };
		const newItem = convertDatabaseItemToShoppingItem(item, amountValue.toString() || '1');
		console.log(newDatabaseItem);
		useShoppingStore.setState({
			shoppingDatabaseFiltered: filteredDatabaseItems
				.concat(newDatabaseItem)
				.filter((i) => i.id !== item.id)
				.sort((a, b) => b.weight - a.weight),
			shoppingList: [...useShoppingStore.getState().shoppingList, newItem],
			amountValue: 1,
			selectedItem: null,
			showDatabaseList: false,
			searchInputVal: '',
		});
		addItemToShoppingList.mutate(newItem);
	};

	useEffect(() => {
		if (searchItemInputVal.length === 0) {
			useShoppingStore.setState({ showDatabaseList: false });
		} else {
			useShoppingStore.setState({ showDatabaseList: true });
		}
		if (filteredDatabaseItems) {
			setItemsByWord(filterByKeyword(filteredDatabaseItems, searchItemInputVal, 10));
		}
	}, [filteredDatabaseItems, searchItemInputVal]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Enter' && selectedItem) {
				handleAddItemToShoppingList(selectedItem);
			} else {
				const index = itemsByWord.findIndex((item) => item.name === selectedItem?.name);
				if (event.key === 'ArrowUp') {
					if (index === 0) {
						useShoppingStore.setState({
							selectedItem: itemsByWord[itemsByWord.length - 1] ?? null,
						});
					} else {
						useShoppingStore.setState({
							selectedItem: itemsByWord[index - 1] ?? null,
						});
					}
				} else if (event.key === 'ArrowDown') {
					if (index === itemsByWord.length - 1) {
						useShoppingStore.setState({ selectedItem: itemsByWord[0] ?? null });
					} else {
						useShoppingStore.setState({
							selectedItem: itemsByWord[index + 1] ?? null,
						});
					}
				}
			}
		};

		if (showDatabaseList) {
			document.body.addEventListener('keydown', handleKeyDown);
		} else {
			document.body.removeEventListener('keydown', handleKeyDown);
		}

		return () => {
			document.body.removeEventListener('keydown', handleKeyDown);
		};
	}, [selectedItem, itemsByWord]);

	useEffect(() => {
		if (addButtonClicked && selectedItem) {
			handleAddItemToShoppingList(selectedItem);
			useShoppingStore.setState({ addButtonClicked: false });
		}
	}, [addButtonClicked]);

	useEffect(() => {
		if (searchItemInputVal !== '') {
			if (itemsByWord.length > 0) {
				useShoppingStore.setState({ selectedItem: itemsByWord[0] });
			} else {
				useShoppingStore.setState({ selectedItem: null });
			}
		}
	}, [searchItemInputVal, itemsByWord]);

	return (
		<>
			{showDatabaseList && (
				<div className="absolute z-50 flex w-full flex-col overflow-hidden rounded-md">
					{itemsByWord.map((item) => (
						<>
							<div
								key={item.id}
								className={`flex cursor-pointer flex-col bg-[#232527] p-2 text-[#e0e2e4] hover:!bg-gray-200 dark:bg-white dark:text-[#030910] ${
									selectedItem?.id === item.id ? '!bg-gray-200' : ''
								}`}
								onClick={() => {
									useShoppingStore.setState({
										selectedItem: item,
										searchInputVal: item.name,
									});
								}}
								onKeyDown={() => {
									useShoppingStore.setState({
										selectedItem: item,
										searchInputVal: item.name,
									});
								}}
								onTouchEnd={() => {
									useShoppingStore.setState({
										selectedItem: item,
										searchInputVal: item.name,
										addButtonClicked: true,
									});
								}}
								role="button"
								tabIndex={0}
							>
								<div className="flex items-center justify-between">
									<span className="text-base">
										{item.name.charAt(0).toUpperCase() + item.name.slice(1)}
									</span>
									<span className="text-xs">
										{
											categoriesList.find(
												(category) => category.id === item.categoryId
											)?.name
										}
									</span>
								</div>
							</div>
							<hr className="border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
						</>
					))}
				</div>
			)}
		</>
	);
};
