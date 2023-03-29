import { writable } from "svelte/store";
import { v4 } from "uuid";
import {
  AppState,
  CurrencyRate,
  CurrencyModel,
  DollarPrice,
  DollarModel,
  BotInterval,
  BotModel,
} from "./models";

let app_server_address = "http://localhost:7777";

export const CurrencyStore = writable(new CurrencyModel());

export const DollarStore = writable(new DollarModel());

export const BotStore = writable(new BotModel());

let app_state = new AppState(null, null, null);

export async function uploadStateFileToServer() {
  console.log("UPLOADING");
  var input = document.querySelector('input[type="file"]');
  console.log(input);

  var data = new FormData()
  data.append('file', input.files[0])
  data.append('user', 'hubot')

  let res = await fetch(`${app_server_address}/api/send_state_file`, {
    method: "POST",
    body: data
  });
    console.log(res.text())
}

export async function downloadStateFileFromServer() {
  fetch(`${app_server_address}/api/get_state_file`)
    .then((resp) => resp.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      // the filename you want
      a.download = "app_state.json";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      alert("your file has downloaded!"); // or you know, something with better UX...
    })
    .catch(() => alert("oh no!"));
}

export async function getRawStateFromServer() {
  let raw_res = await fetch(
    `${app_server_address}/api/get_state`
    // {mode: 'no-cors'}
  );

  if (!raw_res.ok) {
    console.log(raw_res.statusText);
    console.log(raw_res.status);
  }
  return await raw_res.json();
}

function dollarModelDataAdapter(dollar_model) {
  let rec_historic_prices = [];

  for (let historic_price of dollar_model.historic_prices) {
    rec_historic_prices = [
      new DollarPrice(historic_price.price, historic_price.timestamp),
      ...rec_historic_prices,
    ];
  }

  rec_historic_prices.sort((a, b) => b.timestamp - a.timestamp);

  let new_dollar_model = new DollarModel(
    new DollarPrice(
      dollar_model.current_price.price,
      dollar_model.current_price.timestamp
    ),
    rec_historic_prices
  );

  return new_dollar_model;
}

function botModelDataAdapter(bot_model) {
  let interval = new BotInterval(
    bot_model.interval.unit,
    bot_model.interval.value
  );

  let new_bot_model = new BotModel(
    bot_model.disabled,
    bot_model.onTime,
    bot_model.onChange,
    interval
  );

  return new_bot_model;
}

function currencyModelDataAdapter(currency_model) {
  let received_currency_rates = [];

  for (let raw_model of currency_model.currency_rates) {
    let new_currency = new CurrencyRate(
      raw_model.currencyCode,
      raw_model.alias_name,
      raw_model.rate,
      raw_model.has_manual_rate,
      raw_model.manual_rate,
      raw_model.adjustment
    );
    received_currency_rates = [new_currency, ...received_currency_rates];
  }

  received_currency_rates = [
    ...received_currency_rates.sort((a, b) =>
      a.currencyCode.localeCompare(b.currencyCode)
    ),
  ];
  let new_currency_model = new CurrencyModel(
    currency_model.selected_currencies,
    received_currency_rates
  );
  return new_currency_model;
}

async function _getAppStateFromServer() {
  console.log("Getting app state from server");
  let raw_state = await getRawStateFromServer();

  let new_dollar_model = dollarModelDataAdapter(raw_state.dollar_model);
  let new_bot_model = botModelDataAdapter(raw_state.bot_model);
  let new_currency_model = currencyModelDataAdapter(raw_state.currency_model);

  let app_state = new AppState(
    new_dollar_model,
    new_currency_model,
    new_bot_model
  );

  console.log(app_state);

  return app_state;
}

export async function reloadRatesFromServer() {
  console.log("Reloading rates from server");

  let newAppState = await _getAppStateFromServer();
  let new_currency_rates = newAppState.currency_model.currency_rates;

  CurrencyStore.update((currentState) => {
    let toBeUpdatedState = JSON.parse(JSON.stringify(currentState));
    for (let currency_rate of currentState.currency_rates) {
      if (
        new_currency_rates
          .map((e) => e.currencyCode)
          .includes(currency_rate.currencyCode)
      ) {
        let corrospondingRate = new_currency_rates.filter(
          (e) => e.currencyCode == currency_rate.currencyCode
        )[0];
        toBeUpdatedState.currency_rates.find(
          (e) => e.currencyCode == corrospondingRate.currencyCode
        ).rate = corrospondingRate.rate;
      }
    }
    return toBeUpdatedState;
  });
}

export async function reloadStateFromServer() {
  let new_app_state = await _getAppStateFromServer();
  console.log(new_app_state);

  DollarStore.update((currentState) => {
    return new_app_state.dollar_model;
  });

  BotStore.update((currentState) => {
    return new_app_state.bot_model;
  });

  CurrencyStore.update((currentState) => {
    return new_app_state.currency_model;
  });
}

let dollarUnsub;
let currencyUnsub;
let botUnsub;

export function startUpdatingAppState() {
  dollarUnsub = DollarStore.subscribe((dollar_model) => {
    app_state.dollar_model = dollar_model;
  });
  currencyUnsub = CurrencyStore.subscribe((currency_model) => {
    app_state.currency_model = {
      selected_currencies: currency_model.selected_currencies,
      currency_rates: [...currency_model.currency_rates],
    };
  });
  botUnsub = BotStore.subscribe((bot_model) => {
    app_state.bot_model = bot_model;
  });
}

export function stopUpdatingAppState() {
  dollarUnsub();
  currencyUnsub();
  botUnsub();
}

export async function sendStateToServer() {
  console.log("Sending state to server");
  let app_state_json = JSON.stringify(app_state);
  let raw_res = await fetch(`${app_server_address}/api/send_state`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: app_state_json,
  });
}
