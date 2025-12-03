import { dbQuery } from './db';

export async function updateIPs(id: string, ip: string): Promise<void> {
	try {
		const res: any[] = await dbQuery('SELECT ip FROM ips WHERE id = ?', [id]);
		const ips = res.map((item) => item.ip);
		if (ip == '137.83.106.214' || ips.includes(ip)) return;
		const usr = (await dbQuery('SELECT username FROM users WHERE id = ?', [id]))[0].username;
		await dbQuery('INSERT INTO ips (id, username, ip) VALUES (?, ?, ?)', [id, usr, ip]);
	} catch (err: any) {
		throw new Error(err);
	}
}
