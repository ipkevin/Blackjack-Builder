import {INVALID_MOVE} from 'boardgame.io/core';
import { TurnOrder } from 'boardgame.io/core';


function IsVictory(cells) {
    // So this will be passed the entire game 'board' (cells[])
    
    // positions are a set of 3 positions in the board that would be equal to a win
    const positions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6],
        [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]
    ];

    const isRowComplete = row => {
        // So row passed in will actually set of 3 positions in 
        // the cells[] that would be needed to win (ie, from positions[] array)
        // This creates an array (symbols) that stores what playerID is stored in those 3 positions
        // If this array contains the same playerID in all 3 indices, that means a single player managed to get a winning row (got all 3 positions of winning configuration)
        const symbols = row.map(i => cells[i]);
        // Below checks whether every element in symbols is the same. This means a player got every spot in a winning config (ie, got a winning config)
        // returns True if so
        return symbols.every(i => i !== null && i === symbols[0]);
    }
    // .some just means as long as it's true once, return true
    // cuz the first part returns an array where each index represents whether
    // a winner was found for each of the winning configurations.  If any one is true, that means won (ie, was in a winning config)
    return positions.map(isRowComplete).some(i => i === true);
}

// returns true if match is a draw (all cells filled)
function IsDraw(cells) {
    return cells.filter(c => c === null).length === 0;
}

// The suits of cards
const suits = ["Clubs", "Spades", "Hearts", "Diamonds"];

// Represent cards. 1 = Ace, 11-13 = jack, queen, king
const ranks = [1,2,3,4,5,6,7,8,9,10,11,12,13];

// returns an array of cards that will be shoe/deck games are played with
// numDecks = Number of decks to use (a typical blackjack deck incl 6-8 decks of cards)
// If numDecks is not provided or not a valid Int (int >= 1), then will set to 1
function buildDeck(numDecks = 1) {
    if (Number.isNaN(numDecks) || !Number.isInteger(numDecks) || numDecks < 1) {
        numDecks = 1;
    }
    let theDeck = []
    for (let d = 0; d < numDecks; d++) {
        for (let s = 0; s < suits.length; s++) {
            for (let r = 0; r < ranks.length; r++) {
                theDeck.push({
                    rank: ranks[r],
                    suit: suits[s]
                })
            }
        }
    }
    // console.log("here is the freshly built deck: ", theDeck);
    return theDeck;
}

// // NOT NEEDED. Can do this directly in setup with array methods
// function initBanks(numPlayers){ 
//     let banks = [];
//     for (let i=0; i<numPlayers; i++){
//         banks[i] = 1000;
//     }
//     console.log("this is content of banks: ", banks);
//     return banks;
// }


export const TicTacToe = {
    setup: ({G, ctx}) => (
        {
            cells: Array(9).fill(null), 
            quit: null,
            gameSettings: {
                numDecks: 2,
                },
            deck: [],
            dealerHand: [],
            secret: {
                dealerCard: {},
            },
            playerHands: [],
            playerBanks: Array(ctx.numPlayers).fill(1000), // initBanks(ctx.numPlayers),
            playerBets: Array(ctx.numPlayers).fill(0),

        }
    ),


    moves: {
        clickCell: ({G, playerID, ctx}, id) => {
            console.log("here is playOrder[]: ", ctx.playOrder);
            console.log("here is G: ", JSON.stringify(G));
            // console.log("cards in deck: ", G.deck.length);
            console.log("here is ctx: ", ctx);
            if (G.cells[id] !== null) {
                return INVALID_MOVE;
            }
            G.cells[id] = playerID;
        },
        quitGame: ({G}) => {
            console.log("clicked quit!");
            G.quit = true;
            console.log("value of G.quit in quitGame move: ", G.quit);
        }
    },

    phases: {
        betting: {
            onBegin: ({G, random, ctx}) => {
                // reset the deck and shuffle
                G.deck = random.Shuffle(buildDeck(G.gameSettings.numDecks));
                // console.log("in onbegin of betting phase. Here is shuffled g deck: ",JSON.stringify(G.deck));
                console.log("here is value of ctx in onbegin betting: ", ctx);
                // initialize the player hands array
                for (let i = 0; i< ctx.numPlayers; i++) {
                    G.playerHands[i] = [];
                    G.playerBets[i] = 0;
                    G.dealerHand = [];
                    G.secret.dealerCard = {};
                }
            },
            start: true,
            turn: {
                minMoves: 1,
                maxMoves: 1,
            },
            moves: {
                bet: ({G, playerID}, betAmt) => {
                    if (!betAmt || Number.isNaN(betAmt) || !Number.isInteger(betAmt) || betAmt < 1 || betAmt > G.playerBanks[playerID]) {
                        return INVALID_MOVE;
                    }
                    G.playerBets[playerID] = betAmt;
                    G.playerBanks[playerID] -= betAmt;
                }
            },
            endIf: ({G}) => {
                return G.playerBets.every((bet) => {return bet > 0});
            },
            next: 'playing',
        }, 

        playing: {
            onBegin: ({G, ctx}) => {
                // deal first card to each player, then the dealer
                for (let i=0; i<ctx.numPlayers; i++){
                    G.playerHands[i].push(G.deck.pop());
                }
                G.dealerHand.push(G.deck.pop());

                // deal 2nd card to each player, then the dealer. Dealer's 2nd card is secret so that clients cannot see it.
                for (let i=0; i<ctx.numPlayers; i++){
                    G.playerHands[i].push(G.deck.pop());
                }
                G.secret.dealerCard = G.deck.pop();
            },
            moves: {
                hit: ({G, playerID}) => {
                    console.log("here are the cards left in the deck before hit: ", G.deck.length);
                    console.log("here is playerID from hit move: ", playerID);
                    G.playerHands[playerID].push(G.deck.pop());
                    console.log("here's the player's hand: ", JSON.stringify(G.playerHands[playerID]));
                    console.log("here are the cards left in the deck after hit: ", G.deck.length);
                },
                stand: ({events}) => {
                    events.endTurn();
                },
            },
            turn: {
                order: TurnOrder.RESET,
            },
        },
    },

    // turn: {
    //     minMoves: 1,
    //     maxMoves: 1
    // },

    
    endIf: ({G, ctx}) => {
        // if (IsVictory(G.cells)) {
        //     // You know it's the current player because this endIf check is run after every state change (ie, move).  So if it found winner then it must have occurred during currentPlayer's move
        //     console.log("endif isVict check ran");
        //     return { winner: ctx.currentPlayer};
        // }
        // if (IsDraw(G.cells)) {
        //     console.log("endif isdraw check ran");
        //     return { draw:true };
        // }
        if (G.quit === true) {
            alert("game over");
            console.log("endif quit check ran");
            // Must return something (even if it's "") in order for the game to actually end
            // NB: Game state does NOT actually reset!  But u can't keep playing either. So I guess u need to reset the game.
            return "you're a weiner";
        }
    }
}