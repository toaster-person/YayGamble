import { calcValues, calcWin, type BlackJackGame } from '$lib/blackjack';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	let game: BlackJackGame = await request.json();
	let { cards, playerCards, dealerCards, playerValue, dealerValue } = game;
	dealerCards.splice(dealerCards.indexOf('??'), 2);
	while (dealerValue < 17) {
		dealerCards.push(cards.splice(Math.floor(Math.random() * cards.length), 1)[0]);
		({ playerValue, dealerValue } = calcValues(playerCards, dealerCards));
		game.playerValue = playerValue;
		game.dealerValue = dealerValue;
		let win = await calcWin(false, game);
		if (win) return json({ finished: true, game, win });
	}
	let win = await calcWin(true, game);
	return json({ finished: true, game, win });
};
