// 메뉴 팝업 버튼 설정
import Phaser from 'phaser';
import { PopupButtonConfig } from './MenuPopup';
import { SignUpController } from './controllers/SignUp/SignUpController';
import { LoginController } from './controllers/Login/LoginController';
import { SaveController } from './controllers/Save/SaveController';
import { GameStateCore } from '../../managers/state/GameStateCore';

// 메뉴 팝업 버튼 설정 목록
export const MenuButtonConfigs: PopupButtonConfig[] = [
    {
        text: 'SignUp',
        onClick: (scene: Phaser.Scene) => {
            SignUpController.handleSignUp(scene);
        },
        // uuid가 없을 때만 표시
        shouldShow: () => !GameStateCore.uuid
    },
    {
        text: 'Login',
        onClick: (scene: Phaser.Scene) => {
            LoginController.handleLogin(scene);
        }
        // 항상 표시 (조건 없음)
    },
    {
        text: 'Save',
        onClick: (scene: Phaser.Scene) => {
            SaveController.handleSave(scene);
        },
        // uuid가 있을 때만 표시
        shouldShow: () => !!GameStateCore.uuid
    }
    // 추가 버튼은 여기에 추가하세요
    // 예:
    // {
    //     text: 'Settings',
    //     onClick: (scene: Phaser.Scene) => {
    //         SettingsController.handleSettings(scene);
    //     },
    //     shouldShow: () => true // 조건부 표시가 필요하면 추가
    // }
];
