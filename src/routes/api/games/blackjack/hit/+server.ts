import { calcValues, calcWin, type BlackJackGame } from '$lib/blackjack';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
	let game: BlackJackGame = await request.json();
	let { playerID, bet, cards, playerCards, dealerCards, playerValue, dealerValue } = game;
	playerCards.push(cards.splice(Math.floor(Math.random() * cards.length), 1)[0]);
	({ playerValue, dealerValue } = calcValues(playerCards, dealerCards));
	let win = await calcWin(false, game);
	if (win) return json({ finished: true, data: win });
	let newGame = {
		playerID,
		bet,
		cards,
		playerCards,
		dealerCards,
		playerValue,
		dealerValue
	};
	return json({ finished: false, data: newGame });
};
