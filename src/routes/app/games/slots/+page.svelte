<script lang="ts">
	import { onMount } from 'svelte';
	import { Confetti } from 'svelte-confetti';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();

	const sessionID = data.sessionID;

	var bal = $state(data.bal);
	var msg = $state('');
	var color = $state('#fff');

	var autoBet = $state(false);
	var autoBetPercentage = $state(20);
	var bet = $state(20);

	const winMulti = 2;
	const jackpotMulti = 5;
	var megaJackpotMulti = $state(10);
	var confettiAmount = $state(700);

	var win = $state(false);
	var jackpot = $state(false);

	var one = $state(7);
	var two = $state(7);
	var three = $state(7);

	var slowing = false;
	var playing = false;

	const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

	async function spin(): Promise<void> {
		let spinDelay = 0;
		let diff = 5;
		let count = 0;
		const nums = Array.from({ length: 3 }, () => Math.floor(Math.random() * 9 + 1));
		[one, two, three] = nums;
		while (true) {
			await sleep(spinDelay);
			if (slowing) {
				count++;
				spinDelay += diff;
				diff += 0.5;
			}
			one += one == 9 ? -9 : 1;
			two += two == 9 ? -9 : 1;
			three += three == 9 ? -9 : 1;
			console.log(spinDelay);
			if (spinDelay >= 200) break;
		}
	}

	async function start() {
		if (autoBet) bet = Math.round(bal * (autoBetPercentage / 100));
		if (playing) return;
		if (bet < 5) {
			msg = 'You must bet at least $5!';
			color = '#ee2c2c';
			bet = 5;
			return;
		} else if (bal < bet) {
			msg = "You don't have enough money - Lower your bet to play";
			color = '#ee2c2c';
			bet = bal;
		}
		playing = true;
		win = false;
		jackpot = false;
		msg = '';
		let spinPromise = spin();
		const res = await fetch('/api/games/slots', {
			method: 'POST',
			body: JSON.stringify({
				sessionID,
				bet,
				megaJackpotMulti
			})
		});
		const data = await res.json();
		slowing = true;
		await spinPromise;
		({ one, two, three } = data);
		bal = data.bal;
		if (data.won) {
			color = '#50C878';
			msg = `You won $${data.diff}`;
			if (data.jackpot) jackpot = true;
			else win = true;
		} else {
			color = '#ee2c2c';
			msg = `You lost $${data.diff}`;
		}
		playing = false;
		if (autoBet) bet = Math.round(bal * (autoBetPercentage / 100));
	}

	onMount(() => {
		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
			megaJackpotMulti = 100;
			confettiAmount *= 2;
		}
	});
</script>

<title>Slots</title>

{#if jackpot}
	<div
		style="
 position: fixed;
 top: -50px;
 left: 0;
 height: 100vh;
 width: 100vw;
 display: flex;
 justify-content: center;
 overflow: hidden;
 pointer-events: none;"
	>
		<Confetti
			x={[-5, 5]}
			y={[0, 0.1]}
			delay={[0, 3000]}
			duration={2500}
			amount={confettiAmount}
			size={25}
			fallDistance="100vh"
		/>
	</div>
{/if}

<div id="title" class="m-auto text-center">
	<h1 class="mb-0 text-[4rem]">Slot Machine</h1>
</div>

<div class="m-auto flex h-fit w-[50%] flex-row justify-between">
	{#if win}
		<Confetti
			cone
			x={[-1, -2.5]}
			y={[0.25, 0.75]}
			amount={100}
			size={20}
			delay={[0, 1500]}
			fallDistance="100px"
		/>
	{/if}
	<div
		id="machine"
		class="m-auto flex h-fit w-full flex-row justify-between rounded-[15px] bg-(--light-grey) p-[2%] dark:bg-(--grey)"
	>
		<div class="box">{one}</div>
		<div class="box">{two}</div>
		<div class="box">{three}</div>
	</div>
	{#if win}
		<Confetti
			cone
			x={[1, 2.5]}
			y={[0.25, 0.75]}
			amount={100}
			size={20}
			delay={[0, 1500]}
			fallDistance="100px"
		/>
	{/if}
</div>
<h1 id="message" class="m-auto h-12 text-center text-[2rem]" style="color: {color}">{msg}</h1>
<div id="spindiv" class="m-auto flex h-fit w-[50%] flex-col text-center">
	<button
		onclick={start}
		aria-label="Spin Button"
		class="m-auto size-28 rounded-full border-0 bg-red-500 transition duration-500 hover:bg-green-500"
	></button>
	<span>
		<label for="autoBet" class="m-2 text-[2rem]">Enable Auto Bet</label>
		<input
			type="checkbox"
			bind:checked={autoBet}
			name="autoBet"
			class="size-8 border-2 border-solid border-(--black) bg-(--white) align-middle dark:border-(--white) dark:bg-(--black)"
		/>
	</span>

	{#if !autoBet}
		<span class="m-auto flex w-[50%] flex-row justify-center text-center"
			><p class="m-2 text-[2rem]">Bet:</p>
			<input
				type="number"
				bind:value={bet}
				class="h-fit w-[50%] rounded-[10px] border-2 border-solid border-(--black) bg-(--white) p-[1%] text-center text-[1.5rem] dark:border-(--white) dark:bg-(--black)"
			/>
		</span>
	{:else}
		<span class="m-auto flex w-[80%] flex-row justify-center text-center"
			><p class="m-2 text-[1.7rem]">% of balance to bet:</p>
			<input
				type="number"
				bind:value={autoBetPercentage}
				class="h-fit w-[25%] rounded-[10px] border-2 border-solid border-(--black) bg-(--white) p-[1%] text-center text-[1.5rem] dark:border-(--white) dark:bg-(--black)"
			/>
		</span>
		<p class="m-2 text-[2rem]">Bet: {bet}</p>
	{/if}
</div>

<h1 id="balance" class="m-auto text-center text-[3rem]">
	Balance = ${bal}
</h1>

<div
	class="m-auto size-fit rounded-[15px] bg-(--light-grey) p-[2%] text-center text-[1.5rem] dark:bg-(--grey)"
>
	Prize Pool <br />
	No Matches: -Spin Price <br />
	2 of a kind: +Spin Price x {winMulti} <br />
	3 of a kind: +Spin Price x {jackpotMulti} <br />
	3 Sevens: +Spin Price x {megaJackpotMulti}
</div>

<style>
	.box {
		padding: 2%;
		border-radius: 15px;
		padding-left: 5%;
		padding-right: 5%;
		font-size: 6rem;
	}
	@media (prefers-color-scheme: dark) {
		.box {
			background-color: var(--black);
		}
	}
	@media (prefers-color-scheme: light) {
		.box {
			background-color: var(--white);
		}
	}
</style>
