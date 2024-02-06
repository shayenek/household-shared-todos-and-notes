import { type Category, type Pattern, type Item } from '@prisma/client';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import { type ItemGrouped } from '~/types/shoppinglist';

export interface ShoppingState {
	searchInputVal: string;
	setSearchInputVal: (searchInputVal: string) => void;
	selectedItem: Pattern | null;
	setSelectedItem: (selectedItem: Pattern | null) => void;
	amountValue: number;
	setAmountValue: (amountValue: number) => void;
	totalPrice: number;
	setTotalPrice: (totalPrice: number) => void;
	isCategoriesModalOpen: boolean;
	setIsCategoriesModalOpen: (isCategoriesModalOpen: boolean) => void;
	patternsView: boolean;
	setDatabaseItemsView: (patternsView: boolean) => void;
	showPatternsList: boolean;
	setShowDatabaseList: (showPatternsList: boolean) => void;
	addButtonClicked: boolean;
	setAddButtonClicked: (addButtonClicked: boolean) => void;
	clicksOnListBlocked: boolean;
	setClicksOnListBlocked: (clicksOnListBlocked: boolean) => void;

	categories: Category[];
	setCategories: (categories: Category[]) => void;

	patterns: Pattern[];
	setPatterns: (patterns: Pattern[]) => void;

	patternsFiltered: Pattern[];
	setPatternsFiltered: (patternsFiltered: Pattern[]) => void;

	items: Item[];
	setItems: (items: Item[]) => void;

	itemsGrouped: ItemGrouped[];
	setItemsGrouped: (itemsGrouped: ItemGrouped[]) => void;

	finishedItemsGrouped: ItemGrouped[];
	setFinishedItemsGrouped: (finishedItemsGrouped: ItemGrouped[]) => void;
}

export const useShoppingStore = create<ShoppingState>()(
	devtools((set) => ({
		searchInputVal: '',
		setSearchInputVal: (searchInputVal) => set({ searchInputVal }),

		selectedItem: null,
		setSelectedItem: (selectedItem) => set({ selectedItem }),

		amountValue: 1,
		setAmountValue: (amountValue) => set({ amountValue }),

		totalPrice: 0,
		setTotalPrice: (totalPrice) => set({ totalPrice }),

		isCategoriesModalOpen: false,
		setIsCategoriesModalOpen: (isCategoriesModalOpen) => set({ isCategoriesModalOpen }),

		patternsView: false,
		setDatabaseItemsView: (patternsView) => set({ patternsView }),

		showPatternsList: false,
		setShowDatabaseList: (showPatternsList) => set({ showPatternsList }),

		addButtonClicked: false,
		setAddButtonClicked: (addButtonClicked) => set({ addButtonClicked }),

		clicksOnListBlocked: false,
		setClicksOnListBlocked: (clicksOnListBlocked) => set({ clicksOnListBlocked }),

		categories: [],
		setCategories: (categories) => set({ categories }),

		patterns: [],
		setPatterns: (patterns) => set({ patterns }),

		patternsFiltered: [],
		setPatternsFiltered: (patternsFiltered) => set({ patternsFiltered }),

		items: [],
		setItems: (items) => set({ items }),

		itemsGrouped: [],
		setItemsGrouped: (itemsGrouped) => set({ itemsGrouped }),

		finishedItemsGrouped: [],
		setFinishedItemsGrouped: (finishedItemsGrouped) => set({ finishedItemsGrouped }),
	}))
);
