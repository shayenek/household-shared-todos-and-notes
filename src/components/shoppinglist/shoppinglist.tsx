import { Select, Button, TextInput, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
	type ShoppingItem,
	type ShoppingDataBase,
	type ShoppingCategoriesList,
	type ShoppingListGroupedByCategory,
} from '@prisma/client';
import { useEffect, useState } from 'react';

import { api } from '~/utils/api';

import { CategoriesModal } from './categoriesmodal';
import { ShoppingItemEl } from './shoppingitem';

const removeShoppingListItemsFromDatabase: (
	items: ShoppingItem[],
	databaseItems: ShoppingDataBase[]
) => ShoppingDataBase[] = (items, databaseItems) => {
	const itemsNames = items.map((item) => item.name);
	const filteredDatabaseItems = databaseItems.filter((item) => !itemsNames.includes(item.name));
	return filteredDatabaseItems;
};

const shoppingListGroupedByCategory: (
	list: ShoppingItem[],
	categoryList: ShoppingCategoriesList[]
) => ShoppingListGroupedByCategory = (list, categoryList) => {
	const groupedByCategory = list.reduce((acc, item) => {
		const category = categoryList.find((category) => category.id === item.categoryId)?.name;
		if (!category) {
			return acc;
		}
		if (!acc[category]) {
			acc[category] = [];
		}
		acc[category]!.push(item);
		return acc;
	}, {} as Record<string, ShoppingItem[]>);
	return groupedByCategory;
};

const filterDatabaseItemsByWord = (items: ShoppingDataBase[], word: string, max: number) => {
	return items.filter((item) => item.name.includes(word)).slice(0, max);
};

const sortShoppingItemsByDatabaseWeight = (
	items: ShoppingItem[],
	databaseItems: ShoppingDataBase[]
) => {
	const sortedItems = items.sort((a, b) => {
		const aWeight = databaseItems.find((item) => item.id === a.id)?.weight;
		const bWeight = databaseItems.find((item) => item.id === b.id)?.weight;
		if (aWeight && bWeight) {
			return bWeight - aWeight;
		}
		return 0;
	});
	return sortedItems;
};

