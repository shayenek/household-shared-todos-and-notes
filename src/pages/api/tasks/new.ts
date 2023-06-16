import { TRPCError } from '@trpc/server';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import { type NextApiRequest, type NextApiResponse } from 'next';

import { env } from '~/env.mjs';

import { appRouter } from '../../../server/api/root';
import { createTRPCContext } from '../../../server/api/trpc';

const createNewTask = async (req: NextApiRequest, res: NextApiResponse) => {
	// Create context and caller
	const ctx = await createTRPCContext({ req, res });
	const caller = appRouter.createCaller(ctx);

	console.log(req);

	if (req.headers.authorization !== env.NEXTAUTH_SECRET) {
		console.log('Error in api call');
		return res.status(401).json({ error: 'Unauthorized' });
	}

	console.log('api call success');

	try {
		const { title, description } = req.body as {
			title: string;
			description: string;
		};
		console.log(title, description);
		if (!title) {
			return res.status(400).json({ error: 'Invalid title' });
		}
		if (!description) {
			return res.status(400).json({ error: 'Invalid description' });
		}

		const newTask = await caller.tasks.createTaskPublic({
			title: title,
			description: description,
		});
		console.log('Task created');
		res.status(200).json(newTask);
	} catch (cause) {
		if (cause instanceof TRPCError) {
			// An error from tRPC occured
			const httpCode = getHTTPStatusCodeFromError(cause);
			return res.status(httpCode).json(cause);
		}
		// Another error occured
		console.error(cause);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export default createNewTask;
