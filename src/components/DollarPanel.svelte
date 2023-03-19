<script>
  import {v4 as uuidv4} from 'uuid'
  import { DollarStore } from "../stores.js";
  import Button from "./Button.svelte";
  import Card from "./Card.svelte";

  let manual_rate = "";

  const handleChange = (symbol) => {
    console.log(symbol);
  };

  const handleSubmit = (new_price) => {
    console.log(new_price);

    DollarStore.update((currentState) => {
        let new_log = {
            id: uuidv4(),
            price: +currentState.current_price,
            time: currentState.current_time
        }
        let new_logs = [new_log, ...currentState.logs]

        let new_state = {
            current_price: new_price,
            current_time: Math.floor(Date.now() / 1000),
            logs: new_logs
        }

        return new_state
    })
  };

  // TODO: Do we need to use locale?
  const convertTimestampToDate = (timestamp) => {
    let pointInTime = new Date(timestamp * 1000);
    return pointInTime.toLocaleDateString();
  };

  const convertTimestampToTime = (timestamp) => {
    let pointInTime = new Date(timestamp * 1000).toLocaleTimeString();

    return pointInTime;
  };
</script>

<Card>
  <form on:submit|preventDefault={handleSubmit(manual_rate)}>
    <div style="display: flex;">
      <p>Enter $</p>
      <input type="number" min="0" step="50" bind:value={manual_rate} />
      <Button type="submit">Add</Button>
    </div>
  </form>

  <hr class="solid">

  <div style="display: flex; justify-content: space-between;">
    <p>
      Current Price:
      {$DollarStore.current_price}
    </p>
    <p>
      {convertTimestampToDate($DollarStore.current_time)} -
      {convertTimestampToTime($DollarStore.current_time)}
    </p>
  </div>

  <hr class="solid">

  <p>Logs:</p>
  {#each $DollarStore.logs as dollar (dollar.id)}
    <div style="display: flex; justify-content: space-between; ">
      <p>{dollar.price}</p>
      <p>
        {convertTimestampToDate(dollar.time)} -
        {convertTimestampToTime(dollar.time)}
      </p>
    </div>
  {/each}
</Card>

<style>
  * {
    font-size: 16px;
    margin-right: 8px;
    margin-top: 4px;
    margin-bottom: 4px;
  }

  input[type="number"] {
    width: 120px;
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

  hr.solid {
        border-top: 1px solid #bbb;
        margin: 8px 0px;
    }
</style>
