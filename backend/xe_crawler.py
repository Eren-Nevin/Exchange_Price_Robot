from dataclasses import dataclass
from pprint import pprint
from time import sleep
from typing import Dict, List
from bs4 import BeautifulSoup
import requests

from selenium_catcher import get_auth_token

# curl 'https://www.xe.com/api/protected/midmarket-converter/' \
#   'authority': 'www.xe.com'
#   'accept': '*/*'
#   'accept-language': 'en-US,en;q=0.9,fa-IR;q=0.8,fa;q=0.7'
#   'authorization': 'Basic bG9kZXN0YXI6REdPTEV4MGNOTzVXTk96NTNFVGc2aWhtY2g5OE1sMkU='
#   'cache-control': 'no-cache'
#   'cookie': 'optimizelyOptOut=true; lastConversion={%22amount%22:3%2C%22fromCurrency%22:%22EUR%22%2C%22toCurrency%22:%22TRY%22}'
#   'dnt': '1'
#   'pragma': 'no-cache'
#   'referer': 'https://www.xe.com/currencyconverter/'
#   'sec-ch-ua': '"Google Chrome";v="111", "Not(A:Brand";v="8", "Chromium";v="111"'
#   'sec-ch-ua-mobile': '?0'
#   'sec-ch-ua-platform': '"macOS"'
#   'sec-fetch-dest': 'empty'
#   'sec-fetch-mode': 'cors'
#   'sec-fetch-site': 'same-origin'
#   'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36'
#   --compressed

# @dataclass()
# class XeRate:
#     quote: str
#     rate: float


@dataclass()
class XeResult:
    # In millisecond
    timestamp: int
    rates: Dict[str, float]


class XeCrawler:
    def __init__(self) -> None:
        # This is a sample auth, it needs to be referehsed
        self.auth =\
                'Basic bG9kZXN0YXI6REdPTEV4MGNOTzVXTk96NTNFVGc2aWhtY2g5OE1sMkU='
        super().__init__()

    def refresh_auth(self):
        self.auth = get_auth_token()

    def get_headers(self):
        return {
            'authority': 'www.xe.com',
            'accept': '*/*',
            'accept-language': 'en-US,en;q=0.9,fa-IR;q=0.8,fa;q=0.7',
            'authorization': self.auth,
            'cache-control': 'no-cache',
            'dnt': '1',
            'pragma': 'no-cache',
            'referer': 'https://www.xe.com/currencyconverter/',
            'sec-ch-ua': '"Google Chrome";v="111", "Not(A:Brand";v="8", Chromium";v="111"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': '''Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36''',
        }

    def get_xe_rates(self, referesh_auth: bool):
        if referesh_auth:
            self.refresh_auth()

        res = requests.get(
            'https://www.xe.com/api/protected/midmarket-converter/',
            headers=self.get_headers(),
        )

        pprint(res.text)

        res_dict = res.json()


        xe_timestamp = res_dict['timestamp']
        xe_rates: Dict[str, float] = {}

        for key, value in res_dict['rates'].items():
            xe_rates[key] = float(value)

        return XeResult(xe_timestamp, xe_rates)

if __name__ == '__main__':
    crawler = XeCrawler()
    for i in range(5):
        if i == 0:
            pprint(crawler.get_xe_rates(True).rates)
        else:
            pprint(crawler.get_xe_rates(False).rates)

        sleep(3)
