import json
from dataclass_wizard import fromdict
from pyrogram import filters
from pyrogram.client import Client
from pyrogram.methods.utilities.idle import idle
from pyrogram.sync import compose
from pyrogram.types.messages_and_media.message import Message
import requests

from models import AppState, CurrencyRate

api_id = '8679196'
api_hash = '1e2ae80454e6f78b5024a02ae98bdb6b'

exchange_bot_token = '6209651682:AAGEF0IGqVHPandtS0bbXZxm514hYC91Y9c'

bot_app = Client(
    'exchange_robot',
    bot_token=exchange_bot_token,
    api_id=api_id,
    api_hash=api_hash,
)

def final_price(currency: CurrencyRate, dollar_price: int):
    return int((1 / (currency.manual_rate if currency.has_manual_rate else
            currency.rate)) * dollar_price + currency.adjustment)


@bot_app.on_message(filters.command(['start']))
async def bot_app_command_handler(client: Client, message: Message):
    start_message = 'Exchange Robot'
    await message.reply_text(start_message)


@bot_app.on_message(filters.text)
async def bot_app_message_handler(client: Client, message: Message):
    # text = sanitize_text(message.text)
    text = message.text
    print(f'Query:\n{text}')

    res = requests.get('http://localhost:7777/api/get_state')

    app_state = fromdict(AppState, res.json())

    dollar_price = app_state.dollar_model.current_price.price

    def bot_output_from_app_state(appstate: AppState):
        selected_currencies_names = appstate.currency_model.selected_currencies

        selected_currencies = []

        selected_currencies = [x for x
                               in appstate.currency_model.currency_rates if
                               x.name in selected_currencies_names]

        return {k.name: final_price(k, dollar_price) for k in selected_currencies}

    bot_raw_output = bot_output_from_app_state(app_state)

    output_text = ''
    for name, price in bot_raw_output.items():
        output_text += f'{name}: {price}\n'




    await client.send_message(chat_id=message.chat.id,
                              text=output_text)


if __name__ == '__main__':
    bot_app.run()
