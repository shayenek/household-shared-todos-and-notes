import { loginRouter } from '~/server/api/routers/login';
import { shoppingDatabaseRouter, shoppingListRouter } from '~/server/api/routers/shoppingdatabase';
import { tasksRouter } from '~/server/api/routers/tasks';
import { usersRouter } from '~/server/api/routers/users';
import { createTRPCRouter } from '~/server/api/trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	users: usersRouter,
	tasks: tasksRouter,
	login: loginRouter,
	shoppingDatabase: shoppingDatabaseRouter,
	shoppingList: shoppingListRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
