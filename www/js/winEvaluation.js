define([], function() {

    // Clever evaluation method taken from
    // http://stackoverflow.com/questions/7033165/algorithm-to-check-a-connect-four-field
    // I implemented bit operations with arrays because bit operators are only supported
    // on 32-bits in javascript and here we need 47 bits to evaluate the full grid
    return {
        isWinningBoard: function(game, playerID) {
            var bitmask = [];
            // Compute the bitmask representation of the game for the user {playerID}
            for (var i = 0 ; i < 7; i++) {
                var row = game.getRow(i);
                for (var j = 0; j < 6 ; j++) {
                    if (row[j] == playerID) {
                        bitmask[(7*i) + j] = true;
                    }
                }
            }
            // Vertical alignment
            if (this.checkAlignment(bitmask, 1)) return true;
            // Horizontal alignment
            if (this.checkAlignment(bitmask, 7)) return true;
            // Diagonal /
            if (this.checkAlignment(bitmask, 8)) return true;
            // Diagonal \
            return (this.checkAlignment(bitmask, 6));
        },

        shiftArrayLeft: function(array, shift) {
            var shiftedArray = [];
            for (var i = shift ; i < array.length ; i++) {
                shiftedArray[i - shift] = array[i];
            }
            return shiftedArray;
        },

        arrayAnd: function(array1, array2) {
            var and = [];
            for (var i = 0 ; i < array1.length ; i++) {
                and[i] = array1[i] + array2[i];
            }
            return and;
        },

        checkAlignment: function(board, alignement) {
            // Get copy of values
            var combined = this.shiftArrayLeft(board, 0);
            for (var i = 1 ; i < 4 ; i++) {
                combined = this.arrayAnd(combined, this.shiftArrayLeft(board, alignement * i));
            }

            // There is an alignment as soon as 1 bit remains true
            for (var j = 0 ; j < combined.length ; j++) {
                if (combined[j]) return true;
            }

            return false;
        }
    };
});
