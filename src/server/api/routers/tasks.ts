import {
  createTRPCRouter,
  protectedProcedure,
} from "~/server/api/trpc";

type Task = {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
    authorId: string;
};

export const tasksRouter = createTRPCRouter({
    getTasksForUser: protectedProcedure.query(({ ctx }) => {
        if(!ctx.session?.user?.id) {
            throw new Error("No user found");
        } else {
            return ctx.prisma.task.findMany({
                where: {
                    authorId: ctx.session.user.id,
                },
            }) as Task[];
        }
    }),
});
