import { TRPCError } from '@trpc/server';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import { type NextApiRequest, type NextApiResponse } from 'next';

import { env } from '~/env.mjs';

import { appRouter } from '../../../server/api/root';
import { createTRPCContext } from '../../../server/api/trpc';

const allItemsPublic = async (req: NextApiRequest, res: NextApiResponse) => {
	// Create context and caller
	const ctx = await createTRPCContext({ req, res });
	const caller = appRouter.createCaller(ctx);

	if (req.headers.authorization !== env.NEXTAUTH_SECRET) {
		console.log('Error in api call');
		return res.status(401).json({ error: 'Unauthorized' });
	}

	console.log('api call success');

	try {
		const items = await caller.pattern.getAllItemsWithoutShoppingItemsPublic();
		res.status(200).json(items);
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

export default allItemsPublic;
