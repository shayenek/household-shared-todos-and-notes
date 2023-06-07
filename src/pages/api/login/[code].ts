import { TRPCError } from '@trpc/server';
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import { type NextApiRequest, type NextApiResponse } from 'next';

import { appRouter } from '../../../server/api/root';
import { createTRPCContext } from '../../../server/api/trpc';

const checkLoginCode = async (req: NextApiRequest, res: NextApiResponse) => {
	const ctx = await createTRPCContext({ req, res });
	const caller = appRouter.createCaller(ctx);

	try {
		const { code } = req.query;
		if (!code || typeof code !== 'string') {
			return res.status(400).json({ error: 'Invalid code' });
		}

		const checkLoginCode = await caller.login.checkLoginCode({ loginCode: code });

		if (!checkLoginCode) {
			return res.status(400).json({ error: 'Invalid code' });
		}

		res.status(200).json(checkLoginCode);
	} catch (cause) {
		if (cause instanceof TRPCError) {
			// An error from tRPC occured
			const httpCode = getHTTPStatusCodeFromError(cause);
			res.status(httpCode).json({ error: cause.message });
		} else {
			// An unexpected error occured
			console.error(cause);
			res.status(500).json({ error: 'Internal server error' });
		}
	}
};

export default checkLoginCode;
