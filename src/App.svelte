<script>
  import BotPanel from "./components/BotPanel.svelte";
  import DollarPanel from "./components/DollarPanel.svelte";

  import SymbolList from "./components/SymbolList.svelte";
  import {
    reloadRatesFromServer,
    reloadStateFromServer,
    sendStateToServer,
    startUpdatingAppState,
    stopUpdatingAppState,
  } from "./stores";

  import { onMount } from "svelte";


  let update_interval_ms = 60000;

  onMount(async () => {
    console.log("Loaded!");
      startUpdatingAppState();

    const interval = setInterval(reloadRatesFromServer, update_interval_ms);
    await reloadStateFromServer();
    return () => {
      stopUpdatingAppState();
      clearInterval(interval);
    };
  });
</script>

<main class="container">
  <div style="display: flex; justify-content:space-between;">
    <p>Exchange Admin Panel</p>
    <div style="display: flex;">
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
</style>
