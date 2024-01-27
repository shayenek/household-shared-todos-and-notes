import { Select, Button, TextInput, Popover } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import {
	type ShoppingItem,
	type ShoppingDataBase,
	type ShoppingCategoriesList,
} from '@prisma/client';
import { IconDots } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { api } from '~/utils/api';

import { CategoriesModal } from './categoriesmodal';
import { ShoppingItemEl } from './shoppingitem';

interface ShoppingItemsGrouped {
	categoryId: number;
	categoryName: string;
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

			const groupedItems: ShoppingItemsGrouped = {
				categoryId: category.id,
				categoryName: category.name,
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
	return items.filter((item) => item.name.includes(word)).slice(0, max);
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
	};
};

export const ShoppingList = () => {
	const [searchItemInputVal, setSearchItemInputVal] = useState('');
	const [amountValue, setAmountValue] = useState<string | null>('1');
	const [showDatabaseList, setShowDatabaseList] = useState(false);

	const [categoriesList, setCategoriesList] = useState<ShoppingCategoriesList[]>([]);

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

	const [modalOpened, { open, close }] = useDisclosure(false);

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
			setShoppingItemsGroupedByCategory(groupByCategory(shoppingListItems, categoriesList));
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
				filterDatabaseItemsByWord(shoppingDatabaseItems, searchItemInputVal, 10)
			);
		}
	}, [shoppingDatabaseItems, searchItemInputVal]);

	const handleSelectItem = (item: ShoppingDataBase, autoSelect?: boolean) => {
		setSearchItemInputVal(item.name);
		setShowDatabaseList(false);
		if (autoSelect) {
			handleAddItemToShoppingList(item);
		}
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
		const item = allShoppingDatabaseItems.find((item) => item.name === searchItemInputVal);
		if (item) {
			handleAddItemToShoppingList(item);
		} else {
			open();
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
					close();
				},
			}
		);
	};

	return (
		<>
			<div className="relative rounded-lg bg-white p-4 transition duration-200 ease-in-out dark:bg-[#1d1f20] ">
				<div className="flex items-center justify-between">
					<div className="flex w-full items-center justify-between text-xs font-bold text-[#030910] dark:text-[#e0e2e4] md:text-sm">
						<span>Lista zakupów:</span>
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
								setSearchItemInputVal(event.currentTarget.value.toLowerCase());
							}}
							onClick={() => {
								setShowDatabaseList((prev) => !prev);
							}}
							onBlur={() => {
								setTimeout(() => {
									if (searchItemInputVal.length === 0) {
										setShowDatabaseList(false);
									}
								}, 300);
							}}
							onMouseDown={() => {
								setTimeout(() => {
									setShowDatabaseList(true);
								}, 200);
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
											className="flex cursor-pointer flex-col bg-[#232527] p-2 text-[#e0e2e4] hover:!bg-gray-200 dark:bg-white dark:text-[#030910]"
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
					{shoppingItemsGroupedByCategory.map((group) => (
						<div key={group.categoryId} className="flex flex-col">
							<hr className="my-1 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
							<div className="flex items-center justify-between text-xs font-bold text-[#030910] dark:text-[#e0e2e4] md:text-sm">
								<span className="text-sm md:text-lg">
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
			</div>
			<CategoriesModal
				categoriesList={categoriesList}
				onCategorySelection={handleNewItemCategorySelection}
				modalOpened={modalOpened}
				closeModal={close}
			/>
		</>
	);
};
