import { type Pattern, type Item } from '@prisma/client';

export type ItemGrouped = {
	categoryId: number;
	categoryName: string;
	priceForItems: number;
	items: Item[];
};

export type PatternGrouped = {
	categoryId: number;
	categoryName: string;
	items: Pattern[];
};
