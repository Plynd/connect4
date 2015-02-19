/**
 * This function is a simple utility to give methods to a game object.
 * It is nothing more than a parsing method that takes the json representation of the current game
 * and manipulates its data via some level of abstraction.
 */
define([], function() {
    var Game = function() {
    };

    // This is a utility to extend an object. I would use a library to use such things
    // for instance Backbone, but this is to have an example without any external libraries
    // but Plynd
    var _extend = function(_class, extension) {
        for (var property in extension) {
            if (extension.hasOwnProperty(property)) {
                _class.prototype[property] = extension[property];
            }
        }
    };

    _extend(Game, {
        // A few utilities to work with the state of the game. Again, a library like backbone would help
        getPlayer:function(searchedPlayerID) {
            return this.getPlayerBy(function(player) {return player.playerID == searchedPlayerID});
        },

        getPlayerWithTurn:function() {
            return this.getPlayerBy(function(player) {return player.status == 'has_turn'});
        },

        getPlayers:function(criteria) {
            return this.players.filter(criteria);
        },

        getPlayerBy:function(criteria) {
            var matched = this.getPlayers(criteria);
            return (matched.length) ? matched[0] : null;
        },

        getPlayerColor: function(playerID) {
            var player = this.getPlayer(playerID);
            return player.playerColor;
        },

        getOwnColor:function() {
            return this.getPlayerColor(this.ownPlayerID);
        },

        getOwnPlayer:function() {
            return this.getPlayer(this.ownPlayerID);
        },

        hasTurn: function() {
            var player = this.getOwnPlayer();
            return (player.status == 'has_turn');
        },

        isOver:function() {
            return (this.status == 'game_is_over');
        },

        getWinner:function() {
            return this.getPlayerBy(function(player) {return player.status == 'winner';});
        },

        initialize:function(attributes) {
            // Take the interesting info from the attributes
            this.loadMeta(attributes);

            var state = attributes.state;
            if (Object.keys(state).length === 0) {
                state = {};
                for (var i = 0; i < 7 ; i++) {
                    (state['row_' + i]) || (state['row_' + i] = []);
                }
            }

            this.state = state;
        },

        // The meta data is all the data managed by Plynd itself.
        // It includes :
        // - the players and their statuses (has_turn or waiting_turn)
        // - the game status (game_is_active or game_is_over)
        // - the ID of the player in this context
        loadMeta:function(meta) {
            // Take the interesting info from the meta state
            this.players = meta.players;
            this.status = meta.status;
            this.ownPlayerID = meta.ownPlayerID;
        },

        getRow:function(rowIndex) {
            return this.state['row_' + rowIndex];
        },

        canPlace:function(rowIndex) {
            var row = this.getRow(rowIndex);
            return (this.hasTurn() && row.length < 6);
        }
    });

    return Game;
});