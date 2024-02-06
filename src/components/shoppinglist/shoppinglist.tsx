import { Loader } from '@mantine/core';
import { type Item, type Pattern } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';

import { useShoppingStore } from '~/store/shopping';
import { api } from '~/utils/api';
import { useSubscribeToEvent } from '~/utils/pusher';

import { BottomMenu } from './bottommenu';
import { BoughtItems } from './boughtitems';
import { groupByCategory } from './helpers';
import { ItemsListEl } from './itemslist';
import { PatternsView } from './patternsview';
import { SearchBar } from './searchbar';

export const ShoppingList = () => {
	const [isLoading, setIsLoading] = useState(true);

	const { categories, items, patterns } = useShoppingStore((state) => ({
		categories: state.categories,
		items: state.items,
		patterns: state.patterns,
	}));

	const itemCategories = api.pattern.getCategories.useQuery();
	const allDatabaseItems = api.pattern.getAllItems.useQuery();
	const filteredDatabaseItems = api.pattern.getAllItemsWithoutShoppingItems.useQuery();
	const allShoppingListItemsByWeight =
		api.item.getAllShoppingItemsSortedByDatabaseItemsWeight.useQuery();
	const setAllDatabaseItemsWeightToOne = api.pattern.setAllItemsWeightToOne.useMutation();
	const checkShoppingItem = api.item.checkItem.useMutation();
	const markAllItemsChecked = api.item.markAllChecked.useMutation();

	useEffect(() => {
		if (itemCategories.data) {
			useShoppingStore.setState({ categories: itemCategories.data });
		}
		if (allDatabaseItems.data) {
			useShoppingStore.setState({ patterns: allDatabaseItems.data });
		}
		if (allShoppingListItemsByWeight.data) {
			useShoppingStore.setState({ items: allShoppingListItemsByWeight.data });
			useShoppingStore.setState({
				totalPrice: allShoppingListItemsByWeight.data.reduce(
					(sum, item) => sum + item.price * item.quantity,
					0
				),
			});
		}
		if (filteredDatabaseItems.data) {
			useShoppingStore.setState({
				patternsFiltered: filteredDatabaseItems.data,
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
		if (items && categories) {
			const groupedByCategory = groupByCategory(items, categories);
			const unfinishedGroups = groupedByCategory.filter((group) => {
				return group.items.some((item) => !item.checked);
			});
			const finishedGroups = groupedByCategory.filter((group) => {
				return group.items.every((item) => item.checked);
			});
			useShoppingStore.setState({
				itemsGrouped: unfinishedGroups,
				finishedItemsGrouped: finishedGroups,
				totalPrice: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
			});
		}
	}, [items, categories]);

	useEffect(() => {
		if (patterns) {
			useShoppingStore.setState({
				patterns: patterns.sort((a, b) => b.weight - a.weight),
			});
		}
	}, [patterns]);

	const handleItemDeletion = (id: number) => {
		const deletedItem = useShoppingStore.getState().patterns.find((item) => item.id === id);
		const newshoppingDatabaseItems = [
			...useShoppingStore.getState().patternsFiltered,
			deletedItem as Pattern,
		];
		useShoppingStore.setState({
			patternsFiltered: newshoppingDatabaseItems.sort((a, b) => b.weight - a.weight),
			items: useShoppingStore.getState().items.filter((item) => item.id !== id),
		});
	};

	const handleItemCheck = useCallback(
		(id: number) => {
			useShoppingStore.setState({
				items: useShoppingStore.getState().items.map((item) => {
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
			patternsFiltered: useShoppingStore
				.getState()
				.patterns.sort((a, b) => b.weight - a.weight),
		});
		useShoppingStore.setState({ items: [] });
	};

	const markAllChecked = () => {
		useShoppingStore.setState({
			items: useShoppingStore.getState().items.map((item) => {
				item.checked = true;
				checkShoppingItem.mutate({ id: item.id, checked: item.checked });
				return item;
			}),
		});

		markAllItemsChecked.mutate();
	};

	const handleQuantityChange = (id: number, quantity: number) => {
		useShoppingStore.setState({
			items: useShoppingStore.getState().items.map((item) => {
				if (item.id === id) {
					item.quantity = quantity;
				}
				return item;
			}),
		});
	};

	useSubscribeToEvent((eventName, data: { shoppingItem: Item }) => {
		switch (eventName) {
			case 'new-shopping-item':
				if (
					!useShoppingStore
						.getState()
						.items.find((item) => item.id === data.shoppingItem.id)
				) {
					useShoppingStore.setState({
						items: [...useShoppingStore.getState().items, data.shoppingItem],
						patternsFiltered: useShoppingStore
							.getState()
							.patternsFiltered.filter((item) => item.id !== data.shoppingItem.id)
							.sort((a, b) => b.weight - a.weight),
					});
				}
				break;
			case 'shopping-item-checked':
				useShoppingStore.setState({
					items: useShoppingStore.getState().items.map((item) => {
						if (item.id === data.shoppingItem.id) {
							item.checked = data.shoppingItem.checked;
						}
						return item;
					}),
				});
				break;
			case 'shopping-item-deleted':
				{
					useShoppingStore.setState({
						items: useShoppingStore
							.getState()
							.items.filter((item) => item.id !== data.shoppingItem.id),
					});

					const databaseItem = useShoppingStore
						.getState()
						.patterns.find((item) => item.id === data.shoppingItem.id);
					if (
						databaseItem &&
						!useShoppingStore.getState().patternsFiltered.includes(databaseItem)
					) {
						useShoppingStore.setState({
							patternsFiltered: [
								...useShoppingStore.getState().patternsFiltered,
								databaseItem,
							].sort((a, b) => b.weight - a.weight),
						});
					}
				}
				break;
			case 'shopping-item-quantityUpdate':
				useShoppingStore.setState({
					items: useShoppingStore.getState().items.map((item) => {
						if (item.id === data.shoppingItem.id) {
							item.quantity = data.shoppingItem.quantity;
						}
						return item;
					}),
				});
				break;
			case 'shopping-items-cleared':
				useShoppingStore.setState({
					items: [],
					patternsFiltered: useShoppingStore
						.getState()
						.patterns.sort((a, b) => b.weight - a.weight),
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
					{useShoppingStore.getState().patternsView ? (
						<PatternsView />
					) : (
						<>
							<SearchBar />
							<ItemsListEl
								handleItemDeletion={handleItemDeletion}
								handleItemCheck={handleItemCheck}
								handleQuantityChange={handleQuantityChange}
							/>
							<BoughtItems handleItemCheck={handleItemCheck} />
						</>
					)}
					<BottomMenu
						markAllChecked={markAllChecked}
						clearShoppingList={clearShoppingList}
						setAllPatternsWeightToOne={setAllDatabaseItemsWeightToOne.mutate}
					/>
				</>
			)}
		</>
	);
};
