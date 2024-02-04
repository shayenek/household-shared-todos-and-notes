import { type ShoppingItem } from '@prisma/client';

export type ShoppingItemsGrouped = {
	categoryId: number;
	categoryName: string;
	priceForItems: number;
	items: ShoppingItem[];
};
