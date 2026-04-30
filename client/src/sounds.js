import winSfx from '../sfx/win-sfx.mp3';
import loseSfx from '../sfx/lose-sfx.mp3';
import buttonSfx from '../sfx/button-sfx.wav';

const winAudio = new Audio(winSfx);
const loseAudio = new Audio(loseSfx);
const buttonAudio = new Audio(buttonSfx);

const playSound = (audio) => {
    try {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
        console.error(e);
    }
};

export const playWinSound = () => playSound(winAudio);
export const playLoseSound = () => playSound(loseAudio);
export const playButtonSound = () => playSound(buttonAudio);
