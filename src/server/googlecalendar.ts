import { createHash } from 'crypto';

import getAccessToken from '~/utils/getAccessToken';

export type EventProps = {
	id: string;
	start: string;
	end: string;
	summary: string;
	description: string;
	location: string;
};

const buildEventBody = ({ id, start, end, summary, description }: EventProps) => {
	return {
		id,
		start: {
			dateTime: start,
			timeZone: 'Europe/Warsaw',
		},
		end: {
			dateTime: end,
			timeZone: 'Europe/Warsaw',
		},
		summary,
		description,
		conferenceData: {
			createRequest: {
				requestId: id,
				conferenceSolutionKey: {
					type: `hangoutsMeet`,
				},
			},
		},
	};
};

export const getHash: (data: string) => string = (data) => {
	return createHash('sha256')
		.update(data + (process.env.GOOGLE_OAUTH_SECRET ?? ''))
		.digest('hex');
};

export default async function createCalendarAppointment(props: EventProps) {
	const body = buildEventBody(props);

	const apiUrl = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');

	apiUrl.searchParams.set('conferenceDataVersion', '1');

	const createEvent = await fetch(apiUrl, {
		cache: 'no-cache',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${await getAccessToken()}`,
		},
		body: JSON.stringify(body),
	});

	// const responseData: unknown = await createEvent.json();
	// console.log(responseData);

	return createEvent;
}

export async function deleteCalendarAppointment(id: string) {
	const apiUrl = new URL(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${id}`);

	return fetch(apiUrl, {
		cache: 'no-cache',
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${await getAccessToken()}`,
		},
	});
}
