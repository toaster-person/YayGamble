import { dbQuery } from '$lib/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const { id } = await request.json();
	const res = await dbQuery('SELECT allow_collect, balance FROM users WHERE id = ?', [id]);
	if (res.length != 1) throw new Error('more than one user with the same id');
	const response = res[0];
	if (response.allow_collect <= Date.now()) {
		await dbQuery('UPDATE users SET balance = ? WHERE id = ?', [response.balance + 1000, id]);
		return json({ success: true, msg: 'Successfully collected $1000' });
	} else {
		return json({ success: false, msg: 'Still on cooldown' });
	}
};
