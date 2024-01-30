import { Select, Button, TextInput, Popover, Loader } from '@mantine/core';
import { modals } from '@mantine/modals';
import {
	type ShoppingItem,
	type ShoppingDataBase,
	type ShoppingCategoriesList,
} from '@prisma/client';
import { IconDots } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { api } from '~/utils/api';

import { CategoriesWindow } from './categorieswindow';
import { ShoppingItemEl } from './shoppingitem';

interface ShoppingItemsGrouped {
	categoryId: number;
	categoryName: string;
	priceForItems: number;
	items: ShoppingItem[];
}

const groupByCategory: (
	list: ShoppingItem[],
	categoryList: ShoppingCategoriesList[]
) => ShoppingItemsGrouped[] = (list, categoryList) => {
	const uniqueCategoryIds = new Set<number>();

	return categoryList.reduce((result, category) => {
		if (!uniqueCategoryIds.has(category.id)) {
			uniqueCategoryIds.add(category.id);

			const priceForItems = list
				.filter((item) => item.categoryId === category.id)
				.reduce((sum, item) => sum + item.price * item.quantity, 0);

			const groupedItems: ShoppingItemsGrouped = {
				categoryId: category.id,
				categoryName: category.name,
				priceForItems: priceForItems,
				items: list.filter((item) => item.categoryId === category.id),
			};

			if (groupedItems.items.length > 0) {
				result.push(groupedItems);
			}
		}

		return result;
	}, [] as ShoppingItemsGrouped[]);
};

const filterDatabaseItemsByWord = (items: ShoppingDataBase[], word: string, max: number) => {
	if (word.length === 0) {
		return items.slice(0, max);
	}
	return items
		.filter((item) => item.name.toLowerCase().includes(word.toLowerCase()))
		.sort((a, b) => {
			const aStartsWithInputVal = a.name.toLowerCase().startsWith(word.toLowerCase());
			const bStartsWithInputVal = b.name.toLowerCase().startsWith(word.toLowerCase());

			if (aStartsWithInputVal && !bStartsWithInputVal) {
				return -1;
			} else if (!aStartsWithInputVal && bStartsWithInputVal) {
				return 1;
			} else {
				return a.name.localeCompare(b.name);
			}
		})
		.slice(0, max);
};

const convertDatabaseItemToShoppingItem = (
	item: ShoppingDataBase,
	quantity: string
): ShoppingItem => {
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
};

