import { dbQuery } from '$lib/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export type LeaderboardItem = {
	username: string;
	balance: number;
};

export const load: PageServerLoad = async ({ locals }) => {
	const res = await dbQuery(
		'SELECT id, username, balance, is_admin, allow_collect FROM users WHERE session_id = ?',
		[locals.sessionID]
	);
	if (res.length != 1) return redirect(303, '/?msg=Invalid Session - Please log in');
	const results = res[0];
	const usr = results.username;
	const balance = results.balance;
	const isAdmin = results.is_admin;
	const allowCollect = results.allow_collect;
	const id = results.id;
	let leaderboard: LeaderboardItem[] = [];
	const lbRes = await dbQuery(
		'SELECT username, balance FROM users WHERE balance > 0 ORDER BY balance DESC LIMIT 10'
	);
	for (let i = 0; i < lbRes.length; i++) {
		leaderboard[i] = { username: lbRes[i].username, balance: lbRes[i].balance };
	}
	leaderboard.sort((a, b) => {
		return b.balance - a.balance;
	});
	return { id, usr, balance, isAdmin, allowCollect, leaderboard };
};
