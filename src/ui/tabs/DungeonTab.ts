// Dungeon 탭 UI
import Phaser from 'phaser';
import { Responsive } from '../../utils/Responsive';
import { GameState } from '../../managers/GameState';
import { DungeonConfigs, DungeonConfig } from '../../config/dungeonConfig';
import { Effects } from '../../utils/Effects';
import { ArtifactConfigs, ArtifactConfig, AddArtifactRate } from '../../config/artifactConfig';
import { UIManager } from '../UIManager';
import { DungeonBossReward } from '../../game/boss/DungeonBossReward';
import { ArtifactTab } from './ArtifactTab';

export interface DungeonTabState {
    dungeonCards: Phaser.GameObjects.Container[];
}

export const DungeonTab = {
    // Dungeon 탭 내용 생성
    createDungeonTab(
        scene: Phaser.Scene,
        gameWidth: number,
        uiAreaHeight: number,
        uiAreaStartY: number,
        tabIndex: number,
        state: DungeonTabState,
        tabContents: Phaser.GameObjects.Container[],
        createDungeonCard: (scene: Phaser.Scene, dungeonConfig: any, x: number, y: number, width: number, height: number) => Phaser.GameObjects.Container
    ): void {
        // 기존 탭 컨텐츠 제거
        if (tabContents[tabIndex]) {
            tabContents[tabIndex].destroy();
            tabContents[tabIndex] = null as any;
        }
        
        // 기존 던전 카드들 제거
        state.dungeonCards.forEach(card => card.destroy());
        
        // 던전 배열 초기화
        state.dungeonCards = [];
        
        const contentContainer = scene.add.container(0, 0);

        // 타이틀
        const titleFontSize = Responsive.getFontSize(scene, 22);
        const titleY = uiAreaStartY + uiAreaHeight * 0.08;
        const titleText = scene.add.text(gameWidth / 2, titleY, '던전', {
            fontSize: titleFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${titleFontSize} Arial`
        });
        titleText.setOrigin(0.5);
        contentContainer.add(titleText);

        // 던전 카드 영역 (세로 배치)
        const dungeonCardStartY = titleY + uiAreaHeight * 0.15;
        const dungeonCardWidth = gameWidth * 0.95;
        const dungeonCardHeight = uiAreaHeight * 0.15; // 한 줄 레이아웃에 맞게 높이 설정
        const dungeonCardSpacing = uiAreaHeight * 0.02; // 세로 간격
        const cardX = gameWidth / 2; // 카드는 중앙 정렬

        // 각 던전에 대해 카드 생성 (세로로 배치)
        DungeonConfigs.forEach((dungeonConfig, index) => {
            const cardY = dungeonCardStartY + index * (dungeonCardHeight + dungeonCardSpacing);
            const dungeonCard = createDungeonCard(scene, dungeonConfig, cardX, cardY, dungeonCardWidth, dungeonCardHeight);
            contentContainer.add(dungeonCard);
            state.dungeonCards.push(dungeonCard);
        });

        tabContents[tabIndex] = contentContainer;
    },
    
    // 개별 던전 카드 생성
    createDungeonCard(
        scene: Phaser.Scene,
        dungeonConfig: DungeonConfig,
        x: number,
        y: number,
        width: number,
        height: number
    ): Phaser.GameObjects.Container {
        const cardContainer = scene.add.container(x, y);
        const cardRadius = 12;
        const padding = 10;

        // 카드 배경 (이미지가 있으면 이미지 사용, 없으면 단색 배경)
        const backgroundColor = dungeonConfig.backgroundColor || 0x2a2a3a;
        
        if (dungeonConfig.backgroundImageKey) {
            // 배경 이미지가 있는 경우
            const bgImage = scene.add.image(0, 0, dungeonConfig.backgroundImageKey);
            bgImage.setDisplaySize(width, height);
            bgImage.setOrigin(0.5, 0.5);
            // 이미지가 카드 높이를 유지하도록 설정
            const imageScale = height / bgImage.height;
            bgImage.setScale(imageScale);
            cardContainer.add(bgImage);
            
            // 이미지 위에 반투명 레이어 추가 (텍스트 가독성 향상)
            const overlay = scene.add.graphics();
            overlay.fillStyle(0x000000, 0.3);
            overlay.fillRoundedRect(-width / 2, -height / 2, width, height, cardRadius);
            cardContainer.add(overlay);
        } else {
            // 단색 배경 사용
            const cardBg = scene.add.graphics();
            cardBg.fillStyle(backgroundColor, 0.95);
            cardBg.fillRoundedRect(-width / 2, -height / 2, width, height, cardRadius);
            cardBg.lineStyle(2, 0x4a4a5a, 0.8);
            cardBg.strokeRoundedRect(-width / 2, -height / 2, width, height, cardRadius);
            cardContainer.add(cardBg);
        }

        // 한 줄 레이아웃: Name / descText / statusText / 입장 버튼 (가로 일렬 배치)
        const centerY = 0;
        const itemSpacing = padding * 1.5; // 요소 간 간격
        
        // 1. nameText (왼쪽)
        const nameFontSize = Responsive.getFontSize(scene, 14);
        const nameX = -width / 2 + padding;
        const nameText = scene.add.text(nameX, centerY, dungeonConfig.name, {
            fontSize: nameFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${nameFontSize} Arial`
        });
        nameText.setOrigin(0, 0.5);
        cardContainer.add(nameText);

        // 버튼 영역 계산
        const buttonWidth = width * 0.15;
        const buttonAreaWidth = buttonWidth + padding; // 버튼 + 오른쪽 패딩
        
        // 2. descText (nameText 다음, 버튼 영역을 고려한 최대 너비)
        const descFontSize = Responsive.getFontSize(scene, 10);
        const nameTextWidth = nameText.width;
        const descX = nameX + nameTextWidth + itemSpacing;
        // 현재 던전 단계 가져오기
        const dungeonLevel = GameState.getDungeonLevel(dungeonConfig.id);
        const descriptionText = `${dungeonConfig.description} (Lv.${dungeonLevel})`;
        const descText = scene.add.text(descX, centerY, descriptionText, {
            fontSize: descFontSize,
            color: '#b0b0b0',
            fontFamily: 'Arial',
            font: `400 ${descFontSize} Arial`
        });
        descText.setOrigin(0, 0.5);
        // descText가 버튼 영역과 겹치지 않도록 최대 너비 제한
        const maxDescWidth = width / 2 - descX - buttonAreaWidth - itemSpacing * 2;
        if (descText.width > maxDescWidth && maxDescWidth > 0) {
            descText.setWordWrapWidth(maxDescWidth);
        }
        cardContainer.add(descText);

        // 3. statusText (descText 다음, 오른쪽 끝에 배치)
        const statusFontSize = Responsive.getFontSize(scene, 12);
        const descTextWidth = descText.width;
        const statusX = descX + descTextWidth + itemSpacing;

        // 소탕 가능 던전인 경우 남은 횟수 표시, 아니면 무제한
        let statusTextContent = '무제한';
        if (dungeonConfig.enableSweep) {
            const dailyLimit = dungeonConfig.dailySweepLimit;
            const remainingAttempts = GameState.getDungeonRemainingSweepAttempts(dungeonConfig.id, dailyLimit);
            if (dailyLimit !== undefined) {
                statusTextContent = `남은 횟수: ${remainingAttempts}/${dailyLimit}`;
            } else {
                statusTextContent = `남은 횟수: ${remainingAttempts}`;
            }
        }
        
        const statusText = scene.add.text(statusX, centerY, statusTextContent, {
            fontSize: statusFontSize,
            color: '#ffd700',
            fontFamily: 'Arial',
            font: `500 ${statusFontSize} Arial`
        });
        statusText.setOrigin(0, 0.5);
        cardContainer.add(statusText);

        const isArtifactDungeon = dungeonConfig.id === 'artifact_dungeon';
        const isMeatDungeon = dungeonConfig.id === 'meat_dungeon';

        // 4. 버튼 영역 (입장 버튼 + 소탕 버튼(소탕 가능 던전만))
        const buttonHeight = height * 0.5;
        const buttonRadius = 8;
        const buttonSpacing = padding * 1.5; // 버튼 간 간격
        const rightPadding = padding * 0.5; // 오른쪽 패딩
        
        // 소탕 가능 던전인 경우 소탕 버튼도 표시하므로 버튼 너비 조정
        const isSweepDungeon = !!dungeonConfig.enableSweep;
        
        // 카드 오른쪽 끝 위치 (중심 기준)
        const cardRightEdge = width / 2 - rightPadding;
        
        // 버튼 너비 계산 (카드를 벗어나지 않도록)
        let actualButtonWidth: number;
        if (isSweepDungeon) {
            // 두 버튼 + 간격이 카드 안에 들어가도록 계산
            // (cardRightEdge - (버튼2개 + 간격)) / 2 = 각 버튼 너비
            const maxTotalWidth = (cardRightEdge - 0) * 2; // 중심 0부터 오른쪽 끝까지
            const availableWidth = maxTotalWidth - buttonSpacing;
            actualButtonWidth = Math.min(availableWidth / 2, buttonWidth * 0.65); // 최대 buttonWidth * 0.65
        } else {
            actualButtonWidth = buttonWidth * 0.95; // 단일 버튼은 더 크게
        }
        
        const buttonY = centerY;
        
        // 입장 버튼 위치 (소탕 버튼이 있으면 왼쪽으로 이동)
        let enterButtonX: number;
        if (isSweepDungeon) {
            // 소탕 버튼이 카드 오른쪽 끝에 배치되므로, 입장 버튼은 그 왼쪽에 배치
            // 소탕 버튼 중심: cardRightEdge - actualButtonWidth / 2
            // 입장 버튼 중심: 소탕 버튼 중심 - actualButtonWidth - buttonSpacing
            const sweepButtonCenter = cardRightEdge - actualButtonWidth / 2;
            enterButtonX = sweepButtonCenter - actualButtonWidth - buttonSpacing;
        } else {
            // 단일 버튼은 카드 오른쪽에 배치
            enterButtonX = cardRightEdge - actualButtonWidth / 2;
        }

        // 입장 버튼 배경
        const enterButtonBg = scene.add.graphics();
        enterButtonBg.fillStyle(0x50c878, 1);
        enterButtonBg.fillRoundedRect(enterButtonX - actualButtonWidth / 2, buttonY - buttonHeight / 2, actualButtonWidth, buttonHeight, buttonRadius);
        enterButtonBg.lineStyle(2, 0x6ad888, 1);
        enterButtonBg.strokeRoundedRect(enterButtonX - actualButtonWidth / 2, buttonY - buttonHeight / 2, actualButtonWidth, buttonHeight, buttonRadius);
        enterButtonBg.setDepth(100);
        cardContainer.add(enterButtonBg);

        const enterButton = scene.add.rectangle(enterButtonX, buttonY, actualButtonWidth, buttonHeight, 0x000000, 0);
        enterButton.setInteractive({ useHandCursor: true });
        enterButton.setDepth(101);
        
        const dungeonId = dungeonConfig.id;
        const sceneKey = dungeonConfig.sceneKey;
        enterButton.on('pointerdown', () => {
            // 던전 씬으로 전환 (입장 버튼은 횟수 차감 안 함)
            if (sceneKey) {
                scene.scene.start(sceneKey, { dungeonConfig: dungeonConfig });
            } else {
                console.error(`던전 씬 키가 설정되지 않았습니다: ${dungeonId}`);
            }
        });

        enterButton.on('pointerover', () => {
            enterButtonBg.clear();
            enterButtonBg.fillStyle(0x60d888, 1);
            enterButtonBg.fillRoundedRect(enterButtonX - actualButtonWidth / 2, buttonY - buttonHeight / 2, actualButtonWidth, buttonHeight, buttonRadius);
            enterButtonBg.lineStyle(2, 0x7ae898, 1);
            enterButtonBg.strokeRoundedRect(enterButtonX - actualButtonWidth / 2, buttonY - buttonHeight / 2, actualButtonWidth, buttonHeight, buttonRadius);
        });

        enterButton.on('pointerout', () => {
            enterButtonBg.clear();
            enterButtonBg.fillStyle(0x50c878, 1);
            enterButtonBg.fillRoundedRect(enterButtonX - actualButtonWidth / 2, buttonY - buttonHeight / 2, actualButtonWidth, buttonHeight, buttonRadius);
            enterButtonBg.lineStyle(2, 0x6ad888, 1);
            enterButtonBg.strokeRoundedRect(enterButtonX - actualButtonWidth / 2, buttonY - buttonHeight / 2, actualButtonWidth, buttonHeight, buttonRadius);
        });

        cardContainer.add(enterButton);

        const buttonTextFontSize = Responsive.getFontSize(scene, 11);
        const enterButtonText = scene.add.text(enterButtonX, buttonY, '입장', {
            fontSize: buttonTextFontSize,
            color: '#ffffff',
            fontFamily: 'Arial',
            font: `600 ${buttonTextFontSize} Arial`
        });
        enterButtonText.setOrigin(0.5);
        enterButtonText.setDepth(102);
        cardContainer.add(enterButtonText);

        // 유물 던전 카드 클릭 이벤트 (카드 영역 클릭 시 정보 팝업 표시)
        // 주의: 버튼은 depth 100 이상이므로 버튼 클릭이 우선 처리됨
        if (isArtifactDungeon) {
            // 카드 배경 Graphics에 클릭 이벤트 추가
            // Container 내부의 요소는 직접 클릭 이벤트를 추가하는 것이 더 안전함
            const cardBgForClick = cardContainer.list.find((obj: any) => obj.type === 'Graphics') as Phaser.GameObjects.Graphics | undefined;
            
            if (cardBgForClick) {
                // 기존 카드 배경에 클릭 이벤트 추가
                cardBgForClick.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);
                cardBgForClick.setDepth(1); // 낮은 depth
                
                cardBgForClick.on('pointerdown', () => {
                    // 버튼은 depth가 높아서 버튼 클릭 시 여기까지 오지 않음
                    // 따라서 여기까지 오면 카드 영역(버튼 제외) 클릭
                    Effects.showArtifactDungeonInfoPopup(scene);
                });
            } else {
                // 배경이 없는 경우 별도 클릭 영역 생성 (안전한 방법)
                const cardClickArea = scene.add.zone(0, 0, width, height);
                cardClickArea.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);
                cardClickArea.setDepth(1);
                
                cardClickArea.on('pointerdown', () => {
                    Effects.showArtifactDungeonInfoPopup(scene);
                });
                
                cardContainer.add(cardClickArea);
            }
        }

        // 소탕 버튼 (소탕 가능 던전 공통)
        if (isSweepDungeon) {
            // 소탕 버튼 위치 (입장 버튼 오른쪽에 배치, 카드 오른쪽 끝 기준)
            const sweepButtonX = cardRightEdge - actualButtonWidth / 2;

            // 소탕 설정값
            const dungeonId = dungeonConfig.id;
            const currentDungeonLevel = GameState.getDungeonLevel(dungeonId);
            const minSweepLevel = dungeonConfig.sweepMinLevel ?? 2;
            const dailyLimit = dungeonConfig.dailySweepLimit;

            // 소탕 가능 여부 확인 (공통 API)
            const canSweep = GameState.canSweepDungeon(dungeonId, currentDungeonLevel, minSweepLevel, dailyLimit);
            
            // 소탕 버튼 배경 (활성화/비활성화에 따라 색상 변경)
            const sweepButtonBg = scene.add.graphics();
            const sweepButtonColor = canSweep ? 0x4169e1 : 0x555555; // 활성화: 파란색, 비활성화: 회색
            const sweepButtonLineColor = canSweep ? 0x5b7ce1 : 0x666666;
            sweepButtonBg.fillStyle(sweepButtonColor, 1);
            sweepButtonBg.fillRoundedRect(sweepButtonX - actualButtonWidth / 2, buttonY - buttonHeight / 2, actualButtonWidth, buttonHeight, buttonRadius);
            sweepButtonBg.lineStyle(2, sweepButtonLineColor, 1);
            sweepButtonBg.strokeRoundedRect(sweepButtonX - actualButtonWidth / 2, buttonY - buttonHeight / 2, actualButtonWidth, buttonHeight, buttonRadius);
            sweepButtonBg.setDepth(100);
            cardContainer.add(sweepButtonBg);

            const sweepButton = scene.add.rectangle(sweepButtonX, buttonY, actualButtonWidth, buttonHeight, 0x000000, 0);
            if (canSweep) {
                sweepButton.setInteractive({ useHandCursor: true });
            }
            sweepButton.setDepth(101);
            
            sweepButton.on('pointerdown', () => {
                if (!canSweep) return;

                // 소탕 가능 여부 재확인 (공통 API)
                const level = GameState.getDungeonLevel(dungeonId);
                if (!GameState.canSweepDungeon(dungeonId, level, minSweepLevel, dailyLimit)) {
                    return;
                }

                // 보상 계산
                let rubyReward = 0;
                let goldReward = 0;
                let meatReward = 0;

                if (isArtifactDungeon) {
                    // 유물 던전: (현재 층수 - 1) 루비
                    rubyReward = Math.max(0, level - 1);
                } else if (dungeonId === 'gold_dungeon') {
                    // 골드 던전: a안 유지
                    // (현재 레벨 - 1)회 만큼, 현재 레벨 한 번 클리어 시 얻는 골드를 지급
                    // (던전 보스 보상 계산과 동일한 스케일을 사용)
                    goldReward = DungeonBossReward.getGoldRewardValue(dungeonConfig, level);
                } else if (isMeatDungeon) {
                    // 고기 던전: 층수 * 10 개의 고기
                    meatReward = level * 10;
                }

                const hasReward = rubyReward > 0 || goldReward > 0 || meatReward > 0;

                if (hasReward) {
                    // 보상 지급
                    if (rubyReward > 0) {
                        GameState.addRubies(rubyReward);
                    }
                    if (goldReward > 0) {
                        GameState.addCoins(goldReward);
                    }
                    if (meatReward > 0) {
                        GameState.addMeat(meatReward);
                    }

                    // 횟수 차감 (공통)
                    if (GameState.useDungeonSweepAttempt(dungeonId, dailyLimit)) {
                        // 소탕 횟수 증가 (누적 통계)
                        GameState.incrementDungeonSweepCount(dungeonId);

                        // 유물 던전 전용: AddArtifactRate 확률로 유물 획득
                        let obtainedArtifact: ArtifactConfig | null = null;
                        if (isArtifactDungeon && rubyReward > 0 && Math.random() < AddArtifactRate) {
                            const availableArtifacts = ArtifactConfigs.filter(artifact => {
                                const currentLevel = GameState.getArtifactLevel(artifact.id);
                                return currentLevel < artifact.maxLevel;
                            });

                            if (availableArtifacts.length > 0) {
                                const randomIndex = Math.floor(Math.random() * availableArtifacts.length);
                                obtainedArtifact = availableArtifacts[randomIndex];
                                GameState.incrementArtifactLevel(obtainedArtifact.id);
                            }
                        }
                        // 성공 피드백
                        if (rubyReward > 0) {
                            Effects.createDungeonRewardParticle(scene, sweepButtonX, buttonY, rubyReward, ' 루비', '#ff6b9d');
                        }
                        if (goldReward > 0) {
                            Effects.createDungeonRewardParticle(scene, sweepButtonX, buttonY, goldReward, '', '#ffd700');
                        }
                        if (meatReward > 0) {
                            Effects.createDungeonRewardParticle(scene, sweepButtonX, buttonY, meatReward, ' 고기', '#ff6b9d');
                        }

                        // 던전 타입별 보상 팝업
                        if (isArtifactDungeon) {
                            // 유물 던전: 기존 루비/유물 팝업
                            Effects.showSweepCompletePopup(scene, rubyReward, obtainedArtifact);
                        } else if (dungeonId === 'gold_dungeon' && goldReward > 0) {
                            // 골드 던전: 골드 소탕 팝업
                            Effects.showGoldSweepCompletePopup(scene, goldReward);
                        } else if (isMeatDungeon && meatReward > 0) {
                            // 먹이 던전: 고기 소탕 팝업
                            Effects.showMeatSweepCompletePopup(scene, meatReward);
                        }

                        // 상태 텍스트 업데이트 (공통)
                        const remainingAttempts = GameState.getDungeonRemainingSweepAttempts(dungeonId, dailyLimit);
                        if (dailyLimit !== undefined) {
                            statusText.setText(`남은 횟수: ${remainingAttempts}/${dailyLimit}`);
                        } else {
                            statusText.setText(`남은 횟수: ${remainingAttempts}`);
                        }

                        // 유물 탭 UI 업데이트 (유물 던전 한정)
                        if (isArtifactDungeon && obtainedArtifact) {
                            if (UIManager.commonState.activeTabIndex === 4) {
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
                                    4,
                                    UIManager.artifactTabState,
                                    UIManager.tabSystemState.tabContents
                                );
                            }
                        }

                        // 소탕 버튼 상태 업데이트 (공통)
                        const newCanSweep = GameState.canSweepDungeon(dungeonId, level, minSweepLevel, dailyLimit);
                        if (!newCanSweep) {
                            sweepButton.removeInteractive();
                            sweepButtonBg.clear();
                            sweepButtonBg.fillStyle(0x555555, 1);
                            sweepButtonBg.fillRoundedRect(sweepButtonX - actualButtonWidth / 2, buttonY - buttonHeight / 2, actualButtonWidth, buttonHeight, buttonRadius);
                            sweepButtonBg.lineStyle(2, 0x666666, 1);
                            sweepButtonBg.strokeRoundedRect(sweepButtonX - actualButtonWidth / 2, buttonY - buttonHeight / 2, actualButtonWidth, buttonHeight, buttonRadius);
                        }
                    }
                }
            });

            if (canSweep) {
                sweepButton.on('pointerover', () => {
                    sweepButtonBg.clear();
                    sweepButtonBg.fillStyle(0x5179f1, 1);
                    sweepButtonBg.fillRoundedRect(sweepButtonX - actualButtonWidth / 2, buttonY - buttonHeight / 2, actualButtonWidth, buttonHeight, buttonRadius);
                    sweepButtonBg.lineStyle(2, 0x6b8ff1, 1);
                    sweepButtonBg.strokeRoundedRect(sweepButtonX - actualButtonWidth / 2, buttonY - buttonHeight / 2, actualButtonWidth, buttonHeight, buttonRadius);
                });

                sweepButton.on('pointerout', () => {
                    sweepButtonBg.clear();
                    sweepButtonBg.fillStyle(0x4169e1, 1);
                    sweepButtonBg.fillRoundedRect(sweepButtonX - actualButtonWidth / 2, buttonY - buttonHeight / 2, actualButtonWidth, buttonHeight, buttonRadius);
                    sweepButtonBg.lineStyle(2, 0x5b7ce1, 1);
                    sweepButtonBg.strokeRoundedRect(sweepButtonX - actualButtonWidth / 2, buttonY - buttonHeight / 2, actualButtonWidth, buttonHeight, buttonRadius);
                });
            }

            cardContainer.add(sweepButton);

            const sweepButtonText = scene.add.text(sweepButtonX, buttonY, '소탕', {
                fontSize: buttonTextFontSize,
                color: canSweep ? '#ffffff' : '#aaaaaa',
                fontFamily: 'Arial',
                font: `600 ${buttonTextFontSize} Arial`
            });
            sweepButtonText.setOrigin(0.5);
            sweepButtonText.setDepth(102);
            cardContainer.add(sweepButtonText);
        }

        return cardContainer;
    }
};