export const ShoppingList = () => {
	const [isLoading, setIsLoading] = useState(true);
	const [searchItemInputVal, setSearchItemInputVal] = useState('');
	const [selectedItem, setSelectedItem] = useState<ShoppingDataBase | null>(null);
	const [amountValue, setAmountValue] = useState<string | null>('1');
	const [showDatabaseList, setShowDatabaseList] = useState(false);
	const [clicksOnListBlocked, setClicksOnListBlocked] = useState(false);

	const [categoriesList, setCategoriesList] = useState<ShoppingCategoriesList[]>([]);
	const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);

	const [allShoppingDatabaseItems, setAllShoppingDatabaseItems] = useState<ShoppingDataBase[]>(
		[]
	);
	const [shoppingDatabaseItems, setShoppingDatabaseItems] = useState<ShoppingDataBase[]>([]);
	const [shoppingDatabaseItemsFiltered, setShoppingDatabaseItemsFiltered] = useState<
		ShoppingDataBase[]
	>([]);

	const [shoppingListItems, setShoppingListItems] = useState<ShoppingItem[]>([]);
	const [shoppingItemsGroupedByCategory, setShoppingItemsGroupedByCategory] = useState<
		ShoppingItemsGrouped[]
	>([]);

	const [finishedGroupsOfItems, setFinishedGroupsOfItems] = useState<ShoppingItemsGrouped[]>([]);

	const [totalPriceForItems, setTotalPriceForItems] = useState(0);

	const itemCategories = api.shoppingDatabase.getCategories.useQuery();
	const allDatabaseItems = api.shoppingDatabase.getAllItems.useQuery();
	const filteredDatabaseItems = api.shoppingDatabase.getAllItemsWithoutShoppingItems.useQuery();
	const createDatabaseItem = api.shoppingDatabase.createNewItem.useMutation();
	const setAllDatabaseItemsWeightToOne =
		api.shoppingDatabase.setAllItemsWeightToOne.useMutation();

	const allShoppingListItemsByWeight =
		api.shoppingList.getAllShoppingItemsSortedByDatabaseItemsWeight.useQuery();
	const addItemToShoppingList = api.shoppingList.addItemToList.useMutation();
	const checkShoppingItem = api.shoppingList.checkItem.useMutation();

	const markAllItemsChecked = api.shoppingList.markAllChecked.useMutation();
	const clearShoppingListItems = api.shoppingList.clearShoppingList.useMutation();

	// useEffect(() => {
	// 	if (window.localStorage.getItem('shoppingListItems')) {
	// 		setShoppingItemsGroupedByCategory(
	// 			JSON.parse(
	// 				window.localStorage.getItem('shoppingListItems') as string
	// 			) as ShoppingItemsGrouped[]
	// 		);
	// 	}
	// }, []);

	useEffect(() => {
		if (itemCategories.data) {
			setCategoriesList(itemCategories.data);
		}
	}, [itemCategories.data]);

	useEffect(() => {
		if (allDatabaseItems.data) {
			setAllShoppingDatabaseItems(allDatabaseItems.data);
		}
	}, [allDatabaseItems.data]);

	useEffect(() => {
		if (allShoppingListItemsByWeight.data) {
			setShoppingListItems(allShoppingListItemsByWeight.data);
		}
	}, [allShoppingListItemsByWeight.data]);

	useEffect(() => {
		if (shoppingListItems && categoriesList) {
			const groupedByCategory = groupByCategory(shoppingListItems, categoriesList);
			if (groupedByCategory.length > 0) {
				const fullGroupsChecked = groupedByCategory.filter((group) => {
					const checkedItems = group.items.filter((item) => item.checked);
					return checkedItems.length === group.items.length;
				});
				if (fullGroupsChecked.length > 0) {
					setFinishedGroupsOfItems(fullGroupsChecked);
					setShoppingItemsGroupedByCategory(
						groupedByCategory.filter((group) => {
							const checkedItems = group.items.filter((item) => item.checked);
							return checkedItems.length !== group.items.length;
						})
					);
				} else {
					setShoppingItemsGroupedByCategory(groupedByCategory);
				}
			}
			setTotalPriceForItems(() =>
				groupedByCategory.reduce((sum, group) => sum + group.priceForItems, 0)
			);
		}
	}, [shoppingListItems, categoriesList]);

	useEffect(() => {
		if (filteredDatabaseItems.data) {
			setShoppingDatabaseItems(filteredDatabaseItems.data);
		}
	}, [filteredDatabaseItems.data]);

	useEffect(() => {
		if (searchItemInputVal.length === 0) {
			setShowDatabaseList(false);
		} else {
			setShowDatabaseList(true);
		}

		if (shoppingDatabaseItems) {
			setShoppingDatabaseItemsFiltered(
				filterDatabaseItemsByWord(
					shoppingDatabaseItems,
					searchItemInputVal.toLowerCase(),
					10
				)
			);
		}
	}, [shoppingDatabaseItems, searchItemInputVal]);

	useEffect(() => {
		if (shoppingItemsGroupedByCategory.length > 0) {
			window.localStorage.setItem(
				'shoppingListItems',
				JSON.stringify(shoppingItemsGroupedByCategory)
			);
			setIsLoading(false);
		}
	}, [shoppingItemsGroupedByCategory]);

	useEffect(() => {
		if (searchItemInputVal !== '' && shoppingDatabaseItemsFiltered.length > 0) {
			setSelectedItem(shoppingDatabaseItemsFiltered[0] ?? null);
		} else {
			setSelectedItem(null);
		}
	}, [searchItemInputVal, shoppingDatabaseItemsFiltered]);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Enter' && selectedItem) {
				handleAddItemToShoppingList(selectedItem);
			} else {
				const index = shoppingDatabaseItemsFiltered.findIndex(
					(item) => item.name === selectedItem?.name
				);
				if (event.key === 'ArrowUp') {
					if (index === 0) {
						setSelectedItem(
							shoppingDatabaseItemsFiltered[
								shoppingDatabaseItemsFiltered.length - 1
							] ?? null
						);
					} else {
						setSelectedItem(shoppingDatabaseItemsFiltered[index - 1] ?? null);
					}
				} else if (event.key === 'ArrowDown') {
					if (index === shoppingDatabaseItemsFiltered.length - 1) {
						setSelectedItem(shoppingDatabaseItemsFiltered[0] ?? null);
					} else {
						setSelectedItem(shoppingDatabaseItemsFiltered[index + 1] ?? null);
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
	}, [selectedItem, shoppingDatabaseItemsFiltered]);

	const handleSelectItem = (item: ShoppingDataBase, autoSelect?: boolean) => {
		setSearchItemInputVal(item.name);
		setShowDatabaseList(false);
		if (autoSelect) {
			handleAddItemToShoppingList(item);
		}
		setTimeout(() => {
			setClicksOnListBlocked(false);
		}, 500);
	};

	const handleAddItemToShoppingList = (item: ShoppingDataBase) => {
		const newDatabaseItem = { ...item, weight: item.weight + 1 };
		setShoppingDatabaseItems((prev) =>
			prev
				.concat(newDatabaseItem)
				.filter((i) => i.id !== item.id)
				.sort((a, b) => b.weight - a.weight)
		);
		const newItem = convertDatabaseItemToShoppingItem(item, amountValue || '1');
		setShoppingListItems((prev) => [...prev, newItem]);
		setSearchItemInputVal('');
		setAmountValue('1');
		addItemToShoppingList.mutate(newItem);
	};

	const handleItemDeletion = (id: number) => {
		const deletedItem = allShoppingDatabaseItems.find((item) => item.id === id);
		const newshoppngDatabaseItems = [...shoppingDatabaseItems, deletedItem as ShoppingDataBase];
		setShoppingDatabaseItems(newshoppngDatabaseItems.sort((a, b) => b.weight - a.weight));
		setShoppingListItems((prev) => prev.filter((item) => item.id !== id));
	};

	const handleItemCheck = (id: number) => {
		setShoppingListItems((prev) =>
			prev.map((item) => {
				if (item.id === id) {
					item.checked = !item.checked;
					checkShoppingItem.mutate({ id, checked: item.checked });
				}
				return item;
			})
		);

		if (shoppingItemsGroupedByCategory.length > 0) {
			const fullGroupsChecked = shoppingItemsGroupedByCategory.filter((group) => {
				const checkedItems = group.items.filter((item) => item.checked);
				return checkedItems.length === group.items.length;
			});
			if (fullGroupsChecked.length > 0) {
				setFinishedGroupsOfItems(fullGroupsChecked);
				setShoppingItemsGroupedByCategory(
					shoppingItemsGroupedByCategory.filter((group) => {
						const checkedItems = group.items.filter((item) => item.checked);
						return checkedItems.length !== group.items.length;
					})
				);
			} else {
				setShoppingItemsGroupedByCategory(shoppingItemsGroupedByCategory);
			}
		}
	};

	const markAllChecked = () => {
		setShoppingListItems((prev) =>
			prev.map((item) => {
				item.checked = true;
				checkShoppingItem.mutate({ id: item.id, checked: item.checked });
				return item;
			})
		);

		markAllItemsChecked.mutate();
	};

	const handleAddButtonClick = () => {
		const item = allShoppingDatabaseItems.find(
			(item) => item.name.toLowerCase() === searchItemInputVal.toLowerCase()
		);
		if (item) {
			handleAddItemToShoppingList(item);
		} else {
			setIsCategoriesModalOpen(true);
		}
	};

	const clearShoppingList = () => {
		modals.openConfirmModal({
			title: 'Do you really wanna delete all shopping list items?',
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
				setShoppingDatabaseItems(shoppingDatabaseItems.sort((a, b) => b.weight - a.weight));
				setShoppingListItems([]);
				clearShoppingListItems.mutate();
			},
		});
	};

	const handleNewItemCategorySelection = (
		category: ShoppingCategoriesList,
		refreshCategoriesList: boolean
	) => {
		const newDatabaseItem = {
			name: searchItemInputVal,
			categoryId: category.id,
			quantity: parseInt(amountValue || '1'),
		};
		createDatabaseItem.mutate(
			{
				createNewShoppingItem: false,
				dataBaseObject: newDatabaseItem,
			},
			{
				onSuccess: (data) => {
					setShoppingDatabaseItems((prev) => [...prev, data]);
					handleAddItemToShoppingList(data);
					if (refreshCategoriesList) {
						setCategoriesList((prev) => [...prev, category]);
					}
					setIsCategoriesModalOpen(false);
				},
			}
		);
	};

	const handleQuantityChange = (id: number, quantity: number) => {
		setShoppingListItems((prev) =>
			prev.map((item) => {
				if (item.id === id) {
					item.quantity = quantity;
				}
				return item;
			})
		);
	};

	return (
		<>
			<div className="relative rounded-lg bg-white p-4 transition duration-200 ease-in-out dark:bg-[#1d1f20] ">
				<div className="flex items-center justify-between">
					<div className="flex w-full items-center justify-between text-lg font-bold text-[#030910] dark:text-[#e0e2e4] md:text-xl">
						<span>
							Lista zakupów (łącznie:{' '}
							{totalPriceForItems.toFixed(2).replace('.', ',')}):
						</span>
					</div>
				</div>
				<hr className="my-2 mt-3 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
				<div className="relative flex justify-between gap-4">
					<div className="w-full flex-auto md:relative">
						<TextInput
							placeholder="Nazwa"
							className="mb-1 w-full"
							value={searchItemInputVal}
							onChange={(event) => {
								setSearchItemInputVal(event.currentTarget.value);
							}}
							onClick={() => {
								setShowDatabaseList((prev) => !prev);
								setClicksOnListBlocked(true);
							}}
							onBlur={() => {
								setTimeout(() => {
									setShowDatabaseList(false);
									setClicksOnListBlocked(false);
								}, 200);
							}}
							onMouseDown={() => {
								setTimeout(() => {
									setShowDatabaseList(true);
									setClicksOnListBlocked(true);
								}, 200);
							}}
							onSubmitCapture={() => {
								if (selectedItem) {
									handleAddItemToShoppingList(selectedItem);
								}
							}}
							rightSection={
								searchItemInputVal.length > 0 && (
									<div
										className="cursor-pointer text-blue-700"
										onClick={() => setSearchItemInputVal('')}
										onKeyDown={() => setSearchItemInputVal('')}
										role="button"
										tabIndex={0}
									>
										X
									</div>
								)
							}
						/>
						{showDatabaseList && (
							<div className="absolute z-50 flex w-full flex-col overflow-hidden rounded-md">
								{shoppingDatabaseItemsFiltered.map((item) => (
									<>
										<div
											key={item.id}
											className={`flex cursor-pointer flex-col bg-[#232527] p-2 text-[#e0e2e4] hover:!bg-gray-200 dark:bg-white dark:text-[#030910] ${
												selectedItem?.id === item.id ? '!bg-gray-200' : ''
											}`}
											onClick={() => {
												handleSelectItem(item);
											}}
											onKeyDown={() => {
												handleSelectItem(item);
											}}
											onTouchEnd={() => {
												handleSelectItem(item, true);
											}}
											role="button"
											tabIndex={0}
										>
											<div className="flex items-center justify-between">
												<span className="text-base">
													{item.name.charAt(0).toUpperCase() +
														item.name.slice(1)}
												</span>
												<span className="text-xs">
													{
														categoriesList.find(
															(category) =>
																category.id === item.categoryId
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
						value={amountValue}
						onChange={(value) => {
							setAmountValue(value);
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
				<div className="flex flex-col">
					{isLoading && (
						<div className="flex items-center justify-center p-10">
							<Loader color="blue" size="xl" />
						</div>
					)}
					{shoppingItemsGroupedByCategory.map((group) => (
						<div
							key={group.categoryId}
							className={`flex flex-col ${
								clicksOnListBlocked ? 'pointer-events-none' : ''
							}`}
						>
							<hr className="my-1 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
							<div className="flex items-center justify-between text-xs font-bold text-[#030910] dark:text-[#e0e2e4] md:text-sm">
								<span className="text-xs md:text-lg">
									{group.categoryName.charAt(0).toUpperCase() +
										group.categoryName.slice(1)}
								</span>
								<span>{group.priceForItems.toFixed(2).replace('.', ',')} zł</span>
							</div>
							<hr className="my-1 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
							{group.items &&
								group.items.map((item) => (
									<ShoppingItemEl
										key={`${item.name}shopping`}
										item={item}
										onItemDeletion={() => handleItemDeletion(item.id)}
										onItemCheck={() => handleItemCheck(item.id)}
										onQuantityChange={handleQuantityChange}
										done={false}
									/>
								))}
						</div>
					))}
				</div>
				<hr className="my-2 mt-3 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
				<div className="flex justify-center gap-2 pt-2">
					<button
						className="w-32 rounded-lg bg-blue-500 py-2 text-sm font-bold text-white opacity-100 hover:bg-blue-800"
						onClick={() => markAllChecked()}
					>
						Mark all checked
					</button>
					<button
						className="w-32 rounded-lg bg-red-500 py-2 text-sm font-bold text-white opacity-100 hover:bg-red-800"
						onClick={() => clearShoppingList()}
					>
						Clear list
					</button>
					<Popover width={300} trapFocus position="bottom" withArrow shadow="md">
						<Popover.Target>
							<button className="rounded-lg bg-gray-500 px-2 py-2 text-sm font-bold text-white opacity-100 hover:bg-gray-800">
								<IconDots size="1.5rem" />
							</button>
						</Popover.Target>
						<Popover.Dropdown>
							<button
								className="w-full rounded-lg bg-gray-500 py-2 text-sm font-bold text-white opacity-100 hover:bg-gray-800"
								onClick={() => void setAllDatabaseItemsWeightToOne.mutate()}
							>
								Set all weight to 1
							</button>
						</Popover.Dropdown>
					</Popover>
				</div>
				<CategoriesWindow
					isOpen={isCategoriesModalOpen}
					onClose={() => setIsCategoriesModalOpen(false)}
					categoriesList={categoriesList}
					onCategorySelection={handleNewItemCategorySelection}
				/>
				{/* <CategoriesModal
				categoriesList={categoriesList}
				onCategorySelection={handleNewItemCategorySelection}
				modalOpened={modalOpened}
				closeModal={close}
			/> */}
			</div>
			<div className="relative rounded-lg bg-white p-4 transition duration-200 ease-in-out dark:bg-[#1d1f20] ">
				<div className="flex items-center justify-between">
					<div className="flex w-full items-center justify-between text-lg font-bold text-[#030910] dark:text-[#e0e2e4] md:text-xl">
						<span>Zakupione:</span>
					</div>
				</div>
				<div className="flex flex-col">
					{isLoading && (
						<div className="flex items-center justify-center p-10">
							<Loader color="blue" size="xl" />
						</div>
					)}
					{finishedGroupsOfItems.length > 0 && (
						<div className="flex flex-col">
							{finishedGroupsOfItems.map((group) => (
								<div
									key={group.categoryId}
									className={`flex flex-col ${
										clicksOnListBlocked ? 'pointer-events-none' : ''
									}`}
								>
									<hr className="my-1 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
									<div className="flex items-center justify-between text-xs font-bold text-[#030910] dark:text-[#e0e2e4] md:text-sm">
										<span className="text-xs md:text-lg">
											{group.categoryName.charAt(0).toUpperCase() +
												group.categoryName.slice(1)}
										</span>
									</div>
									<hr className="my-1 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
									{group.items &&
										group.items.map((item) => (
											<ShoppingItemEl
												key={`${item.name}shopping`}
												item={item}
												onItemDeletion={() => handleItemDeletion(item.id)}
												onItemCheck={() => handleItemCheck(item.id)}
												onQuantityChange={handleQuantityChange}
												done={true}
											/>
										))}
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</>
	);
};
