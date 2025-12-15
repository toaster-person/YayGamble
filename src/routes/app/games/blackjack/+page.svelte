<script lang="ts">
	import type { BlackJackGame } from '$lib/blackjack';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();

	let bal = $state(data.bal);
	let msg = $state('');
	let color = $state('#ee2c2c');
	let playing = $state(false);

	let bet = $state(100);
	let autoBet = $state(false);
	let autoBetPercentage = $state(20);
	let lockedBet = 100;

	let game: BlackJackGame;

	let dealer = $state('Start a new game!');
	let player = $state('Start a new game!');
	let dealerValue = $state(0);
	let playerValue = $state(0);

	let cards: string[] = $state([]);
	let dealerCards: string[] = $state([]);
	let playerCards: string[] = $state([]);

	async function start() {
		if (playing) {
			showMessage('You are currently playing a game!', '#FFAC1C');
			return;
		}
		if (bal < bet) {
			showMessage("You don't have enough money! Lower your bet to play.", '#ee2c2c');
			return;
		}
		if (bet < 100) {
			showMessage('You must bet at least $100!', '#ee2c2c');
			bet = 100;
			return;
		}

		if (autoBet) bet = Math.round(bal * (autoBetPercentage / 100));

		resetBoardForNewGame();
		lockedBet = bet;

		const res = await fetch('/api/games/blackjack', {
			method: 'POST',
			body: JSON.stringify({
				sessionID: data.sessionID,
				bet: lockedBet,
				cards
			})
		});

		update(res);
	}

	function resetBoardForNewGame() {
		dealer = 'Loading...';
		player = 'Loading...';
		dealerValue = 0;
		playerValue = 0;
		msg = '';
		playing = true;
	}

	function showMessage(text: string, c: string) {
		msg = text;
		color = c;
	}

	async function update(res: Response) {
		const data = await res.json();
		game = data.game;

		({ cards, playerCards, playerValue, dealerCards, dealerValue } = game);

		player = playerCards.join(' ');
		dealer = dealerCards.join(' ');

		if (data.finished) {
			const status = data.win;
			color = status.push ? '#FFAC1C' : status.won ? '#50C878' : '#ee2c2c';

			msg = status.push ? status.msg : `You ${status.won ? 'win' : 'lose'} - ${status.msg}`;
			bal = status.bal;
			playing = false;

			if (autoBet) bet = Math.round(bal * (autoBetPercentage / 100));
		}
	}

	async function hit() {
		if (!playing) {
			showMessage('You need to start a new game first!', '#ee2c2c');
			return;
		}
		update(await fetch('/api/games/blackjack/hit', { method: 'POST', body: JSON.stringify(game) }));
	}

	async function stand() {
		if (!playing) {
			showMessage('You need to start a new game first!', '#ee2c2c');
			return;
		}
		update(
			await fetch('/api/games/blackjack/stand', { method: 'POST', body: JSON.stringify(game) })
		);
	}
</script>

<title>Blackjack</title>

<div class="mt-2 flex flex-col items-center">
	<h1 class="mb-2 text-[3.5rem] font-bold tracking-wide">Blackjack</h1>

	<div
		class="mb-4 flex w-full max-w-[700px] flex-col items-center rounded-xl bg-(--light-grey) p-4 dark:bg-(--grey)"
	>
		<div class="mb-1 text-[2.2rem] font-semibold">
			Balance: <span class="text-green-500">${bal}</span>
		</div>
		<div class="text-[1.8rem] font-medium" style="color: {color}">
			{msg}
		</div>
	</div>
</div>

<div
	class="m-auto grid w-full max-w-[900px] grid-cols-2 gap-6 rounded-2xl bg-linear-to-b from-green-700 to-green-900 p-5 text-white shadow-2xl"
