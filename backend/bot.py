from pprint import pprint
import json
from typing import Dict, Optional
from dataclass_wizard import fromdict
from pyrogram import filters
from pyrogram.client import Client
from pyrogram.methods.utilities.idle import idle
from pyrogram.sync import compose
from pyrogram.types import ChatMemberUpdated
from pyrogram.types.messages_and_media.message import Message
import requests

from pyrogram.raw import functions

from pyrogram.errors.exceptions.bad_request_400 import PeerIdInvalid

from models import AppState, CurrencyRate

import threading
import time
import schedule

send_message_scheduler = schedule.Scheduler()


def run_continuously(interval=1, scheduler: Optional[schedule.Scheduler] = None):
    cease_continuous_run = threading.Event()

    the_scheduler = scheduler if scheduler else schedule

    class ScheduleThread(threading.Thread):
        @classmethod
        def run(cls):
            while not cease_continuous_run.is_set():
                the_scheduler.run_pending()
                time.sleep(interval)

    continuous_thread = ScheduleThread()
    continuous_thread.start()
    return cease_continuous_run


api_id = '8679196'
api_hash = '1e2ae80454e6f78b5024a02ae98bdb6b'

exchange_bot_token = '6209651682:AAGEF0IGqVHPandtS0bbXZxm514hYC91Y9c'

bot_app = Client(
    'exchange_robot',
    bot_token=exchange_bot_token,
    api_id=api_id,
    api_hash=api_hash,
)

contacted_chat_ids = set()


def final_price(currency: CurrencyRate, dollar_price: int):
    real_rate = currency.manual_rate if currency.has_manual_rate else currency.rate

    if real_rate == 0:
        return 0

    return int((1 / real_rate) * dollar_price + currency.adjustment)


@bot_app.on_message(filters.command(['start']))
async def bot_app_command_handler(client: Client, message: Message):
    contacted_chat_ids.add(message.chat.id)
    start_message = 'Exchange Robot'
    await message.reply_text(start_message)


@bot_app.on_message(filters.private)
async def bot_app_private_message_handler(client: Client, message: Message):
    contacted_chat_ids.add(message.chat.id)
    text = message.text
    print(f'Query:\n{text}')

    # app_state = get_app_state_from_server()
    # bot_raw_output = bot_output_from_app_state(app_state)
    # output_text = format_bot_output_from_app_state(bot_raw_output)

    await client.send_message(chat_id=message.chat.id,
                              text="Bot Running")

@bot_app.on_message(filters.text | filters.group | filters.channel)
async def bot_app_message_handler(client: Client, message: Message):
    contacted_chat_ids.add(message.chat.id)

@bot_app.on_chat_member_updated()
async def bot_chat_member_updated(client: Client,  chat_member_updated:
                                  ChatMemberUpdated):
    if chat_member_updated.new_chat_member:
        new_user =  chat_member_updated.new_chat_member.user
        if new_user.is_self:
            print("Adde to new chat")
            print(chat_member_updated.chat)
            contacted_chat_ids.add(chat_member_updated.chat.id)



def bot_output_from_app_state(appstate: AppState):
    dollar_price = appstate.dollar_model.current_price.price
    selected_currencies_names = appstate.currency_model.selected_currencies

    selected_currencies = []

    selected_currencies = [x for x
                           in appstate.currency_model.currency_rates if
                           x.currencyCode in selected_currencies_names]

    return {k.alias_name: final_price(k, dollar_price) for k in selected_currencies}


def format_bot_output_from_app_state(bot_raw_output: Dict[str, int]):
    output_text = ''
    for name, price in bot_raw_output.items():
        output_text += f'{name}: {price:,}\n'

    return output_text


def get_formatted_bot_output_from_app_state(appstate: AppState):
    return format_bot_output_from_app_state(
        bot_output_from_app_state(appstate)
    )


def get_app_state_from_server():
    res = requests.get('http://localhost:7777/api/get_state')
    app_state = fromdict(AppState, res.json())
    return app_state


def refresh_app_state_job():
    print(f'Contacted chat ids are: {contacted_chat_ids}')
    try:
        new_app_state = get_app_state_from_server()
        global current_app_state
        if new_app_state.bot_model.disabled:
            cancel_all_pending_interval_messages()
        else:
            if new_app_state.bot_model.onChange:
                # if not current_app_state or new_app_state.currency_model != current_app_state.currency_model:
                if not current_app_state or new_app_state != current_app_state:
                    bot_send_rates()
            elif new_app_state.bot_model.onTime:
                print(new_app_state.bot_model)
                if not current_app_state or new_app_state.bot_model.interval != current_app_state.bot_model.interval:
                    print("Interval Changed, Resecheduling")
                    cancel_all_pending_interval_messages()
                    schedule_pending_interval_messages(
                        new_app_state.bot_model.interval)

        if new_app_state == current_app_state:
            print("OLD STATE")
        else:
            print("NEW STATE")
            current_app_state = new_app_state

    except Exception as e:
        print(e)


def schedule_pending_interval_messages(interval):
    print("Scheduling messages")
    if interval.unit == 'Min':
        send_message_scheduler.every(interval.value).minutes.do(bot_send_rates)
    elif interval.unit == 'Hour':
        send_message_scheduler.every(interval.value).hours.do(bot_send_rates)
    elif interval.unit == 'Day':
        send_message_scheduler.every(interval.value).days.do(bot_send_rates)


def cancel_all_pending_interval_messages():
    print("Cacncelling pending messages")
    send_message_scheduler.clear()


def bot_send_rates():
    print("SENDING MESSAGE")
    global contacted_chat_ids
    app_state = get_app_state_from_server()
    message = get_formatted_bot_output_from_app_state(app_state)

    to_be_removed_chat_ids = set()
    for chat_id in contacted_chat_ids:
        try:
            res = bot_app.send_message(chat_id, message)
        except PeerIdInvalid as e:
            to_be_removed_chat_ids.add(chat_id)

    contacted_chat_ids = contacted_chat_ids.difference(to_be_removed_chat_ids)

            


current_app_state = None



if __name__ == '__main__':
    schedule.every(1).seconds.do(refresh_app_state_job)
    default_stop_run = run_continuously()
    bot_message_task_stop_run = run_continuously(
        scheduler=send_message_scheduler)

    bot_app.run()
    default_stop_run.set()
    bot_message_task_stop_run.set()
