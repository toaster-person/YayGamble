import { buildHands, calcValues, calcWin, newDeck, type BlackJackGame } from '$lib/blackjack';
import { dbQuery } from '$lib/db';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	let { sessionID, bet, cards } = await request.json();
	const res = await dbQuery('SELECT id, balance FROM users WHERE session_id = ?', [sessionID]);
	const playerID = res[0].id;
	let bal = res[0].balance;
	bal -= bet;
	await dbQuery('UPDATE users SET balance = ? WHERE id = ?', [bal, playerID]);
	var dealerValue = 0;
	var playerValue = 0;
	var dealerCards: string[] = [];
	var playerCards: string[] = [];

	if (cards.length < 3) cards = newDeck();

	({ playerCards, dealerCards } = buildHands(cards));
	({ playerValue, dealerValue } = calcValues(playerCards, dealerCards));

	let game: BlackJackGame = {
		playerID,
		bet,
		cards,
		dealerCards,
		playerCards,
		playerValue,
		dealerValue
	};
	let win = await calcWin(false, game);
	if (win) return json({ finished: true, game, win });
	return json({ finished: false, game, win });
};
