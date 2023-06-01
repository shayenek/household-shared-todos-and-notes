import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { pusherServerClient } from '~/server/pusher';

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

			const taskItem = await ctx.prisma.task.create({
				data: {
					title,
					description,
					author: { connect: { id: ctx.session.user.id } },
					type,
					startDate,
					startTime,
					endDate,
					endTime,
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
	deleteTask: protectedProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(({ input, ctx }) => {
			const id = input.id;

			return ctx.prisma.task.delete({
				where: {
					id,
				},
			});
		}),
	getAllTasks: protectedProcedure.query(({ ctx }) => {
		return ctx.prisma.task.findMany({
			orderBy: {
				createdAt: 'desc',
			},
		});
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
