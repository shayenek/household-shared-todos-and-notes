import { type Pattern, type Item } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';

import { useShoppingStore } from '~/store/shopping';
import { api } from '~/utils/api';

import { filterByKeyword } from './helpers';

export const PatternsDropdown = ({
	newItemState,
}: {
	newItemState: (newShoppingItem: Item) => void;
}) => {
	// const filterByKeyword = useCallback((items: Pattern[], keyword: string, max: number) => {
	// 	if (keyword.length === 0) {
	// 		return items.slice(0, max);
	// 	}
	// 	return items
	// 		.filter((item) => {
	// 			const normalizedItemName = item.name
	// 				.toLowerCase()
	// 				.normalize('NFD') // Normalize to decomposed form
	// 				.replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
	// 			const normalizedKeyword = keyword
	// 				.toLowerCase()
	// 				.normalize('NFD')
	// 				.replace(/[\u0300-\u036f]/g, '');
	// 			return normalizedItemName.includes(normalizedKeyword);
	// 		})
	// 		.sort((a, b) => {
	// 			const aStartsWithInputVal = a.name
	// 				.toLowerCase()
	// 				.normalize('NFD')
	// 				.replace(/[\u0300-\u036f]/g, '')
	// 				.startsWith(keyword.toLowerCase());
	// 			const bStartsWithInputVal = b.name
	// 				.toLowerCase()
	// 				.normalize('NFD')
	// 				.replace(/[\u0300-\u036f]/g, '')
	// 				.startsWith(keyword.toLowerCase());

	// 			if (aStartsWithInputVal && !bStartsWithInputVal) {
	// 				return -1;
	// 			} else if (!aStartsWithInputVal && bStartsWithInputVal) {
	// 				return 1;
	// 			} else {
	// 				return a.name.localeCompare(b.name, 'pl');
	// 			}
	// 		})
	// 		.slice(0, max);
	// }, []);

	const {
		searchItemInputVal,
		categoriesList,
		filteredDatabaseItems,
		showPatternsList,
		selectedItem,
		amountValue,
		addButtonClicked,
	} = useShoppingStore((state) => ({
		searchItemInputVal: state.searchInputVal,
		categoriesList: state.categories,
		filteredDatabaseItems: state.patternsFiltered,
		showPatternsList: state.showPatternsList,
		selectedItem: state.selectedItem,
		amountValue: state.amountValue,
		addButtonClicked: state.addButtonClicked,
	}));

	const [itemsByWord, setItemsByWord] = useState<Pattern[]>([]);

	const addItemToShoppingList = api.item.addItemToList.useMutation();

	const convertDatabaseItemToShoppingItem = useCallback(
		(item: Pattern, quantity: string): Item => {
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

	const handleAddItemToShoppingList = (item: Pattern) => {
		const newDatabaseItem = { ...item, weight: item.weight + 1 };
		const newItem = convertDatabaseItemToShoppingItem(item, amountValue.toString() || '1');
		useShoppingStore.setState({
			patternsFiltered: filteredDatabaseItems
				.concat(newDatabaseItem)
				.filter((i) => i.id !== item.id)
				.sort((a, b) => b.weight - a.weight),
			showPatternsList: false,
		});
		newItemState(newItem);
		addItemToShoppingList.mutate(newItem);
	};

	useEffect(() => {
		if (searchItemInputVal.length === 0) {
			useShoppingStore.setState({ showPatternsList: false });
		} else {
			useShoppingStore.setState({ showPatternsList: true });
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

		if (showPatternsList) {
			document.body.addEventListener('keydown', handleKeyDown);
		} else {
			document.body.removeEventListener('keydown', handleKeyDown);
		}

		return () => {
			document.body.removeEventListener('keydown', handleKeyDown);
		};
	}, [selectedItem, itemsByWord]);

	useEffect(() => {
		if (addButtonClicked) {
			if (selectedItem) {
				handleAddItemToShoppingList(selectedItem);
				useShoppingStore.setState({ addButtonClicked: false });
			} else {
				useShoppingStore.setState({ isCategoriesModalOpen: true });
			}
		} else {
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
			<div className="dropdown | absolute z-50 flex w-full flex-col overflow-hidden rounded-md">
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
		</>
	);
};
