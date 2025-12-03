<script lang="ts">
	import type { BlackJackGame } from '$lib/blackjack';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let bal = $state(data.bal);
	let bet = $state(100);
	let lockedBet = 100;
	let msg = $state('');
	let color = $state('#ee2c2c');
	let playing = false;

	let game: BlackJackGame;

	var dealer = $state('Start a new game!');
	var player = $state('Start a new game!');
	var dealerValue = $state(0);
	var playerValue = $state(0);

	var cards: string[] = $state([]);
	var dealerCards: string[] = [];
	var playerCards: string[] = [];

	async function start() {
		if (playing) {
			msg = 'You are currently playing a game!';
			color = '#ee2c2c';
			return;
		} else if (bal < bet) {
			msg = "You don't have enough money! Lower your bet to play.";
			color = '#ee2c2c';
			return;
		} else if (bet < 100) {
			msg = 'You must bet at least $100!';
			color = '#ee2c2c';
			bet = 100;
			return;
		}
		lockedBet = bet;
		bal -= lockedBet;
		playing = true;
		msg = '';
		const res = await fetch('/api/games/blackjack', {
			method: 'POST',
			body: JSON.stringify({
				sessionID: data.sessionID,
				bet: lockedBet
			})
		});
		game = await res.json();
		({ cards, playerCards, dealerCards, playerValue, dealerValue } = game);
		for (let card in playerCards) player += card + ' ';
		for (let card in dealerCards) dealer += card + ' ';
	}

	async function update(res: Response) {
		const data = await res.json();
		if (data.finished) {
			const status = data.data;
			if (status.push) color = '#FFAC1C';
			if (status.won) color = '#50C878';
			else color = '#ee2c2c';
			msg = status.msg;
			bal = status.bal;
		} else {
			const game = data.data;
			({ cards, playerCards, playerValue, dealerCards, dealerValue } = game);
			for (let card in playerCards) player += card + ' ';
			for (let card in dealerCards) dealer += card + ' ';
		}
	}

	async function hit() {
		if (!playing) {
			color = '#ee2c2c';
			msg = 'You need to start a new game first!';
			return;
		}
		const res = await fetch('/api/games/blackjack/hit');
		update(res);
	}

	async function stand() {
		if (!playing) {
			color = '#ee2c2c';
			msg = 'You need to start a new game first!';
			return;
		}
		const res = await fetch('/api/games/blackjack/stand');
		update(res);
	}
</script>

<title>Slots</title>

<div class="m-auto text-center">
	<h1 class="mb-0 text-[4rem]">Blackjack</h1>
</div>

<h1 class="m-auto text-center text-[3rem]">Balance = ${bal}</h1>
<h1 class="m-auto text-center text-[2rem] text-[{color}]" id="msg">{msg}</h1>

<div
	id="play-area"
	class="m-auto grid h-fit w-[50%] grid-cols-2 rounded-[15px] bg-(--light-grey) p-[2%] text-center dark:bg-(--grey)"
>
	<p class="text-[3rem]">Player Cards</p>
	<p class="text-[3rem]">Dealer Cards</p>
	<p>{player}</p>
	<p>{dealer}</p>
	<p>{playerValue}</p>
	<p>{dealerValue}</p>
</div>
<div
	class="m-auto mt-[2%] h-fit w-[50%] rounded-[15px] bg-(--light-grey) p-[1%] text-center text-[1.5rem] dark:bg-(--grey)"
>
	Cards Left: {cards.length} | Bet:
	<input
		type="number"
		bind:value={bet}
		class="m-auto w-[20%] rounded-[5px] border-2 border-solid border-(--black) bg-(--white) p-[1%] text-center text-[1.5rem] dark:border-(--white) dark:bg-(--black)"
	/>
</div>
<div class="m-auto flex h-fit w-[50%] justify-between p-[2%] text-center">
	<button
		class="w-[20%] rounded-[5px] border-2 border-solid border-green-500 bg-green-500 p-[2%] text-[1.5rem] text-(--black) transition duration-500 hover:bg-(--white) hover:text-green-500 dark:hover:bg-(--black)"
		onclick={hit}>Hit</button
	>
	<button
		onclick={start}
		class="w-[30%] rounded-[5px] border-2 border-solid border-yellow-500 bg-yellow-500 p-[2%] text-[1.5rem] text-(--black) transition duration-500 hover:bg-(--white) hover:text-yellow-500 dark:hover:bg-(--black)"
		>New Game</button
	>
	<button
		class="w-[20%] rounded-[5px] border-2 border-solid border-red-500 bg-red-500 p-[2%] text-[1.5rem] text-(--black) transition duration-500 hover:bg-(--white) hover:text-red-500 dark:hover:bg-(--black)"
		onclick={stand}>Stand</button
	>
</div>

<style>
	#play-area > p {
		font-size: 1.5rem;
	}
</style>
