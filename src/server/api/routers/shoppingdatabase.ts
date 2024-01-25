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
	createNewItem: protectedProcedure
		.input(
			z.object({
				createNewShoppingItem: z.boolean(),
				dataBaseObject: z.object({
					id: z.number(),
					name: z.string(),
					categoryId: z.number(),
					location: z.nullable(z.string()),
					createdAt: z.date(),
					updatedAt: z.date(),
					weight: z.nullable(z.number()),
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
					location: input.dataBaseObject.location,
					createdAt: input.dataBaseObject.createdAt,
					updatedAt: input.dataBaseObject.updatedAt,
					weight: 1,
				},
			});

			if (input.createNewShoppingItem) {
				await ctx.prisma.shoppingItem.create({
					data: {
						id: newItemId,
						name: input.dataBaseObject.name,
						quantity: 1,
						categoryId: input.dataBaseObject.categoryId,
						checked: false,
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
});

export const shoppingListRouter = createTRPCRouter({
	addItemToList: protectedProcedure
		.input(
			z.object({
				id: z.number(),
				quantity: z.number(),
				categoryId: z.number(),
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
					categoryId: input.categoryId,
					checked: false,
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
	getAllItems: protectedProcedure.query(async ({ ctx }) => {
		const allItems = await ctx.prisma.shoppingItem.findMany({
			orderBy: {
				createdAt: 'asc',
			},
		});

		return allItems;
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
		const allItems = await ctx.prisma.shoppingItem.findMany();

		const deletedItems = allItems.map((item) => {
			return ctx.prisma.shoppingItem.delete({
				where: {
					id: item.id,
				},
			});
		});

		await Promise.all(deletedItems);

		return true;
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
});
