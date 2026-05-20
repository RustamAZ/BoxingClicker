import StartGame from './game/main';

const loadGameFont = async () => {
    if (!('fonts' in document)) {
        return;
    }

    await document.fonts.load('16px "Hardpixel"');
};

document.addEventListener('DOMContentLoaded', async () => {

    await loadGameFont();
    StartGame('game-container');

});
