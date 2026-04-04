import winSfx from '../sfx/win-sfx.mp3';
import loseSfx from '../sfx/lose-sfx.mp3';

export const playWinSound = () => {
    try {
        const audio = new Audio(winSfx);
        audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
        console.error(e);
    }
};

export const playLoseSound = () => {
    try {
        const audio = new Audio(loseSfx);
        audio.play().catch(e => console.log('Audio play failed:', e));
    } catch (e) {
        console.error(e);
    }
};
