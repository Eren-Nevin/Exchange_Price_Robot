import { v4 } from "uuid";
export class AppState {
  dollar_model;
  currency_model;
  bot_model;

  constructor(dollar_model, currency_model, bot_model) {
    this.dollar_model = dollar_model;
    this.currency_model = currency_model;
    this.bot_model = bot_model;
  }
}

export class CurrencyRate {
  uid;
  currencyCode;
  alias_name;
  rate;
  has_manual_rate;
  manual_rate;
  adjustment;

  constructor(
    currencyCode,
    alias_name,
    rate,
    has_manual_rate,
    manual_rate,
    adjustment
  ) {
    this.uid = v4();
    this.currencyCode = currencyCode;
    this.alias_name = alias_name;
    this.rate = rate;
    this.has_manual_rate = has_manual_rate;
    this.manual_rate = manual_rate;
    this.adjustment = adjustment;
  }
}

export class CurrencyModel {
  selected_currencies;
  currency_rates;

    constructor(selected_currencies =[], currency_rates =[]) {
        this.selected_currencies = selected_currencies
        this.currency_rates = currency_rates
    }
}

export class DollarPrice {
  price;
  timestamp;

  constructor(price, timestamp) {
    this.uid = v4();
    this.price = price;
    this.timestamp = timestamp;
  }
}

export class DollarModel {
    current_price;
    historic_prices;

    constructor(current_price= new DollarPrice(40000, 1679647122),
        historic_prices=[]) {
        this.current_price = current_price
        this.historic_prices = historic_prices
    }
}

export class BotInterval {
  unit;
  value;

  constructor(unit, value) {
    this.unit = unit;
    this.value = value;
  }
}

export class BotModel {
    disabled;
    onTime;
    onChange;
    interval;

    constructor(disabled=false, onTime=false, onChange=true,
        interval= new BotInterval('Min', 2)) {
        this.disabled = disabled
        this.onTime = onTime
        this.onChange = onChange
        this.interval = interval
    }
}
