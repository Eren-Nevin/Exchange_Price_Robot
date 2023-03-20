from pprint import pprint
import dataclasses
from pathlib import Path
from dataclasses import dataclass
from sanic import Sanic, Request, json
from sanic_ext import Extend
from models import AppState

from xe_crawler import XeResult, XeCrawler

from dataclass_wizard import fromdict, asdict


class Server:
    def __init__(self) -> None:
        self.app = Sanic("My_Server")
        self.app.config.LOCAL_CERT_CREATOR = 'trustme'
        self.app.config['CORS_SUPPORTS_CREDENTIALS'] = True
        self.app.config.CORS_ORIGINS = "http://localhost:5000"
        Extend(self.app)

        self.xe_crawler = XeCrawler()
        self.last_rates = self.xe_crawler.get_xe_rates(False)
        self.app_state = AppState.initialize_test()

        self.app.add_route(self.get_all_rates, 'api/get_all_rates', ['GET'])
        self.app.add_route(self.get_state, 'api/get_state', ['GET'])
        self.app.add_route(self.send_state, 'api/send_state', ['POST'])
        self.set_serve_static()

    def set_serve_static(self):
        path = Path('../public')
        self.app.static('/', path.resolve())
        html_path = path.resolve().joinpath('/index.html')
        self.app.static('/index.html', html_path, name='index')

    async def get_all_rates(self, request: Request):

        res = json({'timestamp': self.last_rates.timestamp,
                    'rates': self.last_rates.rates
                    }, )
        res.headers.extend({'Access-Control-Allow-Origin': '*'})

        return res

    async def get_state(self, request: Request):
        print("Sending State to client")
        res = json(dataclasses.asdict(self.app_state))
        res.headers.extend({'Access-Control-Allow-Origin': '*'})

        return res

    async def send_state(self, request: Request):
        print("Getting state from client")
        # raw_app_state = request.json

        self.app_state = fromdict(AppState, request.json)

        pprint(asdict(self.app_state))
        return json({'status': 'OK'})


server = Server()


if __name__ == '__main__':
    server.app.run('localhost', 7777, auto_reload=True)
