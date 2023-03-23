You just need to change the app server address in stores.js to your servers
address then run npm run build for the frontend
For backend you need to create a secrets.yml in the backend directory and then
run pipenv install, pipenv shell and then run the server.py for server and
bot.py for bot in two separate shells, preferrably using nohup
