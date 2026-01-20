import Phaser from 'phaser';
import { NumberFormatter } from './NumberFormatter';
import { ArtifactConfig, AddArtifactRate } from '../config/artifactConfig';

// 효과 유틸리티
export const Effects = {
    // 애니메이션 추적을 위한 맵 (타겟별 애니메이션 참조 저장)
    activeAnimations: new Map<Phaser.GameObjects.GameObject, Phaser.Tweens.Tween>(),
    
    // 코인 파티클 효과 생성 (황금색, + 형식)
    createCoinParticle(scene: Phaser.Scene, x: number, y: number, amount: number = 1): void {
        // 소수점 제거하고 정수로 표시
        const displayAmount = Math.floor(amount);
        const coin = scene.add.text(x, y, `+${NumberFormatter.formatNumber(displayAmount)}`, {
            font: 'bold 20px Arial',
            color: '#ffd700' // 황금색
        });
        coin.setOrigin(0.5);
        
        scene.tweens.add({
            targets: coin,
            y: y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => coin.destroy()
        });
    },
    
    // 루비 파티클 효과 생성 (분홍색, + 형식)
    createRubyParticle(scene: Phaser.Scene, x: number, y: number, amount: number = 1): void {
        // 소수점 제거하고 정수로 표시
        const displayAmount = Math.floor(amount);
        const ruby = scene.add.text(x, y, `+${NumberFormatter.formatNumber(displayAmount)} 루비`, {
            font: 'bold 20px Arial',
            color: '#ff6b9d' // 분홍색
        });
        ruby.setOrigin(0.5);
        
        scene.tweens.add({
            targets: ruby,
            y: y - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => ruby.destroy()
        });
    },
    
    // 유물 던전 정보 팝업 표시
    showArtifactDungeonInfoPopup(scene: Phaser.Scene): void {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;
        
        const popupWidth = 450;
        const popupHeight = 200;
        
        // 전체 화면 오버레이 (팝업 외부 클릭 방지용)
        const overlay = scene.add.rectangle(0, 0, gameWidth, gameHeight, 0x000000, 0.5);
        overlay.setOrigin(0, 0);
        overlay.setDepth(999); // 팝업보다 낮은 depth
        overlay.setInteractive(); // 클릭 이벤트 받기 (팝업 외부 클릭 차단)
        
        // 팝업 배경 (반투명 검은색)
        const popupBg = scene.add.graphics();
        popupBg.fillStyle(0x000000, 0.85);
        popupBg.fillRoundedRect(centerX - popupWidth / 2, centerY - popupHeight / 2, popupWidth, popupHeight, 15);
        popupBg.lineStyle(3, 0x4169e1, 1);
        popupBg.strokeRoundedRect(centerX - popupWidth / 2, centerY - popupHeight / 2, popupWidth, popupHeight, 15);
        popupBg.setDepth(1000);
        
        // 제목 텍스트
        const titleText = scene.add.text(centerX, centerY - 70, '유물 던전 안내', {
            font: 'bold 24px Arial',
            color: '#ffffff'
        });
        titleText.setOrigin(0.5);
        titleText.setDepth(1001);
        
        // 안내 문구 1
        const infoText1 = scene.add.text(centerX, centerY - 20, '던전 입장시에는 횟수가 소모되지 않습니다.', {
            font: '18px Arial',
            color: '#e0e0e0',
            align: 'center',
            wordWrap: { width: popupWidth - 40 }
        });
        infoText1.setOrigin(0.5);
        infoText1.setDepth(1001);
        
        // 안내 문구 2 (AddArtifactRate 사용)
        const artifactRatePercent = Math.floor((AddArtifactRate || 0.1) * 100);
        const infoText2 = scene.add.text(centerX, centerY + 30, `던전 소탕시 횟수가 소모되며 ${artifactRatePercent}% 확률로 온전한 유물을 획득할 수 있습니다.`, {
            font: '18px Arial',
            color: '#e0e0e0',
            align: 'center',
            wordWrap: { width: popupWidth - 40 }
        });
        infoText2.setOrigin(0.5);
        infoText2.setDepth(1001);
        
        // 닫기 버튼
        const closeButtonWidth = 100;
        const closeButtonHeight = 35;
        const closeButtonX = centerX;
        const closeButtonY = centerY + 70;
        
        const closeButtonBg = scene.add.graphics();
        closeButtonBg.fillStyle(0x4169e1, 1);
        closeButtonBg.fillRoundedRect(closeButtonX - closeButtonWidth / 2, closeButtonY - closeButtonHeight / 2, closeButtonWidth, closeButtonHeight, 8);
        closeButtonBg.lineStyle(2, 0x5b7ce1, 1);
        closeButtonBg.strokeRoundedRect(closeButtonX - closeButtonWidth / 2, closeButtonY - closeButtonHeight / 2, closeButtonWidth, closeButtonHeight, 8);
        closeButtonBg.setDepth(1001);
        
        const closeButton = scene.add.rectangle(closeButtonX, closeButtonY, closeButtonWidth, closeButtonHeight, 0x000000, 0);
        // Rectangle의 경우 자동으로 크기를 사용하므로 hitArea 명시 불필요
        closeButton.setInteractive();
        closeButton.setDepth(1002);
        
        const closeButtonText = scene.add.text(closeButtonX, closeButtonY, '확인', {
            font: 'bold 16px Arial',
            color: '#ffffff'
        });
        closeButtonText.setOrigin(0.5);
        closeButtonText.setDepth(1003);
        
        // 닫기 버튼 클릭 이벤트
        const closePopup = () => {
            overlay.destroy();
            popupBg.destroy();
            titleText.destroy();
            infoText1.destroy();
            infoText2.destroy();
            closeButtonBg.destroy();
            closeButton.destroy();
            closeButtonText.destroy();
        };
        
        // 오버레이 클릭 시에도 팝업 닫기 (선택사항, 원하면 주석 처리)
        // overlay.on('pointerdown', closePopup);
        
        closeButton.on('pointerdown', closePopup);
        
        // 호버 효과
        closeButton.on('pointerover', () => {
            closeButtonBg.clear();
            closeButtonBg.fillStyle(0x5179f1, 1);
            closeButtonBg.fillRoundedRect(closeButtonX - closeButtonWidth / 2, closeButtonY - closeButtonHeight / 2, closeButtonWidth, closeButtonHeight, 8);
            closeButtonBg.lineStyle(2, 0x6b8ff1, 1);
            closeButtonBg.strokeRoundedRect(closeButtonX - closeButtonWidth / 2, closeButtonY - closeButtonHeight / 2, closeButtonWidth, closeButtonHeight, 8);
        });
        
        closeButton.on('pointerout', () => {
            closeButtonBg.clear();
            closeButtonBg.fillStyle(0x4169e1, 1);
            closeButtonBg.fillRoundedRect(closeButtonX - closeButtonWidth / 2, closeButtonY - closeButtonHeight / 2, closeButtonWidth, closeButtonHeight, 8);
            closeButtonBg.lineStyle(2, 0x5b7ce1, 1);
            closeButtonBg.strokeRoundedRect(closeButtonX - closeButtonWidth / 2, closeButtonY - closeButtonHeight / 2, closeButtonWidth, closeButtonHeight, 8);
        });
    },
    
    // 소탕 완료 팝업 표시
    showSweepCompletePopup(scene: Phaser.Scene, rubies: number, artifact: ArtifactConfig | null = null): void {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;
        
        // 유물 획득 여부에 따라 팝업 크기 조정
        const hasArtifact = artifact !== null;
        const popupHeight = hasArtifact ? 220 : 160;
        
        // 팝업 배경 (반투명 검은색)
        const popupBg = scene.add.graphics();
        popupBg.fillStyle(0x000000, 0.8);
        popupBg.fillRoundedRect(centerX - 200, centerY - popupHeight / 2, 400, popupHeight, 15);
        popupBg.lineStyle(3, hasArtifact ? 0xffd700 : 0x4169e1, 1); // 유물 획득 시 황금색 테두리
        popupBg.strokeRoundedRect(centerX - 200, centerY - popupHeight / 2, 400, popupHeight, 15);
        popupBg.setDepth(1000);
        
        // 제목 텍스트
        const titleText = scene.add.text(centerX, centerY - (hasArtifact ? 70 : 40), hasArtifact ? '소탕 완료! 유물 획득!' : '소탕 완료!', {
            font: 'bold 28px Arial',
            color: hasArtifact ? '#ffd700' : '#ffffff' // 유물 획득 시 황금색
        });
        titleText.setOrigin(0.5);
        titleText.setDepth(1001);
        
        // 유물 이미지 표시 (획득한 경우)
        let artifactImage: Phaser.GameObjects.Image | null = null;
        let artifactNameText: Phaser.GameObjects.Text | null = null;
        if (hasArtifact && artifact) {
            // 유물 이미지
            if (scene.textures.exists(artifact.imageKey)) {
                artifactImage = scene.add.image(centerX, centerY - 10, artifact.imageKey);
                artifactImage.setDisplaySize(64, 64);
                artifactImage.setOrigin(0.5);
                artifactImage.setDepth(1001);
            }
            
            // 유물 이름 텍스트
            artifactNameText = scene.add.text(centerX, centerY + 30, artifact.name, {
                font: 'bold 20px Arial',
                color: '#ffd700'
            });
            artifactNameText.setOrigin(0.5);
            artifactNameText.setDepth(1001);
        }
        
        // 보상 텍스트 (유물 획득 시 위치 조정)
        const rewardTextY = hasArtifact ? centerY + 60 : centerY + 20;
        const rewardText = scene.add.text(
            centerX, 
            rewardTextY, 
            `루비 ${NumberFormatter.formatNumber(Math.floor(rubies))}개 획득`, 
            {
                font: 'bold 24px Arial',
                color: '#ff6b9d' // 분홍색
            }
        );
        rewardText.setOrigin(0.5);
        rewardText.setDepth(1001);
        
        // 페이드 아웃 애니메이션 (3초 후)
        const targetsToFade: Phaser.GameObjects.GameObject[] = [popupBg, titleText, rewardText];
        if (artifactImage) targetsToFade.push(artifactImage);
        if (artifactNameText) targetsToFade.push(artifactNameText);
        
        scene.tweens.add({
            targets: targetsToFade,
            alpha: 0,
            duration: 500,
            delay: 1500, // 유물 획득 시 조금 더 길게 표시
            ease: 'Power2',
            onComplete: () => {
                popupBg.destroy();
                titleText.destroy();
                rewardText.destroy();
                if (artifactImage) artifactImage.destroy();
                if (artifactNameText) artifactNameText.destroy();
            }
        });
    },

    // 골드 던전 소탕 완료 팝업 표시
    showGoldSweepCompletePopup(scene: Phaser.Scene, gold: number): void {
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        const centerX = gameWidth / 2;
        const centerY = gameHeight / 2;

        const popupHeight = 160;

        // 팝업 배경 (반투명 검은색)
        const popupBg = scene.add.graphics();
        popupBg.fillStyle(0x000000, 0.8);
        popupBg.fillRoundedRect(centerX - 200, centerY - popupHeight / 2, 400, popupHeight, 15);
        popupBg.lineStyle(3, 0xffd700, 1); // 골드 색 테두리
        popupBg.strokeRoundedRect(centerX - 200, centerY - popupHeight / 2, 400, popupHeight, 15);
        popupBg.setDepth(1000);

        // 제목 텍스트
        const titleText = scene.add.text(centerX, centerY - 40, '소탕 완료!', {
            font: 'bold 28px Arial',
            color: '#ffd700'
        });
        titleText.setOrigin(0.5);
        titleText.setDepth(1001);

        // 보상 텍스트
        const rewardText = scene.add.text(
            centerX,
            centerY + 10,
            `${NumberFormatter.formatNumber(Math.floor(gold))} 획득`,
            {
                font: 'bold 24px Arial',
                color: '#ffd700'
            }
        );
        rewardText.setOrigin(0.5);
        rewardText.setDepth(1001);

        // 페이드 아웃 애니메이션
        scene.tweens.add({
            targets: [popupBg, titleText, rewardText],
            alpha: 0,
            duration: 500,
            delay: 1500,
            ease: 'Power2',
            onComplete: () => {
                popupBg.destroy();
                titleText.destroy();
                rewardText.destroy();
            }
        });
    },
    
    // 데미지 파티클 효과 생성
    createDamageParticle(scene: Phaser.Scene, x: number, y: number, damage: number, isSkill: boolean = false, isCrit: boolean = false, isSuperCrit: boolean = false): void {
        // 스킬 데미지는 더 크고 강조된 스타일
        // 슈퍼 치명타는 연보라색, 일반 치명타는 빨간색, 기본은 흰색
        let fontSize: number;
        let color: string;
        let strokeColor: string | undefined;
        let strokeThickness: number;
        
        if (isSkill) {
            // 스킬 데미지
            fontSize = 32;
            color = '#ff4444'; // 빨간색
            strokeColor = '#ffffff';
            strokeThickness = 3;
        } else if (isSuperCrit) {
            // 슈퍼 치명타 데미지
            fontSize = 28;
            color = '#1E90FF'; // 연보라색
            strokeColor = '#00008B'; // 진한 보라색 테두리
            strokeThickness = 2;
        } else if (isCrit) {
            // 일반 치명타 데미지
            fontSize = 24;
            color = '#ff0000'; // 빨간색
            strokeColor = undefined;
            strokeThickness = 0;
        } else {
            // 기본 데미지
            fontSize = 20;
            color = '#ffffff'; // 흰색
            strokeColor = undefined;
            strokeThickness = 0;
        }
        
        const damageText = scene.add.text(x, y, `-${NumberFormatter.formatNumber(Math.floor(damage))}`, {
            font: `bold ${fontSize}px Arial`,
            color: color,
            stroke: strokeColor,
            strokeThickness: strokeThickness
        });
        damageText.setOrigin(0.5);
        
        // 스킬 데미지는 더 크게 위로 올라가고, 약간의 스케일 애니메이션 추가
        const targetY = y - (isSkill ? 70 : isSuperCrit ? 65 : isCrit ? 60 : 50);
        const scale = isSkill ? 1.2 : isSuperCrit ? 1.103 : isCrit ? 1.1 : 1.0;
        
        scene.tweens.add({
            targets: damageText,
            y: targetY,
            scaleX: scale,
            scaleY: scale,
            alpha: 0,
            duration: isSkill ? 1000 : isSuperCrit ? 950 : isCrit ? 900 : 800,
            ease: 'Power2',
            onComplete: () => damageText.destroy()
        });
    },
    
    // 클릭 애니메이션
    playClickAnimation(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject): void {
        // 기존 애니메이션이 있으면 중지
        if (this.activeAnimations.has(target)) {
            const existingTween = this.activeAnimations.get(target);
            if (existingTween) {
                existingTween.stop();
            }
            this.activeAnimations.delete(target);
            
            // 스케일을 원래 값으로 즉시 복원
            const originalScale = (target as Phaser.GameObjects.Image).scaleX || 0.5;
            (target as Phaser.GameObjects.Image).setScale(originalScale, originalScale);
        }
        
        // 원래 스케일 값 저장 (현재 스케일 사용, 없으면 0.5로 가정)
        const originalScale = (target as Phaser.GameObjects.Image).scaleX || 0.5;
        
        // 클릭 시 스케일 증가량
        const clickScale = originalScale * 1.1;
        
        // 새 애니메이션 생성
        const tween = scene.tweens.add({
            targets: target,
            scaleX: clickScale,
            scaleY: clickScale,
            duration: 100,
            yoyo: true,
            ease: 'Power2',
            onComplete: () => {
                // 애니메이션 완료 후 원래 스케일로 명시적으로 복원
                (target as Phaser.GameObjects.Image).setScale(originalScale, originalScale);
                this.activeAnimations.delete(target);
            },
            onStop: () => {
                // 애니메이션이 중지되면 원래 스케일로 복원
                (target as Phaser.GameObjects.Image).setScale(originalScale, originalScale);
                this.activeAnimations.delete(target);
            }
        });
        
        // 애니메이션 참조 저장
        if (tween) {
            this.activeAnimations.set(target, tween);
        }
    }
};
