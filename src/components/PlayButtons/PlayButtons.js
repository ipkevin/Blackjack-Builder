import {useNavigate} from 'react-router-dom';
import {useState} from 'react';
import useSound from 'use-sound';

import btnSound from "../../assets/sounds/btn_click_quiet.ogg";

import "./PlayButtons.scss";

export default function PlayButton() {

    const [playBtnClick] = useSound(btnSound);
    const navigate = useNavigate();

    const [hideLocalOptions, setHideLocalOptions] = useState("buttons__group--hidden");

    function toggleLocalOptions(){
        playBtnClick();
        (hideLocalOptions === "") ? setHideLocalOptions("buttons__group--hidden") : setHideLocalOptions("");
    }
    function startGame(num){
        playBtnClick();
        navigate(`/game/${num}`);
    }

    return (
        <div className="buttons">

            <div className="buttons__group">
                <button className={`buttons__button ${hideLocalOptions === "" && "buttons__button--active"}`} onClick={toggleLocalOptions}>Play Local Game</button>
                <button className="buttons__button" disabled>Play Multiplayer Game</button>
            </div>
            <div className={`buttons__group ${hideLocalOptions}`}>
                <p>Select # of Players:</p>
                <button className="buttons__button" onClick={() => startGame(1)}>1</button>
                <button className="buttons__button" onClick={() => startGame(2)}>2</button>
                <button className="buttons__button" onClick={() => startGame(3)}>3</button>
            </div>
            
        </div>
    )
}