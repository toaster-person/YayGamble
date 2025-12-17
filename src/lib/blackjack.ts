import { dbQuery } from './db';

export type BlackJackGame = {
	playerID: string;
	bet: number;
	cards: string[];
	dealerCards: string[];
	dealerValue: number;
	playerCards: string[];
	playerValue: number;
};

export function newDeck() {
	const suits = ['♠', '♥', '♦', '♣'];
	const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
	let cards: string[] = [];
	for (let i = 0; i < 5; i++)
		cards = cards.concat(suits.flatMap((suit) => ranks.map((rank) => `${rank}${suit}`)));
	return cards;
}

export function getCardValue(card: string) {
	const rank = card.slice(0, card.length - 1);
	if (rank == '?') return 0;
	if (rank === 'A') return 11;
	if (['K', 'Q', 'J'].includes(rank)) return 10;
	return parseInt(rank, 10);
}

export function calcValues(playerCards: string[], dealerCards: string[]) {
	let playerValue = 0;
	let dealerValue = 0;
	for (let card of playerCards) playerValue += getCardValue(card);
	for (let card of dealerCards) dealerValue += getCardValue(card);
	({ playerValue, dealerValue } = fixAce(playerCards, dealerCards, playerValue, dealerValue));
	return { playerValue, dealerValue };
}

export function fixAce(
	playerCards: string[],
	dealerCards: string[],
	playerValue: number,
	dealerValue: number
) {
	for (let card of playerCards) {
		playerValue -= card.startsWith('A') && playerValue > 21 ? 10 : 0;
	}
	for (let card of dealerCards) {
		dealerValue -= card.startsWith('A') && dealerValue > 21 ? 10 : 0;
	}
	return { playerValue, dealerValue };
}

export function buildHands(cards: string[]) {
	let playerCards = [],
		dealerCards = [];
	for (let i = 0; i < 2; i++) {
		playerCards.push(cards.splice(Math.floor(Math.random() * cards.length), 1)[0]);
	}
	dealerCards.push(cards.splice(Math.floor(Math.random() * cards.length), 1)[0]);
	dealerCards.push('??');
	return { playerCards, dealerCards };
}

export async function calcWin(stand: boolean, game: BlackJackGame) {
	let { playerValue, dealerValue, playerCards, dealerCards } = game;
	if (playerValue > 21) return await lose('Bust', game);
	else if (playerValue == 21 && dealerValue == 21) return await push(game);
	else if (dealerValue == 21 && dealerCards.length == 2)
		return await lose('Dealer Blackjack', game);
	else if (playerValue == 21 && playerCards.length == 2) return await win('Blackjack', game);
	else if (stand) {
		if (dealerValue == playerValue) return await push(game);
		else if (dealerValue > 21) return win('Dealer Bust', game);
		else if (dealerValue > playerValue) return await lose('Closest to 21', game);
		else if (playerValue > dealerValue) return await win('Closest to 21', game);
		else return await lose("this shouldn't even happen but you lose ig", game);
	}
	return null;
}

async function win(msg: string, game: BlackJackGame) {
	const id: string = game.playerID;
	const bet: number = game.bet;
	const res = await dbQuery('SELECT balance FROM users WHERE id = ?', [id]);
	if (res.length != 1) throw new Error('more than 1 user for id');
	const results = res[0];
	let bal = results.balance;
	bal += bet * 2;
	await dbQuery('UPDATE users SET balance = ? WHERE id = ?', [bal, id]);
	return { won: true, push: false, bal, msg };
}

async function lose(msg: string, game: BlackJackGame) {
	const id = game.playerID;
	const res = await dbQuery('SELECT balance FROM users WHERE id = ?', [id]);
	if (res.length != 1) throw new Error('more than 1 user for id');
	const results = res[0];
	let bal = results.balance;
	await dbQuery('UPDATE users SET balance = ? WHERE id = ?', [bal, id]);
	return { won: false, push: false, bal, msg };
}

async function push(game: BlackJackGame) {
	const id = game.playerID;
	const res = await dbQuery('SELECT balance FROM users WHERE id = ?', [id]);
	if (res.length != 1) throw new Error('more than 1 user for id');
	const results = res[0];
	let bal = results.balance;
	return { won: false, push: true, bal, msg: 'Push - Money Back' };
}
