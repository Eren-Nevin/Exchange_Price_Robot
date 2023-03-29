<script>
  import BotPanel from "./components/BotPanel.svelte";
  import DollarPanel from "./components/DollarPanel.svelte";

  import SymbolList from "./components/SymbolList.svelte";
  import {
    downloadStateFileFromServer,
    reloadRatesFromServer,
    reloadStateFromServer,
    startUpdatingAppState,
    uploadStateFileToServer,
  } from "./stores";

  import { onMount } from "svelte";

  /* function sleep(ms) { */
  /*   return new Promise((resolve) => setTimeout(resolve, ms)); */
  /* } */

  startUpdatingAppState();

  let update_interval_ms = 5000;

  onMount(async () => {
    console.log("Loaded!");

    const interval = setInterval(reloadRatesFromServer, update_interval_ms);
    await reloadStateFromServer();
    return () => {
      clearInterval(interval);
    };
  });
</script>

<main class="container">
  <div style="display: flex; justify-content:space-between;">
    <p>Exchange Admin Panel</p>
    <div style="display: flex;">
      <div style="flex: 1; display: flex; flex-direction: column;">
        <button
          on:click={async () => {
            /* await refereshState(); */
            await uploadStateFileToServer();
          }}
        >
          Load
        </button>
        <input type="file" />
      </div>
      <button style="flex: 1;"
        on:click={async () => {
          /* await refereshState(); */
          await downloadStateFileFromServer();
        }}
      >
        Save
      </button>
    </div>
  </div>
  <SymbolList />
  <DollarPanel />
  <BotPanel />
</main>

<style>
  p {
    font-size: 24px;
  }
  button {
    /* color: #fff; */
    margin: 0px 8px;
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
