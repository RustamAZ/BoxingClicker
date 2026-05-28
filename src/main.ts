import StartGame from './game/main';
import { AppLoadingScreen } from './game/loading/AppLoadingScreen';

const loadGameFont = async () => {
    if (!('fonts' in document)) {
        return;
    }

    await document.fonts.load('16px "Hardpixel"').catch(() => undefined);
};

document.addEventListener('DOMContentLoaded', async () => {

    AppLoadingScreen.show();
    await loadGameFont();
    StartGame('game-container');

});
