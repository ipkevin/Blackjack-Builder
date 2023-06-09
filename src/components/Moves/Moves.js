import useSound from 'use-sound';

import './Moves.scss';

import Quit from './Quit';

import betSound from "../../assets/sounds/bet.ogg";
import takeCardSound from "../../assets/sounds/take_card.ogg";
import creditsSound from "../../assets/sounds/buy_credits.ogg";
import standSound from "../../assets/sounds/stand.ogg";
import btnSound from "../../assets/sounds/btn_click_quiet.ogg";


export default function Moves({currPlayerObj, dealerObj, moves, ctx}) {

    const [playBet] = useSound(betSound);
    const [playTakeCard] = useSound(takeCardSound);
    const [playBuyCredits] = useSound(creditsSound);
    const [playStand] = useSound(standSound);
    const [playBtnClick] = useSound(btnSound);

    function handleBet(num) {
        playBet();
        moves.bet(num);
    }
    function handleHit() {
        playTakeCard();
        moves.hit();
    }
    function handleStand() {
        playStand();
        moves.stand();
    }
    function handleInsurance() {
        playBtnClick();
        moves.buyInsurance();
    }
    function handleOK() {
        playBtnClick();
        moves.OK();
    }
    function handleBuyCredits() {
        playBuyCredits();
        moves.getChips();
    }
    function handleEndTurn() {
        playBtnClick();
        moves.endTurn();
    }
    // Displays available moves for current phase
    const insertMoves = () => {
        if (ctx.phase === "betting") {
            return (
                <>
                    <button className="std-btn" onClick={() => handleBet(100)}>
                        Bet 100
                    </button>
                    <button className="std-btn" onClick={() => handleBet(500)}>
                        Bet 500
                    </button>
                    {currPlayerObj.bank < 500 ? <button className="std-btn" onClick={handleBuyCredits}>Buy Chips</button> : "" }
                </>
            );
        } else if (ctx.phase === "playing" && currPlayerObj.busted === false && currPlayerObj.hasBJ === false) {
            return (
                <>
                    <button className="std-btn" onClick={handleHit}>
                        Hit
                    </button>
                    <button className="std-btn" onClick={handleStand}>
                        Stand
                    </button>
                    {/* <button className="std-btn" onClick={handleInsurance}>Buy Insurance</button>   */}
                    {(dealerObj.hand[0].rank === 1 && currPlayerObj.hasInsurance !== true && currPlayerObj.hasBJ !== true && currPlayerObj.bank >= (currPlayerObj.bet/2)) &&
                       <button className="std-btn" onClick={handleInsurance}>Buy Insurance</button>}
                </>
            );
        } else if (ctx.phase === "playing" && (currPlayerObj.busted === true || currPlayerObj.hasBJ === true)) {
            return (
                <>
                    <button className="std-btn" onClick={handleEndTurn}>
                        OK
                    </button>
                </>
            );
        // } else if (ctx.phase === "dealingtodealer") {  // GOT RID OF THIS. USE AUTO END FROM AI
        //     return (
        //         <>
        //             <button className="std-btn" onClick={handleEndDealerDealing}>
        //                 Continue
        //             </button>
        //         </>
        //     );
        } else if (ctx.phase === "finishing") {
            return (
                <>
                    <button className="std-btn" onClick={handleOK}>
                        OK
                    </button>
                    <button className="std-btn" onClick={handleBuyCredits}>
                        Buy Chips
                    </button>
                </>
            );
        }
    };

    let buyMsg = "Buy 1000 Chips";
    if (window.innerWidth < 728) buyMsg = "Buy Chips";

    return (
        <>
            <div className="move__container">
            {insertMoves()}
            </div>
            <Quit moves={moves} playBtnClick={playBtnClick} />
            <div className="move__container-buy-credits">
                <button className={`std-btn ${currPlayerObj.bank < 500 ? "std-btn--urgent" : ""}`} onClick={handleBuyCredits}>
                    {buyMsg}
                </button>
            </div>
        </>
    )
}