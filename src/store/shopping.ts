import {
	type ShoppingCategoriesList,
	type ShoppingDataBase,
	type ShoppingItem,
} from '@prisma/client';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { type ShoppingItemsGrouped } from '~/types/shoppinglist';

export interface ShoppingState {
	shoppingCategories: ShoppingCategoriesList[];
	setShoppingCategories: (shoppingCategories: ShoppingCategoriesList[]) => void;
	searchInputVal: string;
	setSearchInputVal: (searchInputVal: string) => void;
	selectedItem: ShoppingDataBase | null;
	setSelectedItem: (selectedItem: ShoppingDataBase | null) => void;
	amountValue: number;
	setAmountValue: (amountValue: number) => void;
	addButtonClicked: boolean;
	setAddButtonClicked: (addButtonClicked: boolean) => void;
	shoppingDatabase: ShoppingDataBase[];
	setShoppingDatabase: (shoppingDatabase: ShoppingDataBase[]) => void;
	showDatabaseList: boolean;
	setShowDatabaseList: (showDatabaseList: boolean) => void;
	shoppingDatabaseFiltered: ShoppingDataBase[];
	setShoppingDatabaseFiltered: (shoppingDatabaseFiltered: ShoppingDataBase[]) => void;
	shoppingList: ShoppingItem[];
	setShoppingList: (shoppingList: ShoppingItem[]) => void;
	shoppingItemsGrouped: ShoppingItemsGrouped[];
	setShoppingItemsGrouped: (shoppingItemsGrouped: ShoppingItemsGrouped[]) => void;
	finishedShoppingList: ShoppingItemsGrouped[];
	setFinishedShoppingList: (finishedShoppingList: ShoppingItemsGrouped[]) => void;
	totalPrice: number;
	setTotalPrice: (totalPrice: number) => void;
	clicksOnListBlocked: boolean;
	setClicksOnListBlocked: (clicksOnListBlocked: boolean) => void;
	// shoppingDatabaseByWord: ShoppingDataBase[];
	// setShoppingDatabaseByWord: (shoppingDatabaseByWord: ShoppingDataBase[]) => void;
	isCategoriesModalOpen: boolean;
	setIsCategoriesModalOpen: (isCategoriesModalOpen: boolean) => void;
}

export const useShoppingStore = create<ShoppingState>()(
	devtools((set) => ({
		shoppingCategories: [],
		setShoppingCategories: (shoppingCategories) => set({ shoppingCategories }),

		searchInputVal: '',
		setSearchInputVal: (searchInputVal) => set({ searchInputVal }),

		selectedItem: null,
		setSelectedItem: (selectedItem) => set({ selectedItem }),

		amountValue: 1,
		setAmountValue: (amountValue) => set({ amountValue }),

		addButtonClicked: false,
		setAddButtonClicked: (addButtonClicked) => set({ addButtonClicked }),

		shoppingDatabase: [],
		setShoppingDatabase: (shoppingDatabase) => set({ shoppingDatabase }),

		showDatabaseList: false,
		setShowDatabaseList: (showDatabaseList) => set({ showDatabaseList }),

		shoppingDatabaseFiltered: [],
		setShoppingDatabaseFiltered: (shoppingDatabaseFiltered) =>
			set({ shoppingDatabaseFiltered }),

		shoppingList: [],
		setShoppingList: (shoppingList) => set({ shoppingList }),

		shoppingItemsGrouped: [],
		setShoppingItemsGrouped: (shoppingItemsGrouped) => set({ shoppingItemsGrouped }),

		finishedShoppingList: [],
		setFinishedShoppingList: (finishedShoppingList) => set({ finishedShoppingList }),

		totalPrice: 0,
		setTotalPrice: (totalPrice) => set({ totalPrice }),

		clicksOnListBlocked: false,
		setClicksOnListBlocked: (clicksOnListBlocked) => set({ clicksOnListBlocked }),

		// shoppingDatabaseByWord: [],
		// setShoppingDatabaseByWord: (shoppingDatabaseByWord) => set({ shoppingDatabaseByWord }),

		isCategoriesModalOpen: false,
		setIsCategoriesModalOpen: (isCategoriesModalOpen) => set({ isCategoriesModalOpen }),
	}))
);

// export interface ShoppingCategoriesState {
// 	shoppingCategories: ShoppingCategoriesList[];
// 	setShoppingCategories: (shoppingCategories: ShoppingCategoriesList[]) => void;
// }

// export const useShoppingCategoriesStore = create<ShoppingCategoriesState>((set) => ({
// 	shoppingCategories: [],
// 	setShoppingCategories: (shoppingCategories) => set({ shoppingCategories }),
// }));

// export interface SearchInputValState {
// 	searchInputVal: string;
// 	setSearchInputVal: (searchInputVal: string) => void;
// }

