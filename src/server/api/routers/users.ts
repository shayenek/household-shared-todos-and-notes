import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const usersRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.example.findMany();
  }),
  getUserData: protectedProcedure.query(({ ctx }) => {
    if(!ctx.session?.user?.email) {
      throw new Error("No user found");
    } else {
      return ctx.prisma.user.findUnique({
        where: {
          email: ctx.session.user.email,
        },
      });
    }
  }),
});
