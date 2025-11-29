<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import { page } from '$app/state';
	let { data }: PageProps = $props();
	let id = $state(data.id);
	let usr = $state(data.usr);
	let isAdmin = $state(data.isAdmin);
	let bal = $state(data.balance);
	let leaderboard = $state(data.leaderboard);
	let allowCollect = $state(data.allowCollect);
	let cooldown = $derived(allowCollect - Date.now());
	let collectBTN = $derived(calcCooldown(cooldown) ?? 'Collect $1000');
	let msg = $state('');
	let color = $state('#fff');
	var dark = $state(false);

	async function collect() {
		if (cooldown > 0) {
			color = '#ee2c2c';
			msg = 'Still on cooldown!';
		}
		const res = await fetch('/api/collect', {
			method: 'POST',
			body: JSON.stringify({ id })
		});
		const data = await res.json();
		if (data.success) {
			color = '#50C878';
			msg = 'Successfully collected $1000';
			bal += 1000;
			let index = leaderboard.findIndex((item) => item.username === usr);
			leaderboard[index] = { username: usr, balance: bal };
			leaderboard.sort((a, b) => {
				return a.balance - b.balance;
			});
		} else {
			color = '#ee2c2c';
			msg = data.msg ?? page.error?.message ?? 'Internal Server Error';
		}
	}

	function calcCooldown(ms: number) {
		if (ms <= 0) return null;
		const totalSeconds = Math.floor(ms / 1000);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;

		const hh = String(hours).padStart(2, '0');
		const mm = String(minutes).padStart(2, '0');
		const ss = String(seconds).padStart(2, '0');

		return `Cooldown: ${hh}:${mm}:${ss}`;
	}

	onMount(() => {
		if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) dark = true;
	});
</script>

<h1 class="m-auto pt-[2%] text-center text-[3rem]">
	Welcome <strong>{usr}</strong>, you currently have
	<strong>${bal}</strong>
</h1>
<title>Home</title>
<div
	id="links"
	class="m-auto flex size-fit flex-col rounded-[15px] bg-[#bbbbbb] p-[2%] text-center text-[1.5rem] dark:bg-[#3c3c3c]"
>
	<a href="/app/games/slots">Slot Machine</a>
	<a href="/app/games/blackjack">Blackjack</a>
	<button
		type="button"
		class="cursor-pointer border-none bg-transparent text-(--red) hover:underline hover:decoration-(--blue) hover:decoration-wavy"
		onclick={() => {
			goto('/logout');
		}}>Logout</button
	>
</div>

<p class="m-auto mt-[3%] size-fit text-center text-[1.5rem] text-[#{color}]" id="msg">{msg}</p>
<button
	class="border-[2px solid #bbbbbb] m-auto flex size-fit flex-col rounded-[15px] border-2 border-solid border-[#bbbbbb] bg-[#bbbbbb] p-[2%] text-center text-[1.5rem] transition duration-500 hover:bg-[#fbfbfb] dark:border-[#4c4c4c] dark:bg-[#4c4c4c] dark:hover:bg-[#1c1c1c]"
	onclick={collect}
>
	{collectBTN}
</button>

<div class="p-[2%]] m-auto mt-[5%] flex size-fit flex-col text-center text-[1.5rem]">
	<p class="text-[2rem]">Leaderboard</p>
	{#each leaderboard as item, i}
		<p>{i + 1}) {item['username']} = ${item['balance']}</p>
	{/each}
</div>

{#if !dark}
	<p class="m-auto mt-[3%] size-fit text-center text-[1.5rem]" id="msg">
		Consider enabling dark mode for a better experience!
	</p>
{/if}

{#if isAdmin}
	<div class="flex flex-col">
		<button
			onclick={() => {
				goto('/app/admin');
			}}
			class="border- m-auto mt-[5%] w-[25%] rounded-[15px] bg-[#bbb] text-[2rem] dark:bg-[#4c4c4c]"
			>Admin Dashboard</button
		>
	</div>
{/if}