>
	<div class="flex flex-col items-center">
		<h2 class="mb-4 text-[2.5rem] font-semibold">Player</h2>

		<div
			class="flex min-h-[120px] w-full flex-wrap justify-center gap-3 rounded-xl border border-white/20 bg-black/20 p-4"
		>
			{#each playerCards as card}
				<div class="rounded-lg bg-white px-3 py-2 text-[1.4rem] font-semibold text-black shadow-xl">
					{card}
				</div>
			{/each}
			{#if playerCards.length === 0}
				<div class="text-[1.2rem] opacity-60">No cards</div>
			{/if}
		</div>

		<div class="mt-3 text-[2rem] font-bold">{playerValue}</div>
	</div>

	<div class="flex flex-col items-center">
		<h2 class="mb-4 text-[2.5rem] font-semibold">Dealer</h2>

		<div
			class="flex min-h-[120px] w-full flex-wrap justify-center gap-3 rounded-xl border border-white/20 bg-black/20 p-4"
		>
			{#each dealerCards as card}
				<div class="rounded-lg bg-white px-3 py-2 text-[1.4rem] font-semibold text-black shadow-xl">
					{card}
				</div>
			{/each}
			{#if dealerCards.length === 0}
				<div class="text-[1.2rem] opacity-60">No cards</div>
			{/if}
		</div>

		<div class="mt-3 text-[2rem] font-bold">{dealerValue}</div>
	</div>
</div>

<div class="mt-2 flex items-center justify-center">
	<label for="autoBet" class="mr-3 text-[1.8rem] font-medium">Auto Bet</label>
	<input id="autoBet" type="checkbox" bind:checked={autoBet} class="h-7 w-7" />
</div>

<div
	class="m-auto mt-2 w-full max-w-[700px] rounded-xl bg-(--light-grey) p-4 text-center shadow-lg dark:bg-(--grey)"
>
	<div class="mb-2 text-[1.6rem]">
		Cards Until Shuffle: <strong>{cards.length}</strong>
	</div>

	{#if !autoBet}
		<div class="text-[1.6rem]">
			Bet:
			<input
				type="number"
				bind:value={bet}
				class="ml-2 w-[25%] rounded-lg border-2 bg-(--white) p-2 text-center dark:bg-(--black)"
			/>
		</div>
	{:else}
		<div class="text-[1.6rem]">
			% of Balance to Bet:
			<input
				type="number"
				bind:value={autoBetPercentage}
				class="ml-2 w-[25%] rounded-lg border-2 bg-(--white) p-2 text-center dark:bg-(--black)"
			/>
		</div>

		<div class="mt-2 text-[1.6rem] font-semibold">
			Bet = {bet}
		</div>
	{/if}
</div>

<div class="m-auto mt-6 flex w-full max-w-[700px] justify-center gap-6 text-[#1c1c1c]">
	{#if playing}
		<button
			onclick={hit}
			class="max-w-[180px] flex-1 rounded-xl border-2 border-green-500 bg-green-500 py-3 text-[1.6rem] font-semibold transition hover:bg-transparent hover:text-green-500 dark:hover:bg-(--black)"
		>
			Hit
		</button>
	{:else}
		<button
			onclick={hit}
			class="max-w-[180px] flex-1 rounded-xl bg-[#2c2c2c] py-3 text-[1.6rem] font-semibold text-white"
		>
			Hit
		</button>
	{/if}
	{#if !playing}
		<button
			onclick={start}
			class="max-w-[200px] flex-1 rounded-xl border-2 border-yellow-500 bg-yellow-500 py-3 text-[1.6rem] font-semibold transition hover:bg-transparent hover:text-yellow-500 dark:hover:bg-(--black)"
		>
			New Game
		</button>
	{:else}
		<button
			onclick={start}
			class="max-w-[180px] flex-1 rounded-xl bg-[#2c2c2c] py-3 text-[1.6rem] font-semibold text-white"
		>
			New Game
		</button>
	{/if}
	{#if playing}
		<button
			onclick={stand}
			class="max-w-[180px] flex-1 rounded-xl border-2 border-red-500 bg-red-500 py-3 text-[1.6rem] font-semibold transition hover:bg-transparent hover:text-red-500 dark:hover:bg-(--black)"
		>
			Stand
		</button>
	{:else}
		<button
			onclick={stand}
			class="max-w-[180px] flex-1 rounded-xl bg-[#2c2c2c] py-3 text-[1.6rem] font-semibold text-white"
		>
			Stand
		</button>
	{/if}
</div>