// export const useSearchInputValStore = create<SearchInputValState>((set) => ({
// 	searchInputVal: '',
// 	setSearchInputVal: (searchInputVal) => set({ searchInputVal }),
// }));

// export interface SelectedItemState {
// 	selectedItem: ShoppingDataBase | null;
// 	autoSelect?: boolean;
// 	setSelectedItem: (selectedItem: ShoppingDataBase) => void;
// }

// export const useSelectedItemStore = create<SelectedItemState>((set) => ({
// 	selectedItem: {} as ShoppingDataBase | null,
// 	autoSelect: false,
// 	setSelectedItem: (selectedItem) => set({ selectedItem }),
// }));

// export interface amountValueState {
// 	amountValue: number;
// 	setAmountValue: (amountValue: number) => void;
// }

// export const useAmountValueStore = create<amountValueState>((set) => ({
// 	amountValue: 1,
// 	setAmountValue: (amountValue) => set({ amountValue }),
// }));

// export interface addButtonClickedState {
// 	addButtonClicked: boolean;
// 	setAddButtonClicked: (addButtonClicked: boolean) => void;
// }

// export const useAddButtonClickedStore = create<addButtonClickedState>((set) => ({
// 	addButtonClicked: false,
// 	setAddButtonClicked: (addButtonClicked) => set({ addButtonClicked }),
// }));

// export interface ShoppingDatabaseState {
// 	shoppingDatabase: ShoppingDataBase[];
// 	setShoppingDatabase: (shoppingDatabase: ShoppingDataBase[]) => void;
// }

// export const useShoppingDatabaseStore = create<ShoppingDatabaseState>((set) => ({
// 	shoppingDatabase: [],
// 	setShoppingDatabase: (shoppingDatabase) => set({ shoppingDatabase }),
// }));

// export interface ShowDatabaseListState {
// 	showDatabaseList: boolean;
// 	setShowDatabaseList: (showDatabaseList: boolean) => void;
// }

// export const useShowDatabaseListStore = create<ShowDatabaseListState>((set) => ({
// 	showDatabaseList: false,
// 	setShowDatabaseList: (showDatabaseList) => set({ showDatabaseList }),
// }));

// export interface ShoppingDatabaseFiltered {
// 	shoppingDatabaseFiltered: ShoppingDataBase[];
// 	setShoppingDatabaseFiltered: (shoppingDatabaseFiltered: ShoppingDataBase[]) => void;
// }

// export const useShoppingDatabaseFilteredStore = create<ShoppingDatabaseFiltered>((set) => ({
// 	shoppingDatabaseFiltered: [],
// 	setShoppingDatabaseFiltered: (shoppingDatabaseFiltered) => set({ shoppingDatabaseFiltered }),
// }));

// export interface ShoppingListState {
// 	shoppingList: ShoppingItem[];
// 	setShoppingList: (shoppingList: ShoppingItem[]) => void;
// }

// export const useShoppingListStore = create<ShoppingListState>((set) => ({
// 	shoppingList: [],
// 	setShoppingList: (shoppingList) => set({ shoppingList }),
// }));

// export interface ShoppingItemsGroupedState {
// 	shoppingItemsGrouped: ShoppingItemsGrouped[];
// 	setShoppingItemsGrouped: (shoppingItemsGrouped: ShoppingItemsGrouped[]) => void;
// }

// export const useShoppingItemsGroupedStore = create<ShoppingItemsGroupedState>((set) => ({
// 	shoppingItemsGrouped: [],
// 	setShoppingItemsGrouped: (shoppingItemsGrouped) => set({ shoppingItemsGrouped }),
// }));

// export interface FinishedShoppingListState {
// 	finishedShoppingList: ShoppingItemsGrouped[];
// 	setFinishedShoppingList: (finishedShoppingList: ShoppingItemsGrouped[]) => void;
// }

// export const useFinishedShoppingListStore = create<FinishedShoppingListState>((set) => ({
// 	finishedShoppingList: [],
// 	setFinishedShoppingList: (finishedShoppingList) => set({ finishedShoppingList }),
// }));

// export interface totalPriceState {
// 	totalPrice: number;
// 	setTotalPrice: (totalPrice: number) => void;
// }

// export const useTotalPriceStore = create<totalPriceState>((set) => ({
// 	totalPrice: 0,
// 	setTotalPrice: (totalPrice) => set({ totalPrice }),
// }));

// export interface clicksOnListBlockedState {
// 	clicksOnListBlocked: boolean;
// 	setClicksOnListBlocked: (clicksOnListBlocked: boolean) => void;
// }

// export const useClicksOnListBlockedStore = create<clicksOnListBlockedState>((set) => ({
// 	clicksOnListBlocked: false,
// 	setClicksOnListBlocked: (clicksOnListBlocked) => set({ clicksOnListBlocked }),
// }));
