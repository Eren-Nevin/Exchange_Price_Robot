import { writable } from "svelte/store";

class CurrencySymbol {
  id;
  name;
  rate;

  constructor(id, name, rate) {
    this.id = id;
    this.name = name;
    this.rate = rate;
  }
}

export const CurrencyStore = writable([
  {
    id: 1,
    symbol: new CurrencySymbol("5", "EUR", "1.05"),
    has_manual_rate : false,
    manual_rate: 1.06,
    addition: 500,
  },
  {
    id: 2,
    symbol: new CurrencySymbol("3", "TL", "0.05"),
    has_manual_rate : true,
    manual_rate: 0.04,
    addition: 0,
  },
]);

// export const RateCalibratesStore = writable([
//   {
//     id: 1,
//     amount: "+500",
//   },
// ]);

export const DollarStore = writable({
  current_price: 48285,
  current_time: 1679161352,
  logs: [
    {
      id: "some_uuid",
      price: 47895,
      time: 1679218971,
    },
    {
      id: "some_uuid_2",
      price: 48890,
      time: 1679118971,
    },
  ],
});

export const BotStore = writable({
    disabled: false,
    onTime: true,
    onChange: false,

    intervalSettings : {
        intervalValue: 5,
        intervalDuration: 'Day'
    }
})
