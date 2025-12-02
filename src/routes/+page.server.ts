import { updateIPs } from '$lib';
import { login, dbQuery } from '$lib/db';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { v7 as uuid } from 'uuid';
import type { PageServerLoad } from './app/admin/$types';

export const load: PageServerLoad = ({ url }) => {
	let searchParams = url.searchParams;
	let msg = searchParams.get('msg') ?? '';
	let color = searchParams.get('color') ?? '#ee2c2c';
	let usr = searchParams.get('usr') ?? '';
	return { msg, color, usr, pass: '' };
};

export const actions = {
	default: async ({ cookies, request }) => {
		const data = await request.formData();
		let usr = data.get('usr')?.toString();
		let pass = data.get('pass')?.toString();
		if (!usr) return fail(400, { auth: false, msg: 'Please provide a username', usr: usr });
		if (!pass) return fail(400, { auth: false, msg: 'Please provide a password', usr: usr });
		const { auth, validUsr } = await login(usr, pass);
		if (auth) {
			const res = await dbQuery('SELECT id FROM users WHERE username = ?', [usr]);
			const results = res[0];
			const ip = data.get('ip')?.toString();
			if (ip) updateIPs(results.id, ip);
			const sessionID = uuid();
			const sessionExpire = Date.now() + 24 * 60 * 60 * 1000;
			cookies.set('session', sessionID, { path: '/' });
			await dbQuery('UPDATE users SET session_id = ?, session_expire = ? WHERE id = ?', [
				sessionID,
				sessionExpire,
				results.id
			]);
			redirect(303, '/app');
		} else if (validUsr) {
			return fail(401, { auth, msg: 'Incorrect Password', usr: usr });
		} else {
			return fail(401, { auth, msg: 'Username not found', usr: usr });
		}
	}
} satisfies Actions;
