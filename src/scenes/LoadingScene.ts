import Phaser from 'phaser';
import { AssetLoader } from '../managers/AssetLoader';

// 로딩 만화 씬
export class LoadingScene extends Phaser.Scene {
    private currentPage: number = 0; // 0: 1~4컷, 1: 5~8컷
    private toonCards: Phaser.GameObjects.Container[] = [];
    private container?: Phaser.GameObjects.Container;
    private tapHint?: Phaser.GameObjects.Container;
    private background?: Phaser.GameObjects.Graphics;
    private pageIndicator?: Phaser.GameObjects.Container;
    private isTransitioning: boolean = false; // 씬 전환 중 플래그

    constructor() {
        super({ key: 'LoadingScene' });
    }

    preload(): void {
        // 에셋 로드
        AssetLoader.preload(this);
    }

    create(): void {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        // 전환 플래그 초기화
        this.isTransitioning = false;

        // 배경 생성 (세련된 그라데이션)
        this.background = this.add.graphics();
        this.background.fillGradientStyle(
            0x0f0c29, 0x0f0c29, 
            0x302b63, 0x24243e, 
            1
        );
        this.background.fillRect(0, 0, gameWidth, gameHeight);
        this.background.setDepth(0);

        // 배경 장식 (빛나는 효과)
        const glow = this.add.graphics();
        glow.fillStyle(0x4a4a8a, 0.1);
        glow.fillCircle(gameWidth * 0.2, gameHeight * 0.3, gameWidth * 0.3);
        glow.fillCircle(gameWidth * 0.8, gameHeight * 0.7, gameWidth * 0.25);
        glow.setDepth(1);

        // 첫 번째 페이지 표시 (1~4컷)
        this.showPage(0);

        // 전체 화면 클릭 이벤트
        const clickArea = this.add.rectangle(
            gameWidth / 2,
            gameHeight / 2,
            gameWidth,
            gameHeight,
            0x000000,
            0
        );
        clickArea.setInteractive({ useHandCursor: true });
        clickArea.setDepth(100);
        clickArea.on('pointerdown', () => {
            // 전환 중이면 클릭 무시
            if (!this.isTransitioning) {
                this.nextPage();
            }
        });
    }

    showPage(page: number): void {
        // 이전 컨테이너 제거
        if (this.container) {
            this.tweens.add({
                targets: this.container,
                alpha: 0,
                y: this.container.y - 50,
                duration: 400,
                ease: 'Power2',
                onComplete: () => {
                    if (this.container) {
                        this.container.destroy();
                    }
                    this.createPageContent(page);
                }
            });
        } else {
            this.createPageContent(page);
        }

        // 페이지 인디케이터 업데이트
        if (this.pageIndicator) {
            this.pageIndicator.destroy();
        }
        this.createPageIndicator(page);
    }

