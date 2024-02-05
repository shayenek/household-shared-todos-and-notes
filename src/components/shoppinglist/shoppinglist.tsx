import { Loader } from '@mantine/core';
import {
	type ShoppingItem,
	type ShoppingDataBase,
	type ShoppingCategoriesList,
} from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';

import { useShoppingStore } from '~/store/shopping';
import { type ShoppingItemsGrouped } from '~/types/shoppinglist';
import { api } from '~/utils/api';
import { useSubscribeToEvent } from '~/utils/pusher';

import { BottomMenu } from './bottommenu';
import { BoughtItems } from './boughtitems';
import { SearchBar } from './searchbar';
import { ShoppingItemsList } from './shoppingitemslist';

export const ShoppingList = () => {
	const [isLoading, setIsLoading] = useState(true);

	const { categoriesList, shoppingListItems } = useShoppingStore((state) => ({
		categoriesList: state.shoppingCategories,
		shoppingListItems: state.shoppingList,
	}));

	const itemCategories = api.shoppingDatabase.getCategories.useQuery();
	const allDatabaseItems = api.shoppingDatabase.getAllItems.useQuery();
	const filteredDatabaseItems = api.shoppingDatabase.getAllItemsWithoutShoppingItems.useQuery();
	const allShoppingListItemsByWeight =
		api.shoppingList.getAllShoppingItemsSortedByDatabaseItemsWeight.useQuery();
	const setAllDatabaseItemsWeightToOne =
		api.shoppingDatabase.setAllItemsWeightToOne.useMutation();
	const checkShoppingItem = api.shoppingList.checkItem.useMutation();
	const markAllItemsChecked = api.shoppingList.markAllChecked.useMutation();

	const groupByCategory = useCallback(
		(list: ShoppingItem[], categoryList: ShoppingCategoriesList[]) => {
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
		},
		[]
	);

	useEffect(() => {
		if (itemCategories.data) {
			useShoppingStore.setState({ shoppingCategories: itemCategories.data });
		}
		if (allDatabaseItems.data) {
			useShoppingStore.setState({ shoppingDatabase: allDatabaseItems.data });
		}
		if (allShoppingListItemsByWeight.data) {
			useShoppingStore.setState({ shoppingList: allShoppingListItemsByWeight.data });
			useShoppingStore.setState({
				totalPrice: allShoppingListItemsByWeight.data.reduce(
					(sum, item) => sum + item.price * item.quantity,
					0
				),
			});
		}
		if (filteredDatabaseItems.data) {
			useShoppingStore.setState({
				shoppingDatabaseFiltered: filteredDatabaseItems.data,
			});
		}
		setTimeout(() => {
			setIsLoading(false);
		}, 1000);
	}, [
		itemCategories.data,
		allDatabaseItems.data,
		allShoppingListItemsByWeight.data,
		filteredDatabaseItems.data,
	]);

	useEffect(() => {
		if (shoppingListItems && categoriesList) {
			const groupedByCategory = groupByCategory(shoppingListItems, categoriesList);
			const unfinishedGroups = groupedByCategory.filter((group) => {
				return group.items.some((item) => !item.checked);
			});
			const finishedGroups = groupedByCategory.filter((group) => {
				return group.items.every((item) => item.checked);
			});
			useShoppingStore.setState({
				shoppingItemsGrouped: unfinishedGroups,
				finishedShoppingList: finishedGroups,
				totalPrice: shoppingListItems.reduce(
					(sum, item) => sum + item.price * item.quantity,
					0
				),
			});
		}
	}, [shoppingListItems, categoriesList, groupByCategory]);

	const handleItemDeletion = (id: number) => {
		const deletedItem = useShoppingStore
			.getState()
			.shoppingDatabase.find((item) => item.id === id);
		const newshoppingDatabaseItems = [
			...useShoppingStore.getState().shoppingDatabaseFiltered,
			deletedItem as ShoppingDataBase,
		];
		useShoppingStore.setState({
			shoppingDatabaseFiltered: newshoppingDatabaseItems.sort((a, b) => b.weight - a.weight),
			shoppingList: shoppingListItems.filter((item) => item.id !== id),
		});
	};

	const handleItemCheck = useCallback(
		(id: number) => {
			useShoppingStore.setState({
				shoppingList: useShoppingStore.getState().shoppingList.map((item) => {
					if (item.id === id) {
						item.checked = !item.checked;
						checkShoppingItem.mutate({ id, checked: item.checked });
					}
					return item;
				}),
			});
		},
		[checkShoppingItem]
	);

	const clearShoppingList = () => {
		useShoppingStore.setState({
			shoppingDatabaseFiltered: useShoppingStore
				.getState()
				.shoppingDatabase.sort((a, b) => b.weight - a.weight),
		});
		useShoppingStore.setState({ shoppingList: [] });
	};

	const markAllChecked = () => {
		useShoppingStore.setState({
			shoppingList: useShoppingStore.getState().shoppingList.map((item) => {
				item.checked = true;
				checkShoppingItem.mutate({ id: item.id, checked: item.checked });
				return item;
			}),
		});

		markAllItemsChecked.mutate();
	};

	const handleQuantityChange = (id: number, quantity: number) => {
		useShoppingStore.setState({
			shoppingList: useShoppingStore.getState().shoppingList.map((item) => {
				if (item.id === id) {
					item.quantity = quantity;
				}
				return item;
			}),
		});
	};

	useSubscribeToEvent((eventName, data: { shoppingItem: ShoppingItem }) => {
		switch (eventName) {
			case 'new-shopping-item':
				if (
					!useShoppingStore
						.getState()
						.shoppingList.find((item) => item.id === data.shoppingItem.id)
				) {
					useShoppingStore.setState({
						shoppingList: [
							...useShoppingStore.getState().shoppingList,
							data.shoppingItem,
						],
						shoppingDatabaseFiltered: useShoppingStore
							.getState()
							.shoppingDatabaseFiltered.filter(
								(item) => item.id !== data.shoppingItem.id
							)
							.sort((a, b) => b.weight - a.weight),
					});
				}
				break;
			case 'shopping-item-checked':
				useShoppingStore.setState({
					shoppingList: useShoppingStore.getState().shoppingList.map((item) => {
						if (item.id === data.shoppingItem.id) {
							item.checked = data.shoppingItem.checked;
						}
						return item;
					}),
				});
				break;
			case 'shopping-item-deleted':
				{
					const databaseItem = useShoppingStore
						.getState()
						.shoppingDatabase.find((item) => item.id === data.shoppingItem.id);

					useShoppingStore.setState({
						shoppingList: useShoppingStore
							.getState()
							.shoppingList.filter((item) => item.id !== data.shoppingItem.id),
						shoppingDatabaseFiltered: [
							...useShoppingStore.getState().shoppingDatabaseFiltered,
							databaseItem as ShoppingDataBase,
						].sort((a, b) => b.weight - a.weight),
					});
				}
				break;
			case 'shopping-item-quantityUpdate':
				useShoppingStore.setState({
					shoppingList: useShoppingStore.getState().shoppingList.map((item) => {
						if (item.id === data.shoppingItem.id) {
							item.quantity = data.shoppingItem.quantity;
						}
						return item;
					}),
				});
				break;
			default:
				break;
		}
	});

	return (
		<>
			{isLoading && (
				<div className="relative rounded-lg bg-white p-4 transition duration-200 ease-in-out dark:bg-[#1d1f20] ">
					<div className="flex items-center justify-center p-10">
						<Loader color="blue" size="xl" />
					</div>
				</div>
			)}
			{!isLoading && (
				<>
					<SearchBar />
					<ShoppingItemsList
						handleItemDeletion={handleItemDeletion}
						handleItemCheck={handleItemCheck}
						handleQuantityChange={handleQuantityChange}
					/>
					<BoughtItems handleItemCheck={handleItemCheck} />
					<BottomMenu
						markAllChecked={markAllChecked}
						clearShoppingList={clearShoppingList}
						handleSetAllDatabaseItemsWeightToOne={setAllDatabaseItemsWeightToOne.mutate}
					/>
				</>
			)}
		</>
	);
};
