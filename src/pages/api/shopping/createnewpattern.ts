import { TRPCError } from '@trpc/server';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import { type NextApiRequest, type NextApiResponse } from 'next';

import { env } from '~/env.mjs';

import { appRouter } from '../../../server/api/root';
import { createTRPCContext } from '../../../server/api/trpc';

type DataBaseObject = {
	name: string;
	categoryId: number;
	quantity: number;
};

const createNewPattern = async (req: NextApiRequest, res: NextApiResponse) => {
	const ctx = await createTRPCContext({ req, res });
	const caller = appRouter.createCaller(ctx);

	if (req.headers.authorization !== env.NEXTAUTH_SECRET) {
		console.log('Error in api call');
		return res.status(401).json({ error: 'Unauthorized' });
	}

	try {
		const dataBaseObject = req.body as DataBaseObject;
		const newItem = await caller.item.createNewPatternPublic(dataBaseObject);
		res.status(200).json(newItem);
	} catch (cause) {
		if (cause instanceof TRPCError) {
			const httpCode = getHTTPStatusCodeFromError(cause);
			return res.status(httpCode).json(cause);
		}
		console.error(cause);
		res.status(500).json({ message: 'Internal server error' });
	}
};

export default createNewPattern;
