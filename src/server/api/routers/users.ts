import { z } from 'zod';

import { createTRPCRouter, publicProcedure, protectedProcedure } from '~/server/api/trpc';

export const usersRouter = createTRPCRouter({
	getAll: publicProcedure.query(({ ctx }) => {
		return ctx.prisma.example.findMany();
	}),
	getById: publicProcedure
		.input(
			z.object({
				id: z.string(),
			})
		)
		.query(({ input, ctx }) => {
			const id = input.id;

			console.log(id);

			return ctx.prisma.user.findUnique({
				where: {
					id,
				},
			});
		}),

	getUserData: protectedProcedure.query(({ ctx }) => {
		if (!ctx.session?.user?.email) {
			throw new Error('No user found');
		} else {
			return ctx.prisma.user.findUnique({
				where: {
					email: ctx.session.user.email,
				},
			});
		}
	}),
});
