<script>
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { myRedirect, urlOrigin, backendUrl } from "$lib/index";

  let user = "";
  let password = "";
  let msg = "";
  let color = "#ee2c2c";

  let searchParams = $page.url.searchParams;
  if (searchParams.has("msg")) {
    msg = searchParams.get("msg") ?? msg;
  }
  if (searchParams.has("color")) {
    color = searchParams.get("color") ?? color;
  }
  if (searchParams.has("user") && searchParams.has("pass")) {
    user = searchParams.get("user") ?? user;
    password = searchParams.get("pass") ?? password;
    login();
  }
  onMount(() => {
    const msgElem = document.getElementById("msg");
    if (msgElem) msgElem.style.color = color;
  });

  async function login() {
    msg = "Loading...";
    let mybody = JSON.stringify({
      username: user,
      password: password,
      ip: await fetch("https://api.ipify.org").then(res => res.text())
    });
    let myHeaders = {
      "Content-Type": "application/json",
    };
    const response = await fetch(backendUrl + "/auth", {
      method: "POST",
      body: mybody,
      headers: myHeaders,
    });
    const data = await response.json();
    if (!response.ok) {
      const msgElm = document.getElementById("msg");
      if (msgElm) msgElm.style.color = "#ee2c2c"
      msg = "Error! Please yell at me to fix"
    }
    if (data["correct"]) {
      localStorage.setItem("sessionID", data["sessionID"]);
      console.log(response.status);
      if (response.status == 209) myRedirect("/admin");
      myRedirect("/home");
    } else {
      const msgElm = document.getElementById("msg");
      if (msgElm) msgElm.style.color = "#ee2c2c";
      msg = data["message"];
    }
  }
</script>

<title>Login</title>

<div
  id="bigdiv"
  class="m-auto mt-[10%] bg-[#bbb] dark:bg-[#3c3c3c] shadow-[0_0_50px_15px_#34adfe] rounded-[10%] size-fit p-[5%] text-center flex flex-col gap-5"
>
  <h1 class="text-[3rem] m-0">Login</h1>
  <p class="text-[1.5rem]" id="msg">{msg}</p>
  <input type="text" bind:value={user} placeholder="Username" />
  <input type="password" bind:value={password} placeholder="Password" />
  <button
    id="submit"
    on:click={login}
    class="text-[1.5rem] bg-[#ccc] dark:bg-[#4c4c4c] hover:shadow-[0_0_10px_5px_#34adfe] border-solid border-2 border-(--white) rounded-[5px] dark:text-(--white) text-(--black) m-auto p-[3%]"
    >Login</button
  >
  <a href="{urlOrigin}/new" class="text-[1.5rem]">Or Create a new Account</a>
</div>

<h1 class="text-center mt-[5%] text-[1.5rem]">
  Welcome to my site! <br />Please create an account of your're new.
</h1>

<style>
  input {
    background-color: #4c4c4c;
    color: white;
    border: 2px solid white;
    border-radius: 5px;
    padding: 2%;
    margin: auto;
  }
  input:hover {
    box-shadow: 0 0 10px 5px #34adfe;
  }
</style>
