import { calcValues, calcWin, newDeck, type BlackJackGame } from '$lib/blackjack';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	let game: BlackJackGame = await request.json();
	let { playerID, bet, cards, playerCards, dealerCards, playerValue, dealerValue } = game;
	if (cards.length < 1) cards = newDeck();
	playerCards.push(cards.splice(Math.floor(Math.random() * cards.length), 1)[0]);
	({ playerValue, dealerValue } = calcValues(playerCards, dealerCards));
	game.playerValue = playerValue;
	game.dealerValue = dealerValue;
	let win = await calcWin(false, game);
	if (win) return json({ finished: true, game, win });
	let newGame = {
		playerID,
		bet,
		cards,
		playerCards,
		dealerCards,
		playerValue,
		dealerValue
	};
	return json({ finished: false, game: newGame, win });
};
