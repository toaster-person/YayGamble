import { dbQuery } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const res = await dbQuery('SELECT balance FROM users WHERE session_id = ?', [locals.sessionID]);
	if (res.length != 1) throw new Error('more or less than 1 user for this session_id');
	const results = res[0];
	return { bal: results.balance, sessionID: locals.sessionID };
};
