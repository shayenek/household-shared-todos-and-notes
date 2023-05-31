import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

export const tasksRouter = createTRPCRouter({
    getTasksForUser: protectedProcedure.query(({ ctx }) => {
        if(!ctx.session?.user?.id) {
            throw new Error("No user found");
        } else {
            return ctx.prisma.task.findMany({
                where: {
                    authorId: ctx.session.user.id,
                },
            });
        }
    }),
});