export const ShoppingList = () => {
	const [categoriesList, setCategoriesList] = useState<ShoppingCategoriesList[]>([]);
	const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
	const [shoppingDatabase, setShoppingDatabase] = useState<ShoppingDataBase[]>([]);

	const [inputVal, setInputVal] = useState('');
	const [amountValue, setAmountValue] = useState<string | null>('1');

	const [filteredDatabaseItems, setFilteredDatabaseItems] = useState<ShoppingDataBase[]>([]);

	const [, setNewItemSelectedCategory] = useState<ShoppingCategoriesList | null>(null);

	const [modalOpened, { open, close }] = useDisclosure(false);

	const itemCategories = api.shoppingDatabase.getCategories.useQuery();

	const allDatabaseItems = api.shoppingDatabase.getAllItems.useQuery();
	const createDatabaseItem = api.shoppingDatabase.createNewItem.useMutation();

	const allShoppingListItems = api.shoppingList.getAllItems.useQuery();
	const addItemToShoppingList = api.shoppingList.addItemToList.useMutation();
	const markAllItemsChecked = api.shoppingList.markAllChecked.useMutation();
	const clearShoppingListItems = api.shoppingList.clearShoppingList.useMutation();

	useEffect(() => {
		if (allDatabaseItems.data) {
			setShoppingDatabase(allDatabaseItems.data);
		}
		if (itemCategories.data) {
			setCategoriesList(itemCategories.data);
		}
	}, [allDatabaseItems.data, itemCategories.data]);

	useEffect(() => {
		if (allShoppingListItems.data && allDatabaseItems.data) {
			setShoppingDatabase(
				removeShoppingListItemsFromDatabase(
					allShoppingListItems.data,
					allDatabaseItems.data
				)
			);
			setShoppingItems(allShoppingListItems.data);
			// setShoppingItems(
			// 	sortShoppingItemsByDatabaseWeight(allShoppingListItems.data, allDatabaseItems.data)
			// );
		}
	}, [allShoppingListItems.data, allDatabaseItems.data]);

	const shoppingItemsSortedByCategory = Object.keys(
		shoppingListGroupedByCategory(shoppingItems, categoriesList)
	).map((category) => ({
		category,
		items: shoppingListGroupedByCategory(shoppingItems, categoriesList)[category],
	}));

	// Fuzzy search for input
	useEffect(() => {
		if (inputVal.length > 0) {
			setFilteredDatabaseItems(filterDatabaseItemsByWord(shoppingDatabase, inputVal, 10));
		}
	}, [inputVal, shoppingDatabase]);

	const handleSelectItem = (item: ShoppingDataBase) => {
		setInputVal(item.name);
		setFilteredDatabaseItems([]);
	};

	const handleSelectItemOnMobile = (item: ShoppingDataBase) => {
		setInputVal(item.name);
		setFilteredDatabaseItems([]);
		addItemToShoppingList.mutate({
			id: item.id,
			categoryId: item.categoryId,
			quantity: parseInt(amountValue || '1'),
		});
		const { weight, ...newDatabaseItemWithoutWeight } = item;
		handleNewShoppingItemAdded({
			...newDatabaseItemWithoutWeight,
			checked: false,
			quantity: parseInt(amountValue || '1'),
		});
	};

	const handleInputBlur = () => {
		setTimeout(() => {
			setFilteredDatabaseItems([]);
		}, 200);
	};

	const handleNewItemCategorySelection = (category: ShoppingCategoriesList) => {
		setNewItemSelectedCategory(category);
		const newDatabaseItem: ShoppingDataBase = {
			id: 0,
			name: inputVal,
			categoryId: category.id,
			weight: 1,
			location: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		const { weight, ...newDatabaseItemWithoutWeight } = newDatabaseItem;
		setShoppingItems([
			...shoppingItems,
			{
				...newDatabaseItemWithoutWeight,
				checked: false,
				quantity: parseInt(amountValue || '1'),
			},
		]);
		createDatabaseItem.mutate({
			createNewShoppingItem: true,
			dataBaseObject: newDatabaseItem,
		});
		handleNewShoppingItemAdded({
			...newDatabaseItemWithoutWeight,
			checked: false,
			quantity: parseInt(amountValue || '1'),
		});
		close();
	};

	const handleNewShoppingItemAdded = (item: ShoppingItem) => {
		setShoppingItems([...shoppingItems, item]);
		setInputVal('');
		setAmountValue('1');
		setFilteredDatabaseItems([]);
	};

	const handleItemDeletion = (item: ShoppingItem) => {
		const updatedShoppingItems = shoppingItems.filter(
			(shoppingItem) => shoppingItem.id !== item.id
		);
		setShoppingItems(updatedShoppingItems);
	};

	const handleItemCheck = (item: ShoppingItem) => {
		const updatedShoppingItems = shoppingItems.map((shoppingItem) => {
			if (shoppingItem.id === item.id) {
				return { ...shoppingItem, checked: !shoppingItem.checked };
			}
			return shoppingItem;
		});
		setShoppingItems(updatedShoppingItems);
	};

	// Functional functions (for buttons)
	const handleNewItem = () => {
		const item = shoppingDatabase.find((item) => item.name === inputVal);
		if (inputVal && shoppingDatabase.length > 0 && item) {
			addItemToShoppingList.mutate({
				id: item.id,
				categoryId: item.categoryId,
				quantity: parseInt(amountValue || '1'),
			});
			const { weight, ...newDatabaseItemWithoutWeight } = item;
			handleNewShoppingItemAdded({
				...newDatabaseItemWithoutWeight,
				checked: false,
				quantity: parseInt(amountValue || '1'),
			});
			return;
		}
		open();
	};

	const markAllChecked = () => {
		setShoppingItems(
			shoppingItems.map((item) => {
				return { ...item, checked: true };
			})
		);
		markAllItemsChecked.mutate();
	};

	const clearShoppingList = () => {
		clearShoppingListItems.mutate();
		setShoppingItems([]);
		setFilteredDatabaseItems([]);
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
							value={inputVal}
							onChange={(event) => {
								setInputVal(event.currentTarget.value);
							}}
							onBlur={handleInputBlur}
							onMouseDown={() => {
								setTimeout(() => {
									setFilteredDatabaseItems([]);
								}, 200);
							}}
						/>
						<div className="absolute flex w-full flex-col overflow-hidden rounded-md">
							{filteredDatabaseItems.map((item) => (
								<>
									<div
										key={item.id}
										className="flex cursor-pointer flex-col bg-[#232527] p-2 text-[#e0e2e4] hover:!bg-gray-200 dark:bg-white dark:text-[#030910]"
										onClick={() => {
											console.log('chuj');
											handleSelectItem(item);
										}}
										onKeyDown={() => {
											console.log('chuj1');
											handleSelectItem(item);
										}}
										onTouchEnd={() => {
											console.log('chuj2');
											handleSelectItemOnMobile(item);
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
							handleNewItem();
						}}
						disabled={!inputVal}
					>
						Dodaj
					</Button>
				</div>
				<div className="flex flex-col">
					{shoppingItemsSortedByCategory.map((category) => (
						<div key={category.category} className="flex flex-col">
							<hr className="my-1 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
							<div className="flex items-center justify-between text-xs font-bold text-[#030910] dark:text-[#e0e2e4] md:text-sm">
								<span className="text-sm md:text-lg">
									{category.category.charAt(0).toUpperCase() +
										category.category.slice(1)}
								</span>
							</div>
							<hr className="my-1 border-[#dce2e7] transition duration-200 ease-in-out dark:border-[#2d2f31]"></hr>
							{category.items &&
								category.items.map((item) => (
									<ShoppingItemEl
										key={item.id}
										item={item}
										onItemDeletion={() => handleItemDeletion(item)}
										onItemCheck={() => handleItemCheck(item)}
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
				</div>
			</div>
			{/* <CategoriesModal
				categoriesList={categoriesList}
				onCategorySelection={handleNewItemCategorySelection}
				modalOpened={modalOpened}
				closeModal={close}
			/> */}
		</>
	);
};
