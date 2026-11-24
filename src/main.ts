import StartGame from './game/main';
import { AppLoadingScreen } from './game/loading/AppLoadingScreen';
import { languageController } from './game/localization/LanguageController';
import { PlayerProfile, useTrailerProfile } from './game/entities/Player/PlayerProfile';
import { getGamePlatform, initializeGamePlatform } from './game/platform/yandex';

const loadGameFont = async () => {
    if (!('fonts' in document)) {
        return;
    }

    await document.fonts.load('16px "Hardpixel"').catch(() => undefined);
};

document.addEventListener('DOMContentLoaded', async () => {

    AppLoadingScreen.show();
    const platform = useTrailerProfile ? getGamePlatform() : await initializeGamePlatform();

    const language = platform.getLanguage();

    languageController.setLanguage(language);
    document.documentElement.lang = language;
    AppLoadingScreen.refreshTexts();

    if (useTrailerProfile) {
        await loadGameFont();
    } else {
        const [cloudProfile] = await Promise.all([
            platform.loadProfile(),
            loadGameFont(),
        ]);
        const selectedProfile = PlayerProfile.selectNewestProfile(
            PlayerProfile.getStoredProfile(),
            cloudProfile,
        );

        PlayerProfile.setBootstrapProfile(selectedProfile);
    }

    StartGame('game-container');

});
