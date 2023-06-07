import { randomBytes } from 'crypto';

import { z } from 'zod';

import { createTRPCRouter, publicProcedure } from '~/server/api/trpc';

export const loginRouter = createTRPCRouter({
	checkLoginCode: publicProcedure
		.input(
			z.object({
				loginCode: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { loginCode } = input;

			const checkCode = await ctx.prisma.code.findMany({
				where: {
					code: loginCode,
				},
			});

			if (checkCode.length === 0) {
				throw new Error('No code found');
			}

			const generatedSessionToken = randomBytes(32).toString('hex');

			const createSession = await ctx.prisma.codesession.create({
				data: {
					id: generatedSessionToken,
					sessionToken: generatedSessionToken,
					expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
				},
			});

			if (!createSession) {
				throw new Error('Could not create session');
			}

			return generatedSessionToken;
		}),
	checkSession: publicProcedure
		.input(
			z.object({
				sessionToken: z.string(),
			})
		)
		.mutation(async ({ input, ctx }) => {
			const { sessionToken } = input;

			const checkSession = await ctx.prisma.codesession.findFirst({
				where: {
					sessionToken,
				},
			});

			if (!checkSession) {
				throw new Error('No session found');
			}

			if (checkSession.expires < new Date()) {
				await ctx.prisma.session.delete({
					where: {
						id: checkSession.id,
					},
				});

				throw new Error('Session expired');
			}

			return checkSession.sessionToken;
		}),
});
