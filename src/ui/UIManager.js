// UI 관리자
const UIManager = {
    coinText: null,
    autoFireText: null,
    clickButton: null,
    upgradeButton: null,
    clickButtonText: null,
    upgradeButtonText: null,
    
    // UI 생성
    create(scene) {
        const scale = Responsive.getScale(scene);
        const gameWidth = scene.scale.width;
        const gameHeight = scene.scale.height;
        
        // UI 패널 배경 (반응형)
        const panelWidth = gameWidth * 0.94;
        const panelHeight = gameHeight * 0.13;
        const uiPanel = scene.add.rectangle(gameWidth / 2, panelHeight / 2, panelWidth, panelHeight, 0x000000, 0.6);
        uiPanel.setOrigin(0.5, 0.5);
        
        // 코인 텍스트 (반응형)
        const coinFontSize = Responsive.getFontSize(scene, 24);
        this.coinText = scene.add.text(gameWidth * 0.06, panelHeight * 0.4, `코인: ${GameState.coins}`, {
            fontSize: coinFontSize,
            fill: '#ffd700',
            fontFamily: 'Arial'
        });
        
        // 초당 발사 텍스트 (반응형)
        const cpsFontSize = Responsive.getFontSize(scene, 18);
        this.autoFireText = scene.add.text(gameWidth * 0.06, panelHeight * 0.75, `초당 발사: ${GameState.autoFireRate}회`, {
            fontSize: cpsFontSize,
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        
        // 클릭 강화 버튼 (반응형)
        const buttonWidth = gameWidth * 0.15;
        const buttonHeight = gameHeight * 0.067;
        this.clickButton = scene.add.rectangle(gameWidth * 0.81, panelHeight * 0.4, buttonWidth, buttonHeight, 0x4a90e2);
        this.clickButton.setInteractive({ useHandCursor: true });
        this.clickButton.on('pointerdown', () => {
            if (GameState.upgradeClick()) {
                this.update();
            }
        });
        
        const buttonFontSize = Responsive.getFontSize(scene, 14);
        this.clickButtonText = scene.add.text(gameWidth * 0.81, panelHeight * 0.4, '클릭 강화', {
            fontSize: buttonFontSize,
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        this.clickButtonText.setOrigin(0.5);
        
        // 자동 발사 버튼 (반응형)
        this.upgradeButton = scene.add.rectangle(gameWidth * 0.81, panelHeight * 0.75, buttonWidth, buttonHeight, 0x50c878);
        this.upgradeButton.setInteractive({ useHandCursor: true });
        this.upgradeButton.on('pointerdown', () => {
            if (GameState.upgradeAutoFire()) {
                this.update();
                // 자동 발사 타이머 재설정
                if (scene.setupAutoFire) {
                    scene.setupAutoFire();
                }
            }
        });
        
        this.upgradeButtonText = scene.add.text(gameWidth * 0.81, panelHeight * 0.75, '자동 발사', {
            fontSize: buttonFontSize,
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        this.upgradeButtonText.setOrigin(0.5);
        
        // 안내 텍스트 (반응형)
        const hintFontSize = Responsive.getFontSize(scene, 16);
        const hintText = scene.add.text(gameWidth / 2, gameHeight * 0.92, '캐릭터를 클릭하여 투사체를 발사하세요!', {
            fontSize: hintFontSize,
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        hintText.setOrigin(0.5);
        
        // 초기 UI 업데이트
        this.update();
    },
    
    // UI 업데이트
    update() {
        if (this.coinText) {
            this.coinText.setText(`코인: ${Math.floor(GameState.coins)}`);
        }
        
        if (this.autoFireText) {
            this.autoFireText.setText(`초당 발사: ${GameState.autoFireRate}회`);
        }
        
        // 버튼 색상 업데이트 (구매 가능 여부)
        if (this.clickButton) {
            const clickCost = GameState.getClickUpgradeCost();
            this.clickButton.setFillStyle(
                GameState.coins >= clickCost ? 0x4a90e2 : 0x666666
            );
        }
        
        if (this.upgradeButton) {
            const autoCost = GameState.getAutoFireUpgradeCost();
            this.upgradeButton.setFillStyle(
                GameState.coins >= autoCost ? 0x50c878 : 0x666666
            );
        }
    }
};
