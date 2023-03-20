<script>
  import { CurrencyStore } from "../stores";
  import { fade, scale } from "svelte/transition";
  import Card from "./Card.svelte";
  import Button from "./Button.svelte";

  const handleInput = (symbol) => {
    console.log(symbol);
  };
  const handleChange = (currencyRate) => {
    console.log(currencyRate);
  };
</script>

<Card>
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
    {#each $CurrencyStore as currencyRate, i (currencyRate.uid)}
      <div class="table-cell">
        <p>
          {i+1}
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
            on:chage={() => handleChange(currencyRate)}
            type="number"
            min="0"
            step="0.001"
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
          on:change={() => handleChange(currencyRate)}
          type="number"
          step="50"
          bind:value={currencyRate.adjustment}
        />
      </div>
    {/each}
  </div>
</Card>

<style>
    * {
        font-size: 16px;
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

</style>
