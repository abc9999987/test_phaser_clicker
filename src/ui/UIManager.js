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
        // UI 패널 배경
        const uiPanel = scene.add.rectangle(400, 50, 750, 80, 0x000000, 0.6);
        uiPanel.setOrigin(0.5, 0);
        
        // 코인 텍스트
        this.coinText = scene.add.text(50, 30, `코인: ${GameState.coins}`, {
            fontSize: '24px',
            fill: '#ffd700',
            fontFamily: 'Arial'
        });
        
        // 초당 발사 텍스트
        this.autoFireText = scene.add.text(50, 60, `초당 발사: ${GameState.autoFireRate}회`, {
            fontSize: '18px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        
        // 클릭 강화 버튼
        this.clickButton = scene.add.rectangle(650, 40, 120, 40, 0x4a90e2);
        this.clickButton.setInteractive({ useHandCursor: true });
        this.clickButton.on('pointerdown', () => {
            if (GameState.upgradeClick()) {
                this.update();
            }
        });
        
        this.clickButtonText = scene.add.text(650, 40, '클릭 강화', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        this.clickButtonText.setOrigin(0.5);
        
        // 자동 발사 버튼
        this.upgradeButton = scene.add.rectangle(650, 80, 120, 40, 0x50c878);
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
        
        this.upgradeButtonText = scene.add.text(650, 80, '자동 발사', {
            fontSize: '14px',
            fill: '#ffffff',
            fontFamily: 'Arial'
        });
        this.upgradeButtonText.setOrigin(0.5);
        
        // 안내 텍스트
        const hintText = scene.add.text(400, 550, '캐릭터를 클릭하여 투사체를 발사하세요!', {
            fontSize: '16px',
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
