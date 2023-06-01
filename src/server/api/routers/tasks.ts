import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { pusherServerClient } from "~/server/pusher";

export const tasksRouter = createTRPCRouter({
    createTask: protectedProcedure
        .input(
            z.object({
                title: z.string(),
                description: z.string(),
                authorId: z.string().optional(),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            const { title, description } = input;

            await pusherServerClient.trigger(
                'presence-channel-tasks-and-notes',
                'new-task',
                {}
            )

            return ctx.prisma.task.create({
                data: {
                    title,
                    description,
                    author: { connect: { id: ctx.session.user.id } },
                },
            });
        }),
    deleteTask: protectedProcedure
        .input
        (z.object({
            id: z.string(),
        }))
        .mutation(({ input, ctx }) => {

            const id = input.id;
            
            return ctx.prisma.task.delete({
                where: {
                    id,
                },
            });
        }),
    getTasksForUser: protectedProcedure.query(({ ctx }) => {
        if(!ctx.session?.user?.id) {
            throw new Error("No user found");
        } else {
            return ctx.prisma.task.findMany({
                where: {
                    authorId: ctx.session.user.id,
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        }
    }),
});