    createPageContent(page: number): void {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        // 메인 컨테이너 생성
        this.container = this.add.container(gameWidth / 2, gameHeight / 2);
        this.container.setDepth(10);
        this.container.setAlpha(0);
        this.container.setY(gameHeight / 2 + 50);

        // 만화 이미지 배치 (지그재그 스타일)
        const startIndex = page === 0 ? 1 : 5; // 1~4 또는 5~8
        const cardWidth = gameWidth * 0.4; // 카드 너비 줄임
        const cardSpacing = gameHeight * - 0.023;
        const totalCardHeight = gameHeight * 0.7; // 전체 카드 영역 높이
        const cardHeight = (totalCardHeight) / 4; // 각 카드 높이
        const offsetX = gameWidth * 0.23; // 좌우 오프셋 (지그재그용)

        this.toonCards = [];

        for (let i = 0; i < 4; i++) {
            const toonIndex = startIndex + i;
            const cardY = (i - 1.53) * (cardHeight + cardSpacing);
            
            // 지그재그 배치: 짝수(0,2)는 왼쪽, 홀수(1,3)는 오른쪽
            const isLeft = startIndex === 1 ? i % 2 === 1 : i % 2 === 0;
            const cardX = isLeft ? -offsetX : offsetX;

            // 카드 컨테이너 생성
            const cardContainer = this.add.container(cardX, cardY);
            cardContainer.setAlpha(0);
            cardContainer.setScale(0.9);

            // 카드 배경 (만화 이미지에 맞춰 최소화)
            const cardBg = this.add.graphics();
            cardBg.fillStyle(0xffffff, 0.95);
            cardBg.fillRoundedRect(
                -cardWidth / 2,
                -cardHeight / 2,
                cardWidth,
                cardHeight,
                12
            );
            
            // 카드 그림자
            const cardShadow = this.add.graphics();
            cardShadow.fillStyle(0x000000, 0.25);
            cardShadow.fillRoundedRect(
                -cardWidth / 2 + 3,
                -cardHeight / 2 + 3,
                cardWidth,
                cardHeight,
                12
            );
            cardShadow.setDepth(-1);
            cardContainer.add(cardShadow);
            cardContainer.add(cardBg);

            // 카드 테두리 (얇게)
            const cardBorder = this.add.graphics();
            cardBorder.lineStyle(2, 0x4a4a8a, 0.4);
            cardBorder.strokeRoundedRect(
                -cardWidth / 2,
                -cardHeight / 2,
                cardWidth,
                cardHeight,
                12
            );
            cardContainer.add(cardBorder);

            // 만화 이미지 (더 크게 표시)
            const image = this.add.image(0, 0, `toon_${toonIndex}`);
            
            // 이미지 크기 조정 (카드보다 약간 크게, 패딩 최소화)
            const imagePadding = 8; // 패딩 줄임
            const maxImageWidth = cardWidth - imagePadding * 2;
            const maxImageHeight = cardHeight - imagePadding * 2;
            
            // 이미지를 카드 크기에 맞추되, 비율 유지하면서 최대한 크게
            const scale = Math.min(
                maxImageWidth / image.width,
                maxImageHeight / image.height
            ) * 1.05; // 약간 더 크게 (5% 여유)
            image.setScale(scale);

            // 이미지 그림자
            const imageShadow = this.add.graphics();
            imageShadow.fillStyle(0x000000, 0.2);
            imageShadow.fillRoundedRect(
                -image.displayWidth / 2 - 2,
                -image.displayHeight / 2 + 2,
                image.displayWidth,
                image.displayHeight,
                8
            );
            imageShadow.setDepth(-1);
            cardContainer.add(imageShadow);
            cardContainer.add(image);

            this.container.add(cardContainer);
            this.toonCards.push(cardContainer);

            // 순차적으로 나타나는 애니메이션
            this.tweens.add({
                targets: cardContainer,
                alpha: 1,
                scale: 1,
                delay: i * 150,
                duration: 600,
                ease: 'Back.easeOut'
            });
        }

        // 터치 안내 생성
        this.createTapHint(page);

        // 페이드 인 애니메이션
        this.tweens.add({
            targets: this.container,
            alpha: 1,
            y: gameHeight / 2,
            duration: 600,
            ease: 'Power2'
        });
    }

    createTapHint(page: number): void {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        if (this.tapHint) {
            this.tapHint.destroy();
        }

        this.tapHint = this.add.container(gameWidth / 2, gameHeight * 0.88);
        this.tapHint.setDepth(20);

        // 배경 원
        const hintBg = this.add.graphics();
        hintBg.fillStyle(0xffffff, 0.15);
        hintBg.fillRoundedRect(-80, -20, 160, 40, 20);
        this.tapHint.add(hintBg);

        // 텍스트
        const hintText = page === 0 ? '터치하여 계속' : '터치하여 시작';
        const text = this.add.text(0, 0, hintText, {
            fontSize: '22px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        text.setOrigin(0.5);
        this.tapHint.add(text);

        // 화살표 아이콘 (간단한 그래픽)
        const arrow = this.add.graphics();
        arrow.lineStyle(3, 0xffffff, 0.8);
        arrow.lineBetween(0, -8, 5, 0);
        arrow.lineBetween(0, -8, -5, 0);
        arrow.lineBetween(0, -8, 0, 8);
        arrow.setY(-35);
        this.tapHint.add(arrow);

        // 깜빡이는 애니메이션
        this.tweens.add({
            targets: this.tapHint,
            y: gameHeight * 0.88 + 5,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        this.tweens.add({
            targets: arrow,
            alpha: 0.3,
            duration: 800,
            yoyo: true,
            repeat: -1
        });
    }

    createPageIndicator(page: number): void {
        const gameWidth = this.scale.width;
        const gameHeight = this.scale.height;

        this.pageIndicator = this.add.container(gameWidth / 2, gameHeight * 0.12);
        this.pageIndicator.setDepth(15);

        // 페이지 점들
        for (let i = 0; i < 2; i++) {
            const dot = this.add.circle(0, 0, 6, i === page ? 0xffffff : 0x666666);
            dot.setX((i - 0.5) * 20);
            dot.setAlpha(i === page ? 1 : 0.4);
            this.pageIndicator.add(dot);

            if (i === page) {
                // 활성 페이지 점 애니메이션
                this.tweens.add({
                    targets: dot,
                    scale: 1.3,
                    duration: 400,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        }
    }

    nextPage(): void {
        // 이미 전환 중이면 무시
        if (this.isTransitioning) {
            return;
        }

        if (this.currentPage === 0) {
            // 5~8컷으로 이동
            this.currentPage = 1;
            this.showPage(1);
        } else {
            // GameScene으로 전환
            this.isTransitioning = true;
            this.cameras.main.fadeOut(500, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('GameScene');
            });
        }
    }
}
