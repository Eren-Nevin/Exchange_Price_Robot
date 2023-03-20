<script>
  import BotPanel from "./components/BotPanel.svelte";
  import DollarPanel from "./components/DollarPanel.svelte";

  import SymbolList from "./components/SymbolList.svelte";
  import {
    reloadStateFromServer,
    sendStateToServer,
    startUpdatingAppState,
  } from "./stores";

  import { onMount } from "svelte";

  startUpdatingAppState();

  onMount(async () => {
    console.log("Loaded!");
    await reloadStateFromServer();
  });

</script>

<main class="container">
  <div style="display: flex; justify-content:space-between;">
      <p> Exchange Admin Panel</p>
    <button
      on:click={async () => {
        await sendStateToServer();
      }}
    >
      Save
    </button>
  </div>
  <BotPanel />
  <DollarPanel />
  <SymbolList />
</main>

<style>
    p {
        font-size: 24px;
    }
  button {
    /* color: #fff; */
    border: 0;
    border-radius: 8px;
    /* color: #fff; */
    height: 48px;
    width: 120px;
    cursor: pointer;
    background-color: #69f0ae;
  }

  button:hover {
    transform: scale(0.98);
    opacity: 0.9;
  }

  button:disabled {
    background-color: #cccccc;
    color: #333;
    cursor: auto;
  }

  button:disabled:hover {
    transform: scale(1);
    opacity: 1;
  }
</style>
