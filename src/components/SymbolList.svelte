<script>
  // TODO: Rename file
  import { CurrencyStore, DollarStore } from "../stores";
  import { fade, scale } from "svelte/transition";
  import Card from "./Card.svelte";
  import Button from "./Button.svelte";

  $: selectedCurrency = "";

  const handleInput = (symbol) => {
    console.log(symbol);
  };
  const handleCurrencyRateChange = (currencyRateElement) => {
    console.log(currencyRateElement);
  };

  const handleAddCurrency = (selectedCurrencyName) => {
    if (selectedCurrencyName.length > 0) {
      console.log(`Adding ${selectedCurrencyName}`);
      CurrencyStore.update((currentState) => {
        let newState = currentState;

        newState.selected_currencies = [
          selectedCurrencyName,
          ...newState.selected_currencies,
        ];

        newState.selected_currencies.sort()

        return newState;
      });

      selectedCurrency = "";
    }
  };

  const handleResetCurrencies = () => {
    console.log("FFF");
    CurrencyStore.update((currentState) => {
      let newState = currentState;

      newState.selected_currencies = [];

      return newState;
    });
  };

  const updateSelectedCurrencies = (currency_model) => {
    let selectedCurrencies = [];
    for (let selectedCurrency of currency_model.selected_currencies) {
      selectedCurrencies.push(
        currency_model.currency_rates.filter((v) => v.name ===
            selectedCurrency)[0]
      );
    }
    return selectedCurrencies;
  };

  $: selectedCurrencies = [];

  CurrencyStore.subscribe((value) => {
    selectedCurrencies = updateSelectedCurrencies(value);
    console.log(value.selected_currencies);
  });
</script>

<Card>
  <div style="display: flex; margin-bottom: 16px;">
      <p style="margin-right: 16px;">Currency</p>
    <select
      disabled={$CurrencyStore.selected_currencies.length ===
        $CurrencyStore.currency_rates.length}
      class="add-remove-currency select-currency"
      bind:value={selectedCurrency}
      name="select-currency"
      id="select-currency"
    >
      {#each $CurrencyStore.currency_rates as currencyRate, i (currencyRate.uid)}
        {#if !$CurrencyStore.selected_currencies.includes(currencyRate.name)}
          <option value={currencyRate.name}>{currencyRate.name}</option>
        {/if}
      {/each}
    </select>
    <button
      disabled={selectedCurrency.length === 0}
      on:click={handleAddCurrency(selectedCurrency)}>Add</button
    >
    <button
      on:click={() => {
        handleResetCurrencies();
      }}>Reset</button
    >
  </div>
  <div
    style="display: grid; 
        grid-template-columns: repeat(5, auto);
        max-width: 480px;
        "
  >
    <div class="table-cell heading-title">Row</div>
    <div class="table-cell heading-title">Manual</div>
    <div class="table-cell heading-title">Currency</div>
    <div class="table-cell heading-title">Rate</div>
    <div class="table-cell heading-title">Adjust</div>
    {#each $CurrencyStore.currency_rates as currencyRate, i (currencyRate.uid)}
      {#if $CurrencyStore.selected_currencies.includes(currencyRate.name)}
        <div class="table-cell">
          <p>
              {selectedCurrencies.findIndex((v, i) => v.name ===
              currencyRate.name) + 1}
          </p>
        </div>

        <div class="table-cell">
          <input type="checkbox" bind:checked={currencyRate.has_manual_rate} />
        </div>
        <div class="table-cell">
          <p>
            {currencyRate.name}
          </p>
        </div>
        <div class="table-cell">
          {#if currencyRate.has_manual_rate}
            <input
              on:chage={() => {}}
              type="number"
              min="0"
              step="0.0001"
              bind:value={currencyRate.manual_rate}
            />
          {:else}
            <p>
              {currencyRate.rate}
            </p>
          {/if}
        </div>
        <div class="table-cell">
          <input
            on:change={() => {}}
            type="number"
            step="50"
            bind:value={currencyRate.adjustment}
          />
        </div>
      {/if}
    {/each}
  </div>
</Card>

<style>
  * {
    font-size: 16px;
  }

  .add-remove-currency {
    margin-right: 8px;
    width: 64px;
  }

  .table-cell {
    width: 56px;
    margin: 8px 0px;
  }

  .heading-title {
    text-align: start;
    font-size: smaller;
  }

  input[type="number"] {
    width: 72px;
    border-width: 1px;
    border-radius: 4px;
    text-align: center;
    padding: 2px 4px;
    /* flex-grow: 2; */
    /* border: none; */
    font-size: 16px;
    text-align: start;
  }

  input:focus {
    outline: none;
  }

  button {
    margin-right: 8px;
    font-size: 14px;
    color: #fff;
    border: 0;
    border-radius: 8px;
    color: #fff;
    height: 32px;
    width: 60px;
    cursor: pointer;
    background-color: #202142;
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
