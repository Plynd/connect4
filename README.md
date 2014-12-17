connect4
========

Demo of how to create a simple connect 4 game using the Plynd SDK.
The importance here is on the use of the core functions of the SDK.

You can test the game in real at http://connect4.plynd.com.

The structure of the project is of 2 main files : server.js and app.js:
* app.js is the web-app of the game. it is all the code that renders the game and defines the user interaction
* server.js is the business logic behind the game, i.e. the rules that validate if a move from a player (in this case the placing of a gem on a given row) is correct, and that actually execute the modification of the game state.

The SDK includes a few functionalities:
* Plynd.getGame(onSuccess, onError) allows to fetch the game corresponding to the scope of the window. The game description consists of 2 parts : the metadata (i.e. the players in the game with pictures and countries and their current statuses, the status of the game, the current player in the scope of the window) and the state (which representation is purely depending on the 3rd party developer). What you will get in state is exactly what you will have save in the previous call to Plynd.put('/game/{id}').
* Plynd.get(url, options) ; Plynd.put(url, options) and Plynd.api(method, url, options) allow to communicate with Plynd REST API. Its underlying library is reqwest (https://github.com/ded/reqwest), so options should be formatted according to this library.
* Plynd.sendNewEvent(event, onSuccess, onError) is the bridge to send a new event from the app.js context to the business logic (in server.js) to validate and execute it. onSuccess has the signature onSuccess(event, metadata) as it will pass back the event and the new metadata of the game. It means that the developer does not have to compute the new metadata of the game after each event, but can rely on the SDK to do so (i.e. update the player status and game status according to events). 
* Plynd.Realtime provides (as of version 0.1) just one function: Plynd.Realtime.OnEvent(callback[event, metadata]) to listen to any new event happening on the game. the callback as the same signature as onSuccess from Plynd.sendNewEvent, as it will receive the exact same data. The realtime will not send back events that have originated in the window, but only events from other windows (the equivalent of broadcast in socket.io).
