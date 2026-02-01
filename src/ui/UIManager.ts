// UI 관리자 - 통합 레이어
import Phaser from 'phaser';
import { CommonUI, CommonUIState } from './common/CommonUI';
import { SkillUseButtons, SkillUseButtonsState } from './common/SkillUseButtons';
import { TabSystem, TabSystemState } from './tabs/TabSystem';
import { StatsTab, StatsTabState } from './tabs/StatsTab';
import { UpgradeTab, UpgradeTabState } from './tabs/UpgradeTab';
import { SkillTab, SkillTabState } from './tabs/SkillTab';
import { DungeonTab, DungeonTabState } from './tabs/DungeonTab';
import { ArtifactTab, ArtifactTabState } from './tabs/ArtifactTab';
import { MenuButtonConfigs } from './menu/MenuButtonConfig';
import { EggGachaPopup, EggGachaPopupState } from './feature/EggGachaPopup';
import { GemPopup, GemPopupState } from './feature/GemPopup';
import { FeatureMenuPopup } from './feature/FeatureMenuPopup';

// UI 관리자
export const UIManager = {
    // 상태 관리
    commonState: {
        coinText: null as Phaser.GameObjects.Text | null,
        rubyText: null as Phaser.GameObjects.Text | null,
        meatText: null as Phaser.GameObjects.Text | null,
        stageText: null as Phaser.GameObjects.Text | null,
        killCountText: null as Phaser.GameObjects.Text | null,
        bossTimerText: null as Phaser.GameObjects.Text | null,
        dungeonTimerText: null as Phaser.GameObjects.Text | null,
        skipBossCheckbox: null as Phaser.GameObjects.Container | null,
        activeTabIndex: 0,
        menuPopupState: {
            menuButton: null,
            popupOverlay: null,
            popupContainer: null,
            closeButton: null,
            isOpen: false,
            popupButtons: [],
            buttonConfigs: []
        },
        featureMenuPopupState: {
            featureButton: null,
            popupPanel: null,
            isOpen: false,
            featureButtons: [],
            buttonConfigs: []
        },
        eggGachaPopupState: {
            popupOverlay: null,
            popupContainer: null,
            closeButton: null,
            tabButtons: [],
            activeTab: 'draw',
            isOpen: false,
            drawPanel: null,
            listPanel: null,
            listCards: [],
            drawButton: null,
            eggImage: null,
            glowEffect: null,
            cardOverlay: null,
            cardContainer: null,
            cards: [],
            rewards: [],
            openedCards: [],
            isCardOpening: false,
            confirmButton: null,
            descriptionOverlay: null,
            descriptionContainer: null
        } as EggGachaPopupState,
        gemPopupState: {
            popupOverlay: null,
            popupContainer: null,
            closeButton: null,
            isOpen: false,
            gemImage: null,
            statCards: [],
            upgradeButton: null,
            statTexts: []
        } as GemPopupState
    } as CommonUIState,
    
    tabSystemState: {
        tabs: [] as Phaser.GameObjects.Rectangle[],
        tabTexts: [] as Phaser.GameObjects.Text[],
        tabContents: [] as Phaser.GameObjects.Container[],
        activeTabIndex: 0
    } as TabSystemState,
    
    statsTabState: {
        statCards: [] as Phaser.GameObjects.Container[],
        statTexts: [] as Phaser.GameObjects.Text[],
        detailButton: null as Phaser.GameObjects.Container | null,
        statsDetailPopupState: {
            popupOverlay: null,
            popupContainer: null,
            closeButton: null,
            statCards: [],
            scrollContainer: null,
            scrollArea: null,
            scrollStartY: 0,
            scrollStartContainerY: 0,
            isScrolling: false,
            isOpen: false
        }
    } as StatsTabState,
    
    upgradeTabState: {
        upgradeCards: [] as Phaser.GameObjects.Container[],
        attackPowerCard: null as Phaser.GameObjects.Container | null,
        attackSpeedCard: null as Phaser.GameObjects.Container | null,
        critChanceCard: null as Phaser.GameObjects.Container | null,
        critDamageCard: null as Phaser.GameObjects.Container | null,
        spPurchaseCard: null as Phaser.GameObjects.Container | null
    } as UpgradeTabState,
    
    skillTabState: {
        skillCards: [] as Phaser.GameObjects.Container[],
        skillSpText: null as Phaser.GameObjects.Text | null,
        skillUseButtonsState: {
            skillUseButtons: [] as Phaser.GameObjects.Arc[],
            skillUseButtonBgs: [] as Phaser.GameObjects.Graphics[],
            skillUseButtonIcons: [] as Phaser.GameObjects.Image[],
            skillUseButtonTexts: [] as Phaser.GameObjects.Text[],
            skillUseCooldownTexts: [] as Phaser.GameObjects.Text[],
            skillUseCooldownMasks: [] as Phaser.GameObjects.Graphics[],
            skillUseCooldownStates: [] as { isInCooldown: boolean; lastSecond: number }[],
            skillBuffDurationMasks: [] as (Phaser.GameObjects.Graphics | null)[],
            skillAutoButtons: [] as Phaser.GameObjects.Rectangle[],
            skillAutoButtonBgs: [] as Phaser.GameObjects.Graphics[],
            skillAutoButtonTexts: [] as Phaser.GameObjects.Text[]
        } as SkillUseButtonsState
    } as SkillTabState,
    
    dungeonTabState: {
        dungeonCards: [] as Phaser.GameObjects.Container[]
    } as DungeonTabState,
    
    artifactTabState: {
        artifactCards: [] as Phaser.GameObjects.Container[],
        scrollContainer: null as Phaser.GameObjects.Container | null,
        scrollArea: null as Phaser.GameObjects.Rectangle | null,
        scrollStartY: 0,
        scrollStartContainerY: 0,
        isScrolling: false,
        rubyText: null as Phaser.GameObjects.Text | null
    } as ArtifactTabState,
    
    // UI 생성 (아래쪽 절반 영역에 배치)
    create(scene: Phaser.Scene): void {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const halfHeight = gameHeight * 0.5;
        const uiAreaHeight = gameHeight * 0.5;
        const uiAreaStartY = halfHeight;
        
        // 공통 UI 요소 생성
        CommonUI.createCommonElements(scene, this.commonState);
        
        // 탭 시스템 생성
        TabSystem.createTabs(scene, gameWidth, gameHeight, uiAreaHeight, this.tabSystemState, (tabIndex: number) => {
            this.switchTab(tabIndex, scene);
        });
        
        // 각 탭 내용 생성
        StatsTab.createStatsTab(scene, gameWidth, uiAreaHeight, uiAreaStartY, this.statsTabState, this.tabSystemState.tabContents);
        UpgradeTab.createUpgradeTab(scene, gameWidth, uiAreaHeight, uiAreaStartY, 1, this.upgradeTabState, this.tabSystemState.tabContents);
        SkillTab.createSkillTab(scene, gameWidth, uiAreaHeight, uiAreaStartY, 2, this.skillTabState, this.tabSystemState.tabContents);
        DungeonTab.createDungeonTab(
            scene,
            gameWidth,
            uiAreaHeight,
            uiAreaStartY,
            3,
            this.dungeonTabState,
            this.tabSystemState.tabContents,
            DungeonTab.createDungeonCard
        );
        ArtifactTab.createArtifactTab(
            scene,
            gameWidth,
            uiAreaHeight,
            uiAreaStartY,
            4,
            this.artifactTabState,
            this.tabSystemState.tabContents
        );
        
        // 초기 탭 활성화
        this.switchTab(0, scene);
        
        // 스킬 사용 버튼 생성 (습득한 스킬이 있는 경우)
        this.createSkillUseButtons(scene);
        
        // 메뉴 팝업 버튼 설정
        this.setupMenuButtons(scene);
        
        // Feature 버튼 설정
        this.setupFeatureButtons(scene);
    },
    
    // 메뉴 팝업 버튼 설정
    setupMenuButtons(_scene: Phaser.Scene): void {
        this.commonState.menuPopupState.buttonConfigs = MenuButtonConfigs;
    },
    
    // Feature 버튼 설정
    setupFeatureButtons(_scene: Phaser.Scene): void {
        const state = this.commonState.featureMenuPopupState;
        
        // 이미 알 뽑기 버튼이 추가되어 있는지 확인
        const hasEggGachaButton = state.buttonConfigs.some(config => config.label === '알 뽑기');
        
        if (!hasEggGachaButton) {
            // 알 뽑기 버튼 추가
            FeatureMenuPopup.addFeatureButton(
                state,
                {
                    icon: '🥚',
                    label: '알 뽑기',
                    onClick: (scene: Phaser.Scene) => {
                        EggGachaPopup.show(scene, this.commonState.eggGachaPopupState);
                    }
                }
            );
        }
        
        // 이미 보옥 버튼이 추가되어 있는지 확인
        const hasGemButton = state.buttonConfigs.some(config => config.label === '보옥');
        
        if (!hasGemButton) {
            // 보옥 버튼 추가
            FeatureMenuPopup.addFeatureButton(
                state,
                {
                    icon: '💎',
                    label: '보옥',
                    onClick: (scene: Phaser.Scene) => {
                        GemPopup.show(scene, this.commonState.gemPopupState);
                    }
                }
            );
        }
    },
    
    // 던전 씬용 UI 생성
    createForDungeon(scene: Phaser.Scene, dungeonName: string, dungeonLevel: number): void {
        CommonUI.createForDungeon(scene, dungeonName, dungeonLevel, this.commonState);
    },
    
    // 탭 전환
    switchTab(tabIndex: number, scene?: Phaser.Scene): void {
        this.commonState.activeTabIndex = tabIndex;
        this.tabSystemState.activeTabIndex = tabIndex;
        
        // 유물 탭(4번)일 경우 항상 최신 데이터로 재생성
        if (tabIndex === 4 && scene) {
            const gameWidth = scene.scale.width;
            const gameHeight = scene.scale.height;
            const halfHeight = gameHeight * 0.5;
            const uiAreaHeight = gameHeight * 0.5;
            const uiAreaStartY = halfHeight;
            
            ArtifactTab.createArtifactTab(
                scene,
                gameWidth,
                uiAreaHeight,
                uiAreaStartY,
                tabIndex,
                this.artifactTabState,
                this.tabSystemState.tabContents
            );
        }
        
        TabSystem.switchTab(tabIndex, this.tabSystemState);
    },
    
    // 스킬 탭 생성 (외부에서 호출 가능)
    createSkillTab(scene: Phaser.Scene, gameWidth: number, _gameHeight: number, _halfHeight: number, uiAreaHeight: number, uiAreaStartY: number, tabIndex: number): void {
        SkillTab.createSkillTab(scene, gameWidth, uiAreaHeight, uiAreaStartY, tabIndex, this.skillTabState, this.tabSystemState.tabContents);
    },
    
    // 스킬 사용 버튼 생성
    createSkillUseButtons(scene: Phaser.Scene): void {
        SkillUseButtons.createSkillUseButtons(scene, this.skillTabState.skillUseButtonsState);
    },
    
    // UI 업데이트
    update(scene?: Phaser.Scene): void {
        // 공통 UI 업데이트
        CommonUI.update(scene, this.commonState);
        
        // Stats 탭 업데이트
        StatsTab.update(this.statsTabState, this.commonState.activeTabIndex);
        
        // Upgrade 탭 업데이트
        if (scene) {
            UpgradeTab.update(scene, this.upgradeTabState, this.commonState.activeTabIndex);
        }
        
        // Skill 탭 업데이트
        if (scene) {
            SkillTab.update(scene, this.skillTabState, this.commonState.activeTabIndex);
            // 스킬 사용 버튼 업데이트
            SkillUseButtons.updateSkillUseButtons(scene, this.skillTabState.skillUseButtonsState);
        }
        
        // 유물 탭 루비 텍스트 업데이트
        ArtifactTab.updateRubyText(this.artifactTabState);
    }
};
