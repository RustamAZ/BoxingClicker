const loadGameFont = async () => {
    if (!('fonts' in document)) {
        return;
    }

    await document.fonts.load('16px "Hardpixel"').catch(() => undefined);
};

const makeWritableBrowserApi = <T extends object, K extends PropertyKey>(
    target: T,
    key: K,
    value: unknown
) => {
    try {
        Object.defineProperty(target, key, {
            value,
            writable: true,
            configurable: true
        });
    } catch {
        // Some embedded browsers expose these fields as non-configurable.
        // In that case we leave them untouched and let Phaser handle fallback checks.
    }
};

const preparePhaserDeviceDetection = () => {
    const browserNavigator = navigator as Navigator & {
        getUserMedia?: unknown;
        webkitGetUserMedia?: unknown;
        mozGetUserMedia?: unknown;
        msGetUserMedia?: unknown;
        oGetUserMedia?: unknown;
        vibrate?: unknown;
        webkitVibrate?: unknown;
        mozVibrate?: unknown;
        msVibrate?: unknown;
    };

    const browserWindow = window as Window & {
        URL?: unknown;
        webkitURL?: unknown;
        mozURL?: unknown;
        msURL?: unknown;
    };

    makeWritableBrowserApi(
        browserNavigator,
        'getUserMedia',
        browserNavigator.getUserMedia ||
            browserNavigator.webkitGetUserMedia ||
            browserNavigator.mozGetUserMedia ||
            browserNavigator.msGetUserMedia ||
            browserNavigator.oGetUserMedia
    );

    makeWritableBrowserApi(
        browserWindow,
        'URL',
        browserWindow.URL ||
            browserWindow.webkitURL ||
            browserWindow.mozURL ||
            browserWindow.msURL
    );

    makeWritableBrowserApi(
        browserNavigator,
        'vibrate',
        browserNavigator.vibrate ||
            browserNavigator.webkitVibrate ||
            browserNavigator.mozVibrate ||
            browserNavigator.msVibrate
    );
};

document.addEventListener('DOMContentLoaded', async () => {

    await loadGameFont();
    preparePhaserDeviceDetection();

    const { default: StartGame } = await import('./game/main');

    StartGame('game-container');

});
