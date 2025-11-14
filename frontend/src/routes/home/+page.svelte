<script lang="ts">
  import { onMount } from "svelte";
  import { myRedirect, urlOrigin, backendUrl } from "$lib/index";
  let user = "person";
  let balance = 0;
  let collectBTN = "Collect $1000";
  let msg = "";
  type LeaderboardItem = {
    username: string;
    balance: number;
  };
  let leaderboard: LeaderboardItem[] = [];
  var dark = false;

  async function getData() {
    let sessionID = "";
    const storedSessionID = localStorage.getItem("sessionID");
    if (storedSessionID !== null) sessionID = storedSessionID;
    let response = await fetch(backendUrl + "/user", {
      headers: { sessionID: sessionID },
    });
    if (response.status == 403 || response.status == 401) {
      let msg = await response.json();
      // window.location.href = `/?msg=${msg.message}`;
      myRedirect(`/?msg=${msg.message}`);
    }
    if (!response.ok) console.log(await response.text());
    let data = await response.json();
    user = data["username"];
    balance = data["balance"];

    response = await fetch(backendUrl + "/baltop", {
      headers: { sessionID: sessionID },
    });
    if (response.status == 403 || response.status == 401) {
      let msg = await response.json();
      // window.location.href = `/?msg=${msg.message}`;
      myRedirect(`/?msg=${msg.message}`);
    }
    if (!response.ok) console.log(await response.text());
    data = await response.json();
    leaderboard = data;

    console.log("requesting data")
    const collectResponse = await fetch(backendUrl+"/collecttime", {
      headers: { sessionID: sessionID},
    })
    const collectData = await collectResponse.json()
    if (!collectResponse.ok) console.log(collectData)
    console.log("printing data")
    console.log(collectData)
    if (collectResponse.status == 403 || collectResponse.status == 401) {
      myRedirect(`/?msg=${collectData.message}`);
    }
    else {
      if (collectData.cooldown == 0) {
        cooldown = 0
        collectBTN = "Collect $1000"
      }
      else {
        cooldown = collectData.cooldown;
        collectBTN = `Cooldown: ${msToHMS(collectData.cooldown)}`;
      }
    }
  }

  async function updateData() {
    let sessionID = "";
    const storedSessionID = localStorage.getItem("sessionID");
    if (storedSessionID !== null) sessionID = storedSessionID;
    const myBody = JSON.stringify({
      balance: balance,
      collect: true,
      method: "collect",
    });
    const myHeaders = {
      "Content-Type": "application/json",
      sessionID: sessionID,
    };
    const response = await fetch(backendUrl + "/updateuser", {
      method: "POST",
      body: myBody,
      headers: myHeaders,
    });
    if (response.status == 403 || response.status == 401) {
      let msg = await response.json();
      // window.location.href = `/?msg=${msg.message}`;
      myRedirect(`/?msg=${msg.message}`);
    }
    const result = await response.json();
    if (response.status == 403 || response.status == 401)
      // window.location.href = `/?msg=${result.message}`;
      myRedirect(`/?msg=${result.message}`);
    console.log(result.message);
  }

  function logout() {
    localStorage.removeItem("sessionID");
    // window.location.href = "/";
    myRedirect("/");
  }

  function msToHMS(ms: number) {
    let seconds: number = ms / 1000;
    // const hours: number = seconds / 3600;
    // seconds = seconds % 3600;
    const minutes: number = seconds / 60;
    seconds = seconds % 60;
    // return Math.round(hours) + ":" + Math.round(minutes) + ":" + Math.round(seconds);
    return `${Math.round(minutes)}m & ${Math.round(seconds)}s`;
  }

  var cooldown = 0;

  async function collect() {
    let sessionID = "";
    const storedSessionID = localStorage.getItem("sessionID");
    if (storedSessionID !== null) sessionID = storedSessionID;
    let response = await fetch(backendUrl + "/collect", {
      headers: { sessionID: sessionID },
    });
    const data = await response.json();
    const msgElem = document.getElementById("msg");
    console.log(response)
    if (response.ok) {
      balance += 1000;
      updateData();
      msg = data.message;
      if (msgElem) msgElem.style.color = "green";
      cooldown = data.cooldown;
      collectBTN = `Cooldown: ${msToHMS(data.cooldown)}`;
    } else {
      if (response.status == 403 || response.status == 401)
        // window.location.href = `/?msg=${data.message}`;
        myRedirect(`/?msg=${data.message}`);
      msg = data.message;
      if (msgElem) msgElem.style.color = "#ee2c2c";
      cooldown = data.cooldown;
      collectBTN = `Cooldown: ${msToHMS(data.cooldown)}`;
    }
  }

  function counter() {
    if (cooldown > 0) {
      cooldown -= 1000;
      collectBTN = `Cooldown: ${msToHMS(cooldown)}`;
    } else {
      if (!dark)
        msg = "Consider enabling dark mode for a better viewing experience!";
      else msg = "";
      collectBTN = "Collect $1000";
    }
  }

  setInterval(() => {
    counter();
  }, 1000);

  onMount(() => {
    console.log("getting data")
    getData();
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      dark = true;
      msg = "";
    } else msg = "Consider enabling dark mode for a better viewing experience!";
  });
</script>

<h1 class="pt-[2%] m-auto text-center text-[3rem]">
  Welcome <strong>{user}</strong>, you currently have
  <strong>${balance}</strong>
</h1>
<title>Home</title>
<div
  id="links"
  class="bg-[#bbbbbb] dark:bg-[#3c3c3c] m-auto size-fit p-[2%] rounded-[15px] flex flex-col text-center text-[1.5rem]"
>
  <a href="{urlOrigin}/games/slots">Slot Machine</a>
  <a href="{urlOrigin}/games/blackjack">Blackjack</a>
  <!-- <a href="/games/trivia">Trivia</a> -->
  <!-- <a href="/">4</a> -->
  <button
    type="button"
    class="text-(--red) bg-transparent border-none cursor-pointer hover:underline hover:decoration-wavy hover:decoration-(--blue)"
    on:click={logout}>Logout</button
  >
</div>

<p class="m-auto mt-[3%] size-fit text-center text-[1.5rem]" id="msg">{msg}</p>
<button
  class="bg-[#bbbbbb] border-[2px solid #bbbbbb] dark:bg-[#4c4c4c] border-2 border-solid dark:border-[#4c4c4c] border-[#bbbbbb] transition duration-500 hover:bg-[#fbfbfb] dark:hover:bg-[#1c1c1c] m-auto size-fit p-[2%] rounded-[15px] flex flex-col text-center text-[1.5rem]"
  on:click={collect}
>
  {collectBTN}
</button>

<div
  class="m-auto mt-[5%] size-fit p-[2%]] flex flex-col text-center text-[1.5rem]"
>
  <p class="text-[2rem]">Leaderboard</p>
  {#each leaderboard as item, i}
    <p>{i + 1}) {item["username"]} = ${item["balance"]}</p>
  {/each}
</div>

{#if user === "admin"}
  <div class="flex flex-col">
    <button
      on:click={() => myRedirect("/admin")}
      class="text-[2rem] bg-[#bbb] dark:bg-[#4c4c4c] rounded-[15px] m-auto mt-[5%] w-[25%] border-"
      >Admin Dashboard</button
    >
  </div>
{/if}
