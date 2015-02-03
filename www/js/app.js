/**
 * This is our frontend app.
 * It simply loads the game and refresh the state rendering every time the game changes.
 * The methods from the Plynd SDK used here are :
 * - getGame : obtain the json representation of the game
 * - Realtime.onEvent : listen to any new event happening in this game (and not initiated by this window)
 * - sendNewEvent : submits a new event. this calls the function 'onNewEvent' in server.js
 *                  it returns the event as validated by the backend + the updated meta data of the game (like
 *                  whose turn it is and the game status)
 */
define([
    'game'
    ,'server' // Remove this when deploying to live
], function(Connect4Game) {
    return {
        launch:function() {
            // Initialize our custom object (with a few setters for convenience)
            var game = new Connect4Game();

            // This will remember if an event of placing a gem is ongoing
            var currentPlacement = false;
            //Look at window orientation
            // Grab the data corresponding to this game using the Plynd SDK
            Plynd.getGame(function(gameResponse/* json object */) {
                // initialize our game representation from the json
                game.initialize(gameResponse);

                // Analyse window orientation 
                checkOrientation();

                // Trigger the rendering
                showState();

                // Register the callback to any new event happening on the game
                Plynd.Realtime.onEvent(onEvent);
            });

            $(window).resize(function() {
                checkOrientation();
            });

            var checkOrientation = function() {
                var gameContHeight = $('#game-cont').height();
                var gameContWidth = $('#game-cont').width();

                if (gameContWidth >= gameContHeight) {
                    $('#board').css({
                        'max-width' : (gameContHeight)*7/6
                    })
                } 
            }


            var showState = function() {
                $('#board').empty();

                // Show all the rows
                for (var i = 0; i < 7; i++) {
                    var row = showRow(i);
                    $('#board').append(row);
                }

                // Show the current player
                var message;
                var playerWithTurnId = game.getPlayerWithTurn().playerID;

                if (game.isOver()) {
                    var winner = game.getWinner();
                    if (winner.playerID == game.ownPlayerID) {
                        message = 'You won the game !';
                    }
                    else {
                        message = winner.playerName + ' won the game';
                    }
                }
                else {
                    message = (game.hasTurn()) ? 'It is your turn' : 'It is ' + game.getPlayerWithTurn().playerName + '\'s turn';
                }
                $('#turn-cont').css('background-color', game.getPlayerColor(playerWithTurnId));
                $('#turn').text(message);
            };

            // Show one row and attach a click listener to it
            var showRow = function(rowIndex) {
                var row = game.getRow(rowIndex);

                var rowDiv = $('<div/>', {
                    class:'row'
                });

                // Add the gems from the bottom to the top
                row.map(function(playerID) {
                    var gemCont = $('<div/>',{
                    class: 'gemCont'    
                });
                    var gem = $('<div/>',{
                    class: 'gem'    
                });
                    gem.css('background-color', game.getPlayerColor(playerID));
                    gemCont.append(gem);
                    rowDiv.prepend(gemCont);
                });

                // Append available spots
                for (var i = 0; i < 6 - row.length ; i++) {
                    rowDiv.prepend($('<div class="gemCont"><div class="gem available"></div></div>', {}));
                }

                // The highlighting of the row (to show where the gem would be placed)
                rowDiv.on('mouseenter', function() {
                    if (!currentPlacement && game.canPlace(rowIndex)) {
                        rowDiv.find('.available').last().css({
                            'background-color':game.getOwnColor(),
                            'opacity':0.6
                        });
                        rowDiv.css('cursor', 'pointer');
                    }
                });
                rowDiv.on('mouseleave', function() {
                    // Do not remove while submitting the event
                    if (!currentPlacement) {
                        rowDiv.find('.available').css({'background-color':'', opacity:1});
                        rowDiv.css('cursor', '');
                    }
                });

                // This uses the Plynd SDK to submit a new event to the game
                rowDiv.on('click', function() {
                    if (!currentPlacement && game.canPlace(rowIndex)) {
                        currentPlacement = true;
                        Plynd.sendNewEvent({row:rowIndex}, onEvent, relaxCurrentPlacement);
                    }
                });

                return rowDiv;
            };

            // Allow the user to execute an action
            var relaxCurrentPlacement = function() {
                currentPlacement = false;
            };

            // This is the logic where we update the state of the game based on a new
            // incoming event
            var onEvent = function(event, meta /* kept up to date by the SDK */) {
                var row = game.getRow(event.row);
                row.push(event.playerID);

                // The meta state might have changed. Take it as returned
                game.loadMeta(meta);

                // Hard-refresh the display of the state
                showState();

                relaxCurrentPlacement();
            };
        }
    };
});