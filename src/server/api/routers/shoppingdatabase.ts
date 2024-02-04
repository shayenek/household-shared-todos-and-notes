import { type ShoppingItem } from '@prisma/client';
import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';

export const shoppingDatabaseRouter = createTRPCRouter({
	getCategories: protectedProcedure.query(async ({ ctx }) => {
		const categories = await ctx.prisma.shoppingCategoriesList.findMany();

		return categories;
	}),
	createNewCategory: protectedProcedure
		.input(
			z.object({
				name: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const lastCategoryInDatabase = await ctx.prisma.shoppingCategoriesList.findFirst({
				orderBy: {
					id: 'desc',
				},
			});

			const newCategoryId = lastCategoryInDatabase ? lastCategoryInDatabase.id + 1 : 1;

			const newCategory = await ctx.prisma.shoppingCategoriesList.create({
				data: {
					id: newCategoryId,
					name: input.name,
				},
			});

			return newCategory;
		}),
	search: protectedProcedure
		.input(
			z.object({
				searchTerm: z.string(),
			})
		)
		.query(async ({ input, ctx }) => {
			const searchTerm = input.searchTerm;

			const searchResults = await ctx.prisma.shoppingDataBase.findMany({
				where: {
					name: {
						contains: searchTerm,
					},
				},
			});

			return searchResults;
		}),
	getAllItems: protectedProcedure.query(async ({ ctx }) => {
		const allItems = await ctx.prisma.shoppingDataBase.findMany();

		return allItems;
	}),
	getAllItemsWithoutShoppingItems: protectedProcedure.query(async ({ ctx }) => {
		const shoppingItems = await ctx.prisma.shoppingItem.findMany();

		const shoppingItemsIds = shoppingItems.map((item) => item.id);

		const allItems = await ctx.prisma.shoppingDataBase.findMany({
			where: {
				id: {
					notIn: shoppingItemsIds,
				},
			},
			orderBy: {
				weight: 'desc',
			},
		});

		return allItems;
	}),
	createNewItem: protectedProcedure
		.input(
			z.object({
				createNewShoppingItem: z.boolean(),
				dataBaseObject: z.object({
					name: z.string(),
					categoryId: z.number(),
					quantity: z.number(),
				}),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const lastItemInDatabase = await ctx.prisma.shoppingDataBase.findFirst({
				orderBy: {
					id: 'desc',
				},
			});

			const newItemId = lastItemInDatabase ? lastItemInDatabase.id + 1 : 1;

			const newItem = await ctx.prisma.shoppingDataBase.create({
				data: {
					id: newItemId,
					name: input.dataBaseObject.name,
					categoryId: input.dataBaseObject.categoryId,
					location: null,
					createdAt: new Date(),
					updatedAt: new Date(),
					weight: 1,
					price: 0,
				},
			});

			if (input.createNewShoppingItem) {
				await ctx.prisma.shoppingItem.create({
					data: {
						id: newItemId,
						name: input.dataBaseObject.name,
						quantity: input.dataBaseObject.quantity,
						categoryId: input.dataBaseObject.categoryId,
						checked: false,
						price: 0,
					},
				});
			}

			return newItem;
		}),
	getItemByName: protectedProcedure
		.input(
			z.object({
				name: z.string(),
			})
		)
		.query(async ({ input, ctx }) => {
			const itemName = input.name;

			const item = await ctx.prisma.shoppingDataBase.findFirst({
				where: {
					name: itemName,
				},
			});

			if (!item) {
				throw new Error('Item not found');
			}

			return item;
		}),
	setAllItemsWeightToOne: protectedProcedure.mutation(async ({ ctx }) => {
		const allItems = await ctx.prisma.shoppingDataBase.findMany();

		const updatedItems = allItems.map((item) => {
			return ctx.prisma.shoppingDataBase.update({
				where: {
					id: item.id,
				},
				data: {
					weight: 1,
				},
			});
		});

		await Promise.all(updatedItems);

		return true;
	}),
});

export const shoppingListRouter = createTRPCRouter({
	getAllItems: protectedProcedure.query(async ({ ctx }) => {
		const allItems = await ctx.prisma.shoppingItem.findMany({
			orderBy: {
				createdAt: 'asc',
			},
		});

		return allItems;
	}),
	getAllShoppingItemsSortedByDatabaseItemsWeight: protectedProcedure.query(async ({ ctx }) => {
		const allShoppingItems = await ctx.prisma.shoppingItem.findMany({
			orderBy: {
				createdAt: 'asc',
			},
		});

		const allDatabaseItems = await ctx.prisma.shoppingDataBase.findMany();

		const sortedItems = allShoppingItems.sort((a, b) => {
			const aWeight = allDatabaseItems.find((item) => item.id === a.id)?.weight;
			const bWeight = allDatabaseItems.find((item) => item.id === b.id)?.weight;
			if (aWeight && bWeight) {
				return bWeight - aWeight;
			}
			return 0;
		});

		return sortedItems;
	}),
	addItemToList: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				quantity: z.number(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const itemId = input.id;

			const item = await ctx.prisma.shoppingDataBase.findUnique({
				where: {
					id: itemId,
				},
			});

			if (!item) {
				throw new Error('Item not found');
			}

			await ctx.prisma.shoppingItem.create({
				data: {
					id: itemId,
					name: item.name,
					quantity: input.quantity,
					categoryId: item.categoryId,
					checked: false,
					price: 0,
				},
			});

			const updateWeight = await ctx.prisma.shoppingDataBase.update({
				where: {
					id: itemId,
				},
				data: {
					weight: Number(item.weight) + 1,
				},
			});

			return updateWeight;
		}),
	checkItem: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				checked: z.boolean(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const itemId = input.id;

			const item = await ctx.prisma.shoppingItem.findUnique({
				where: {
					id: itemId,
				},
			});

			if (!item) {
				throw new Error('Item not found');
			}

			const newItem = await ctx.prisma.shoppingItem.update({
				where: {
					id: itemId,
				},
				data: {
					checked: input.checked,
				},
			});

			return newItem;
		}),
	markAllChecked: protectedProcedure.mutation(async ({ ctx }) => {
		const allItems = await ctx.prisma.shoppingItem.findMany();

		const updatedItems = allItems.map((item) => {
			return ctx.prisma.shoppingItem.update({
				where: {
					id: item.id,
				},
				data: {
					checked: true,
				},
			});
		});

		await Promise.all(updatedItems);

		return true;
	}),
	clearShoppingList: protectedProcedure.mutation(async ({ ctx }) => {
		const allItems = await ctx.prisma.shoppingItem.deleteMany();

		return allItems;
	}),
	deleteItemFromList: protectedProcedure
		.input(
			z.object({
				id: z.number(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const itemId = input.id;

			const item = await ctx.prisma.shoppingItem.findUnique({
				where: {
					id: itemId,
				},
			});

			if (!item) {
				throw new Error('Item not found');
			}

			const deletedItem = await ctx.prisma.shoppingItem.delete({
				where: {
					id: itemId,
				},
			});

			return deletedItem;
		}),
	updateItemQuantity: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				quantity: z.number(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const itemId = input.id;

			const item = await ctx.prisma.shoppingItem.findUnique({
				where: {
					id: itemId,
				},
			});

			if (!item) {
				throw new Error('Item not found');
			}

			const updatedItem = await ctx.prisma.shoppingItem.update({
				where: {
					id: itemId,
				},
				data: {
					quantity: input.quantity,
				},
			});

			return updatedItem;
		}),
	getPriceForEntireGroupOfItems: protectedProcedure
		.input(
			z.object({
				categoryId: z.number(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const items = await ctx.prisma.shoppingItem.findMany({
				where: {
					categoryId: input.categoryId,
				},
			});

			const priceForItems = items.reduce((acc, item) => {
				return acc + item.quantity * item.price;
			}, 0);

			return priceForItems;
		}),
});
