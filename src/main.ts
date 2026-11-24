import StartGame from './game/main';
import { AppLoadingScreen } from './game/loading/AppLoadingScreen';
import { languageController } from './game/localization/LanguageController';
import { PlayerProfile } from './game/entities/Player/PlayerProfile';
import { initializeGamePlatform } from './game/platform/yandex';

const loadGameFont = async () => {
    if (!('fonts' in document)) {
        return;
    }

    await document.fonts.load('16px "Hardpixel"').catch(() => undefined);
};

document.addEventListener('DOMContentLoaded', async () => {

    AppLoadingScreen.show();
    const platform = await initializeGamePlatform();

    const language = platform.getLanguage();

    languageController.setLanguage(language);
    document.documentElement.lang = language;
    AppLoadingScreen.refreshTexts();

    const [cloudProfile] = await Promise.all([
        platform.loadProfile(),
        loadGameFont(),
    ]);
    const selectedProfile = PlayerProfile.selectNewestProfile(
        PlayerProfile.getStoredProfile(),
        cloudProfile,
    );

    PlayerProfile.setBootstrapProfile(selectedProfile);
    StartGame('game-container');

});
