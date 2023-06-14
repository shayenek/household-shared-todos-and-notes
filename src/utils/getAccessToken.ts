/**
 * Retrieves an access token from Google using a refresh token.
 *
 * @returns {Promise<string>} A promise that resolves to the access token.
 * @throws {Error} If any required environment variables are missing,
 *                 or if no access token is returned.
 */
export default async function getAccessToken(): Promise<string> {
	if (!process.env.GOOGLE_CLIENT_SECRET) {
		throw new Error('GOOGLE_CLIENT_SECRET not set');
	}
	if (!process.env.GOOGLE_OAUTH_REFRESH) {
		throw new Error('GOOGLE_OAUTH_REFRESH not set');
	}
	if (!process.env.GOOGLE_CLIENT_ID) {
		throw new Error('GOOGLE_CLIENT_SECRET not set');
	}

	const params = new URLSearchParams({
		grant_type: 'refresh_token',
		client_secret: process.env.GOOGLE_CLIENT_SECRET,
		refresh_token: process.env.GOOGLE_OAUTH_REFRESH,
		client_id: process.env.GOOGLE_CLIENT_ID,
	});

	const response = await fetch('https://oauth2.googleapis.com/token', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
		body: params.toString(),
		cache: 'no-cache',
	});

	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const json = await response.json();

	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	if (!json.access_token) {
		throw new Error(`Couldn't get access token: ${JSON.stringify(json, null, 2)}`);
	}

	// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
	return json.access_token as string;
}
