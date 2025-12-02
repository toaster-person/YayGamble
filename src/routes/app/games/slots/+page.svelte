<script lang="ts">
	import { onMount } from 'svelte';
	import { Confetti } from 'svelte-confetti';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();

	const sessionID = data.sessionID;

	let bal = $state(data.bal);
	let msg = $state('');
	let color = $state('#fff');
	let bet = $state(20);

	const winMulti = 2;
	const jackpotMulti = 5;
	let megaJackpotMulti = $state(10);
	let confettiAmount = $state(700);

	if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
		megaJackpotMulti = 100;
		confettiAmount *= 2;
	}

	let win = $state(false);
	let jackpot = $state(false);

	let one = $state(7);
	let two = $state(7);
	let three = $state(7);

	let spinning = false;
	let slowing = false;
	let spinDelay = 0;
	let playing = false;

	const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

	async function spin() {
		while (spinning) {
			await sleep(spinDelay);
			if (slowing) spinDelay += 5;
			const nums = Array.from({ length: 3 }, () => Math.floor(Math.random() * 10 + 1));
			[one, two, three] = nums;
			if (spinDelay >= 200) spinning = false;
		}
	}

	async function start() {
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
		msg = '';
		spinDelay = 0;
		spin();
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
		if (data.won) {
			color = '#50C878';
			msg = `You won $${data.diff}`;
		} else {
			color = '#ee2c2c';
			msg = `You lost $${data.diff}`;
		}
	}
</script>

-- Active: 1764277958546@@100.64.0.231@3306@gamble
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
<h1 id="message" class="m-auto h-12 text-center text-[2rem] text-[{color}]">{msg}</h1>
<div id="spindiv" class="m-auto flex h-fit w-[50%] flex-col text-center">
	<button
		onclick={start}
		aria-label="Spin Button"
		class="m-auto size-28 rounded-full border-0 bg-red-500 transition duration-500 hover:bg-green-500"
	></button>
	<span class="m-auto flex w-[50%] flex-row justify-center text-center"
		><p class="m-2 text-[2rem]">Spin Price:</p>
		<input
			type="number"
			bind:value={bet}
			class="h-fit w-[25%] rounded-[10px] border-2 border-solid border-(--black) bg-(--white) p-[1%] text-center text-[1.5rem] dark:border-(--white) dark:bg-(--black)"
		/>
	</span>
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
