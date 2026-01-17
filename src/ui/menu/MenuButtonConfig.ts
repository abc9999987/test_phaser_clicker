// 메뉴 팝업 버튼 설정
import Phaser from 'phaser';
import { PopupButtonConfig } from './MenuPopup';
import { SignUpController } from './controllers/SignUp/SignUpController';
import { LoginController } from './controllers/Login/LoginController';
import { SaveController } from './controllers/Save/SaveController';

// 메뉴 팝업 버튼 설정 목록
export const MenuButtonConfigs: PopupButtonConfig[] = [
    {
        text: 'SignUp',
        onClick: (scene: Phaser.Scene) => {
            SignUpController.handleSignUp(scene);
        }
    },
    {
        text: 'Login',
        onClick: (scene: Phaser.Scene) => {
            LoginController.handleLogin(scene);
        }
    },
    {
        text: 'Save',
        onClick: (scene: Phaser.Scene) => {
            SaveController.handleSave(scene);
        }
    }
    // 추가 버튼은 여기에 추가하세요
    // 예:
    // {
    //     text: 'Settings',
    //     onClick: (scene: Phaser.Scene) => {
    //         SettingsController.handleSettings(scene);
    //     }
    // }
];
