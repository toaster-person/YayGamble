<script>
	import { goto } from '$app/navigation';
	let { children } = $props();
</script>

<nav
	class="m-auto flex w-[75%] flex-row justify-between rounded-2xl bg-(--light-grey) p-4 text-[1.5rem] dark:bg-(--grey)"
>
	<span class="flex w-[40%] flex-row justify-between">
		<a href="/home"> Home </a>
		<a href="/games/blackjack">Blackjack</a>
		<a href="/games/slots">Slots</a>
	</span>
	<div class="w-[50%]"></div>
	<button
		type="button"
		class="w-[10%] cursor-pointer border-none bg-transparent text-(--red) hover:underline hover:decoration-(--red) hover:decoration-wavy"
		onclick={() => goto('/logout')}>Logout</button
	>
</nav>

{@render children()}

<style>
	a:hover {
		color: var(-white);
	}
</style>
