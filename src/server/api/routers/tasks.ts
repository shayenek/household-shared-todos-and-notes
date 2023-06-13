import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { prisma } from '~/server/db';
import { pusherServerClient } from '~/server/pusher';

const wordToRgbColor: (word: string) => string = (word) => {
	let hashCode = 0;
	for (let i = 0; i < word.length; i++) {
		hashCode = word.charCodeAt(i) + ((hashCode << 5) - hashCode);
	}

	let rgb = 'rgb(';
	for (let j = 0; j < 3; j++) {
		const value = (hashCode >> (j * 4)) & 0xff;
		const limitedValue = Math.max(5, Math.min(250, value));
		rgb += j > 0 ? ',' : '';
		rgb += limitedValue.toString();
	}

	rgb += ')';
	return rgb;
};

export const tasksRouter = createTRPCRouter({
	createTask: protectedProcedure
		.input(
			z.object({
				title: z.string(),
				description: z.string(),
				authorId: z.string().optional(),
				type: z.string(),
				startDate: z.date().optional(),
				startTime: z.string().optional(),
				endDate: z.date().optional(),
				endTime: z.string().optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { title, description, type, startDate, startTime, endDate, endTime } = input;

			let newTitle = '';
			if (title.includes('#')) {
				const taskTitleArray = title.split('#');
				const firstPart = taskTitleArray[0]?.trim();
				const hashtags = taskTitleArray.slice(1);

				const modifiedHashtags = hashtags.map((hashtag) => {
					const trimmedHashtag = hashtag.trim();
					return '#' + trimmedHashtag + '-[' + wordToRgbColor(trimmedHashtag) + ']';
				});

				if (firstPart) {
					newTitle = firstPart + ' ' + modifiedHashtags.join(' ');
				} else {
					newTitle = modifiedHashtags.join(' ');
				}
			}

			const lastTask = await ctx.prisma.task.findFirst({
				orderBy: {
					position: 'desc',
				},
				select: {
					position: true,
				},
			});

			const newPosition = (lastTask?.position || 0) + 1024;

			const taskItem = await ctx.prisma.task.create({
				data: {
					title: newTitle || title,
					description,
					author: { connect: { id: ctx.session.user.id } },
					type,
					startDate,
					startTime,
					endDate,
					endTime,
					position: newPosition,
				},
			});

			await pusherServerClient.trigger(`user-shayenek`, 'new-task', {});

			return taskItem;
		}),
	updateTaskStatus: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				completed: z.boolean(),
			})
		)
		.mutation(({ input, ctx }) => {
			const { id, completed } = input;

			return ctx.prisma.task.update({
				where: {
					id,
				},
				data: {
					completed,
				},
			});
		}),
	updateTask: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string(),
				description: z.string(),
				type: z.string(),
				startDate: z.date(),
				startTime: z.string(),
				endDate: z.date(),
				endTime: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { id, title, description, type, startDate, startTime, endDate, endTime } = input;

			let newTitle = '';
			if (title.includes('#')) {
				const taskTitleArray = title.split('#');
				const firstPart = taskTitleArray[0]?.trim();
				const hashtags = taskTitleArray.slice(1);

				const modifiedHashtags = hashtags.map((hashtag) => {
					const trimmedHashtag = hashtag.trim();
					return '#' + trimmedHashtag + '-[' + wordToRgbColor(trimmedHashtag) + ']';
				});

				if (firstPart) {
					newTitle = firstPart + ' ' + modifiedHashtags.join(' ');
				} else {
					newTitle = modifiedHashtags.join(' ');
				}
			}

			const taskUpdated = await ctx.prisma.task.update({
				where: {
					id,
				},
				data: {
					title: newTitle || title,
					description,
					type,
					startDate,
					startTime,
					endDate,
					endTime,
				},
			});

			await pusherServerClient.trigger(`user-shayenek`, 'task-updated', {});

			return taskUpdated;
		}),
	updateTaskPosition: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				position: z.number(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { id, position } = input;

			const taskPositionUpdated = await ctx.prisma.task.update({
				where: {
					id,
				},
				data: {
					position,
				},
			});

			await pusherServerClient.trigger(`user-shayenek`, 'tasks-repositioned', {});

			return taskPositionUpdated;
		}),
	deleteTask: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const id = input.id;

			const deleteTask = await ctx.prisma.task.delete({
				where: {
					id,
				},
			});

			await pusherServerClient.trigger(`user-shayenek`, 'delete-task', {});

			return deleteTask;
		}),
	getAllTasks: publicProcedure.query(() => {
		return prisma.task.findMany({
			orderBy: {
				createdAt: 'desc',
			},
		});
	}),
	getInfiniteTasks: protectedProcedure
		.input(
			z.object({
				limit: z.number().min(1).max(100).default(20),
				cursor: z.string().optional(),
			})
		)
		.query(async ({ input }) => {
			const { limit, cursor } = input;
			const items = await prisma.task.findMany({
				take: limit + 1,
				orderBy: {
					position: 'desc',
				},
				cursor: cursor ? { id: cursor } : undefined,
			});
			let nextCursor: typeof cursor | undefined = undefined;
			if (items.length > limit) {
				const nextItem = items.pop() as (typeof items)[number];
				nextCursor = nextItem?.id;
			}
			return {
				items,
				nextCursor,
			};
		}),
	getTasksForUser: protectedProcedure.query(({ ctx }) => {
		if (!ctx.session?.user?.id) {
			throw new Error('No user found');
		} else {
			return ctx.prisma.task.findMany({
				where: {
					authorId: ctx.session.user.id,
				},
				orderBy: {
					createdAt: 'desc',
				},
			});
		}
	}),
});
