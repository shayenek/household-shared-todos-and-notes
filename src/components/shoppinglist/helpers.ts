import { type Category, type Item, type Pattern } from '@prisma/client';

import { type PatternGrouped, type ItemGrouped } from '~/types/shoppinglist';

export const groupByCategory = (list: Item[], categoryList: Category[]) => {
	const uniqueCategoryIds = new Set<number>();

	return categoryList.reduce((result, category) => {
		if (!uniqueCategoryIds.has(category.id)) {
			uniqueCategoryIds.add(category.id);

			const priceForItems = list
				.filter((item) => item.categoryId === category.id)
				.reduce((sum, item) => sum + item.price * item.quantity, 0);

			const groupedItems: ItemGrouped = {
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
	}, [] as ItemGrouped[]);
};

export const patternsGroupByCategory = (list: Pattern[], categoryList: Category[]) => {
	const uniqueCategoryIds = new Set<number>();

	return categoryList.reduce((result, category) => {
		if (!uniqueCategoryIds.has(category.id)) {
			uniqueCategoryIds.add(category.id);

			const groupedItems: PatternGrouped = {
				categoryId: category.id,
				categoryName: category.name,
				items: list.filter((item) => item.categoryId === category.id),
			};

			if (groupedItems.items.length > 0) {
				result.push(groupedItems);
			}
		}

		return result;
	}, [] as PatternGrouped[]);
};

export const filterByKeyword = (items: Pattern[], keyword: string, max?: number) => {
	if (keyword.length === 0) {
		return items.slice(0, max || 10);
	}
	return items
		.filter((item) => {
			const normalizedItemName = item.name
				.toLowerCase()
				.normalize('NFD') // Normalize to decomposed form
				.replace(/[\u0300-\u036f]/g, ''); // Remove diacritics
			const normalizedKeyword = keyword
				.toLowerCase()
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '');
			return normalizedItemName.includes(normalizedKeyword);
		})
		.sort((a, b) => {
			const aStartsWithInputVal = a.name
				.toLowerCase()
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.startsWith(keyword.toLowerCase());
			const bStartsWithInputVal = b.name
				.toLowerCase()
				.normalize('NFD')
				.replace(/[\u0300-\u036f]/g, '')
				.startsWith(keyword.toLowerCase());

			if (aStartsWithInputVal && !bStartsWithInputVal) {
				return -1;
			} else if (!aStartsWithInputVal && bStartsWithInputVal) {
				return 1;
			} else {
				return a.name.localeCompare(b.name, 'pl');
			}
		})
		.slice(0, max || 10);
};

export const debounce = <F extends (...args: any[]) => any>(
	func: F,
	delay: number
): ((...args: Parameters<F>) => void) => {
	let timer: ReturnType<typeof setTimeout>;
	return function (this: ThisParameterType<F>, ...args: Parameters<F>) {
		clearTimeout(timer);
		// eslint-disable-next-line @typescript-eslint/no-unsafe-return
		timer = setTimeout(() => func.apply(this, args), delay);
	};
};
