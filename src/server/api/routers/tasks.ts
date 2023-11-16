import { z } from 'zod';

import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc';
import { prisma } from '~/server/db';
import createCalendarAppointment, {
	deleteCalendarAppointment,
	getHash,
} from '~/server/googlecalendar';
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
				startDate: z.date(),
				startTime: z.string(),
				endDate: z.date(),
				endTime: z.string(),
				calendarEventId: z.string().optional(),
				repeat: z.string(),
				reminders: z.array(z.string()).optional(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const {
				title,
				description,
				type,
				startDate,
				startTime,
				endDate,
				endTime,
				repeat,
				reminders,
			} = input;
			const dateForHash = new Date().toISOString();
			const calendarEventId =
				type === 'task' ? getHash(`${title}${description}${dateForHash}`) : null;

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
					calendarEventId,
				},
			});

			await pusherServerClient.trigger(`user-shayenek`, 'task-created', {
				task: taskItem,
			});

			if (type === 'task') {
				if (!calendarEventId) return;

				const combinedStartDateTime = new Date(startDate);
				const combinedEndDateTime = new Date(endDate);

				const combinedStartISOString = combinedStartDateTime.toISOString().replace('Z', '');
				const combinedStartISOStringParts = combinedStartISOString.split('T');
				const FinalSTartTime = `${
					combinedStartISOStringParts[0] || ''
				}T${startTime}:00.000`;

				const combinedEndISOString = combinedEndDateTime.toISOString().replace('Z', '');
				const combinedEndISOStringParts = combinedEndISOString.split('T');
				const FinalEndTime = `${combinedEndISOStringParts[0] || ''}T${endTime}:00.000`;

				const remindersObject = {
					useDefault: false as boolean,
					overrides: [] as { method: 'popup'; minutes: number }[],
				};

				if (reminders) {
					if (reminders.includes('none')) {
						remindersObject.useDefault = false;
					} else {
						if (reminders.includes('default')) {
							remindersObject.useDefault = true;
						}
						reminders.forEach((reminder) => {
							if (reminder === 'default') return;
							remindersObject.overrides.push({
								method: 'popup',
								minutes: parseInt(reminder),
							});
						});
					}
				}

				const createEvent = await createCalendarAppointment({
					id: calendarEventId,
					start: FinalSTartTime,
					end: FinalEndTime,
					location: 'Online',
					summary: title,
					description: description,
					recurrence: repeat !== 'none' ? [repeat] : [],
					reminders: remindersObject,
				});

				if (createEvent) {
					if (createEvent.status === 200) {
						console.log('Event created successfully');
						return;
					} else {
						console.log('Event creation failed');
						console.log(createEvent.statusText);
						console.log(createEvent);
						return;
					}
				}
			}

			return taskItem;
		}),
	createTaskBulk: publicProcedure.mutation(async ({ ctx }) => {
		const lastTask = await ctx.prisma.task.findFirst({
			orderBy: {
				position: 'desc',
			},
			select: {
				position: true,
			},
		});

		const newPosition = (lastTask?.position || 0) + 1024;

		return prisma.task.createMany({
			data: [
				{
					title: 'Task 1',
					description: 'Task 1 description',
					authorId: 'cliljn3ly0000ufokenumit3j',
					type: 'note',
					startDate: new Date(),
					startTime: '12:00',
					endDate: new Date(),
					endTime: '13:00',
					position: newPosition,
				},
				{
					title: 'Task 2',
					description: 'Task 2 description',
					authorId: 'cliljn3ly0000ufokenumit3j',
					type: 'note',
					startDate: new Date(),
					startTime: '12:00',
					endDate: new Date(),
					endTime: '13:00',
					position: newPosition + 1024,
				},
				{
					title: 'Task 3',
					description: 'Task 3 description',
					authorId: 'cliljn3ly0000ufokenumit3j',
					type: 'note',
					startDate: new Date(),
					startTime: '12:00',
					endDate: new Date(),
					endTime: '13:00',
					position: newPosition + 2048,
				},
				{
					title: 'Task 4',
					description: 'Task 4 description',
					authorId: 'cliljn3ly0000ufokenumit3j',
					type: 'note',
					startDate: new Date(),
					startTime: '12:00',
					endDate: new Date(),
					endTime: '13:00',
					position: newPosition + 3072,
				},
				{
					title: 'Task 5',
					description: 'Task 5 description',
					authorId: 'cliljn3ly0000ufokenumit3j',
					type: 'note',
					startDate: new Date(),
					startTime: '12:00',
					endDate: new Date(),
					endTime: '13:00',
					position: newPosition + 4096,
				},
			],
		});
	}),

	updateTaskStatus: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				completed: z.boolean(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { id, completed } = input;

			const taskUpdate = await ctx.prisma.task.update({
				where: {
					id,
				},
				data: {
					completed,
				},
			});

			if (taskUpdate.type === 'task' && taskUpdate.calendarEventId) {
				await deleteCalendarAppointment(taskUpdate.calendarEventId);
			}

			return taskUpdate;
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

			await pusherServerClient.trigger(`user-shayenek`, 'task-updated', {
				task: taskUpdated,
			});

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

			// await pusherServerClient.trigger(`user-shayenek`, 'tasks-repositioned', {});

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

			if (deleteTask.type === 'task' && deleteTask.calendarEventId) {
				await deleteCalendarAppointment(deleteTask.calendarEventId);
			}

			await pusherServerClient.trigger(`user-shayenek`, 'task-deleted', {
				task: deleteTask,
			});

			return deleteTask;
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
	// Native queries
	getAllTasksPublic: publicProcedure.query(() => {
		return prisma.task.findMany({
			orderBy: {
				position: 'desc',
			},
		});
	}),
	createTaskPublic: publicProcedure
		.input(
			z.object({
				title: z.string(),
				description: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { title, description } = input;

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
					author: { connect: { id: 'cliljn3ly0000ufokenumit3j' } },
					type: 'note',
					startDate: null,
					startTime: null,
					endDate: null,
					endTime: null,
					position: newPosition,
					calendarEventId: null,
				},
			});

			await pusherServerClient.trigger(`user-shayenek`, 'task-created', {
				task: taskItem,
			});

			return taskItem;
		}),
	updateTaskPublic: publicProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string(),
				description: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { id, title, description } = input;

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
				},
			});

			await pusherServerClient.trigger(`user-shayenek`, 'api-task-updated', {
				task: taskUpdated,
			});

			return taskUpdated;
		}),

	deleteTaskPublic: publicProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.mutation(async ({ input }) => {
			const id = input.id;

			const deleteTask = await prisma.task.delete({
				where: {
					id,
				},
			});

			if (deleteTask.type === 'task' && deleteTask.calendarEventId) {
				await deleteCalendarAppointment(deleteTask.calendarEventId);
			}

			await pusherServerClient.trigger(`user-shayenek`, 'api-task-deleted', {
				task: deleteTask,
			});

			return deleteTask;
		}),
});
