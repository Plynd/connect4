/**
 * This file is specific to the Plynd framework.
 * The rationale is that for development purposes it can be run in the browser when the application is not
 * published yet. Later, it has to be uploaded to Plynd servers, where it will be run.
 * The reason is that the endpoint to update the game state (Plynd.put('/game/{id}')) is not available from
 * the browser scope while in production, to avoid cheats.
 *
 * It can have any name, but if using require (as here), it has to be explicitly built with the module name 'server'
 * (as it currently is in tools/build.js).
 * Also, when uploaded to the server, it has to be a single file (it cannot load more files dynamically during execution)
 *
 * The logic for the game of connect 4 is simple :
 * - on a new event, check if the row is full, and then update the game state.
 * - in the case this event sees the win of the player, specify it to the server by using the
 * specific field 'gameOver' = true in the event. This will have the effect of updating the meta-state of the game.
 *
 * This should not share state with the rest of the app, as it will run in a specific environment when the application
 * is published. However it can share logic with the rest of the app (as here, where we use the module 'game' in both places)
 */
define([
    'winEvaluation',
    'game'
], function(WinEvaluation, Connect4Game) {

    // Add a function to the pool of ServerFunctions
    Plynd.ServerFunctions.onNewEvent = function(event, success, error) {
        // An event simply specifies the row in which the player attempted to place a gem
        var row = event.row;

        var game = new Connect4Game();

        Plynd.getGame(function(gameResponse) {
            game.initialize(gameResponse);

            // Check if the player has turn
            if (!game.hasTurn()) {
                return error({
                    code:403,
                    data:"Not this player's turn"
                });
            }

            // Check if the row is not full
            var requestedRow = game.getRow(row);
            if (requestedRow.length >= 6) {
                return error({
                    code:403,
                    data:"The row " + row + " is full"
                });
            }

            // All good, append the playerID's gem ontop of the row
            var ownPlayer = game.getOwnPlayer();
            var ownPlayerID = ownPlayer.playerID;
            requestedRow.push(ownPlayerID);

            // Check if this is a winning position
            var event = {row:row};
            if (WinEvaluation.isWinningBoard(game, ownPlayerID)) {
                event.gameOver = true;
            }
            else {
                event.endTurn = true;
            }

            // Save the game
            var gameToSave = {
                state:game.state,
                event:event
            };

            var returnEvent = function(blob) {
                success(blob.event);
            };

            Plynd.put('/game/' + Plynd.getGameID(), {
                data:gameToSave,
                success:returnEvent,
                error:error
            });
        });
    };
});
