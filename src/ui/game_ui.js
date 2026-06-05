/**
 * game_ui.js
 * Interfaz de usuario mejorada del juego
 * Muestra: vida del jugador con sprite de heal, enemigos con sprite de orc,
 * powerups activos y estado del dash
 */

class GameUI {
    /**
     * @param {Object} config - Configuración
     * @param {Phaser.Scene} config.scene - Escena de Phaser
     * @param {Player} config.player - Referencia al jugador
     * @param {SpawnManager} config.spawnManager - Gestor de spawns
     * @param {number} config.width - Ancho de la pantalla
     * @param {number} config.height - Altura de la pantalla
     */
    constructor(config) {
        this.scene = config.scene;
        this.player = config.player;
        this.spawnManager = config.spawnManager;
        this.width = config.width;
        this.height = config.height;

        // Posiciones de UI
        this.padding = 16;
        this.rowHeight = 50;
        this.startX = this.padding;
        this.startY = this.padding;

        // Contenedores de elementos
        this.healthElements = {};
        this.enemyElements = {};
        this.powerupElements = [];

        this.powerupIconSize = 40;
        this.powerupSpacing = 50;

        // Mapeo de tipos de powerup a colores
        this.powerupColors = {
            'speed_boost': '#00ff00',
            'fire_rate_boost': '#ff6600',
            'damage_boost': '#ff0000',
            'heal': '#00ff00',
            'slow_down': '#888888',
            'poison': '#aa44ff'
        };

        this.powerupNames = {
            'speed_boost': 'Speed',
            'fire_rate_boost': 'Fire',
            'damage_boost': 'Damage',
            'heal': 'Heal',
            'slow_down': 'Slow',
            'poison': 'Poison'
        };

        this.setup();
    }

    /**
     * Configura los elementos de UI
     */
    setup() {
        this.createHealthDisplay();
        this.createEnemyDisplay();
    }

    /**
     * Crea la pantalla de salud del jugador (Fila 1)
     * Sprite de heal + texto de vida
     */
    createHealthDisplay() {
        const x = this.startX;
        const y = this.startY;

        // Sprite de heal (frame 0)
        const healSprite = this.scene.add.sprite(x + 20, y + 20, 'powerup_heal', 0);
        healSprite.setScale(1.5);
        healSprite.setScrollFactor(0);
        healSprite.setDepth(1000);

        // Texto de vida
        const healthText = this.scene.add.text(x + 55, y + 12, '', {
            font: 'bold 16px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        healthText.setScrollFactor(0);
        healthText.setDepth(1000);

        // Texto de etiqueta
        const label = this.scene.add.text(x + 55, y + 32, 'Health', {
            font: '12px Arial',
            fill: '#cccccc',
            stroke: '#000000',
            strokeThickness: 1
        });
        label.setScrollFactor(0);
        label.setDepth(1000);

        this.healthElements = {
            sprite: healSprite,
            text: healthText,
            label: label
        };
    }

    /**
     * Crea la pantalla de enemigos (Fila 2)
     * Sprite de orc + texto de cantidad de enemigos
     */
    createEnemyDisplay() {
        const x = this.startX;
        const y = this.startY + this.rowHeight;

        // Sprite de orc (frame 0)
        const orcSprite = this.scene.add.sprite(x + 20, y + 20, 'orc', 0);
        orcSprite.setScale(0.3);
        orcSprite.setScrollFactor(0);
        orcSprite.setDepth(1000);

        // Texto de cantidad
        const enemyText = this.scene.add.text(x + 55, y + 12, '', {
            font: 'bold 16px Arial',
            fill: '#ff4444',
            stroke: '#000000',
            strokeThickness: 2
        });
        enemyText.setScrollFactor(0);
        enemyText.setDepth(1000);

        // Texto de etiqueta
        const label = this.scene.add.text(x + 55, y + 32, 'Enemies', {
            font: '12px Arial',
            fill: '#cccccc',
            stroke: '#000000',
            strokeThickness: 1
        });
        label.setScrollFactor(0);
        label.setDepth(1000);

        this.enemyElements = {
            sprite: orcSprite,
            text: enemyText,
            label: label
        };
    }

    /**
     * Actualiza la pantalla de salud
     */
    updateHealthDisplay() {
        const health = this.player.currentHealth;
        const maxHealth = this.player.maxHealth;
        const healthPercent = health / maxHealth;

        // Cambiar color según salud
        let color = '#ffffff';
        if (healthPercent < 0.25) color = '#ff0000';
        else if (healthPercent < 0.5) color = '#ff6600';

        this.healthElements.text.setColor(color);
        this.healthElements.text.setText(`${health}/${maxHealth}`);
    }

    /**
     * Actualiza la pantalla de enemigos
     */
    updateEnemyDisplay() {
        const activeCount = this.spawnManager.getActiveEnemyCount();
        const totalCount = this.spawnManager.getTotalEnemyCount();

        this.enemyElements.text.setText(`${activeCount}/${totalCount}`);

        // Cambiar color según enemigos restantes
        if (activeCount === 0) {
            this.enemyElements.text.setColor('#00ff00');
        } else if (activeCount <= totalCount / 2) {
            this.enemyElements.text.setColor('#ffff00');
        } else {
            this.enemyElements.text.setColor('#ff4444');
        }
    }

    /**
     * Actualiza la pantalla de powerups activos (Fila 3)
     */
    updatePowerupDisplay() {
        const activePowerUps = this.player.getActivePowerUps();

        // Limpiar powerups anteriores
        this.powerupElements.forEach(el => {
            if (el.sprite) el.sprite.destroy();
            if (el.text) el.text.destroy();
            if (el.timerText) el.timerText.destroy();
        });
        this.powerupElements = [];

        // Crear nuevos elementos de powerup
        const x = this.startX;
        const y = this.startY + this.rowHeight * 2.4; 

        activePowerUps.forEach((powerup, index) => {
            const powerupX = x + 20 + (index * this.powerupSpacing);  // Alineado con los demás

            // Sprite del powerup
            const spriteKey = this.getPowerupSpriteKey(powerup.type);
            const powerupSprite = this.scene.add.sprite(powerupX, y, spriteKey, 0);
            powerupSprite.setScale(1.2);
            powerupSprite.setScrollFactor(0);
            powerupSprite.setDepth(1000);

            // Tiempo restante
            const timeRemaining = Math.max(0, powerup.endTime - this.scene.time.now);
            const seconds = (timeRemaining / 1000).toFixed(1);

            const timerText = this.scene.add.text(powerupX, y + 30, seconds + 's', {
                font: 'bold 12px Arial',
                fill: this.powerupColors[powerup.type] || '#ffffff',
                stroke: '#000000',
                strokeThickness: 1
            });
            timerText.setOrigin(0.5);
            timerText.setScrollFactor(0);
            timerText.setDepth(1000);

            this.powerupElements.push({
                type: powerup.type,
                sprite: powerupSprite,
                timerText: timerText,
                endTime: powerup.endTime
            });
        });
    }

    /**
     * Obtiene la clave del sprite para un powerup
     * @param {string} type - Tipo de powerup
     * @returns {string} Clave del sprite
     */
    getPowerupSpriteKey(type) {
        const spriteMap = {
            'speed_boost': 'powerup_speed',
            'fire_rate_boost': 'powerup_fire',
            'damage_boost': 'powerup_damage',
            'heal': 'powerup_heal',
            'slow_down': 'powerup_slow',
            'poison': 'powerup_poison'
        };
        return spriteMap[type] || 'powerup_heal';
    }

    /**
     * Actualiza toda la UI
     */
    update() {
        this.updateHealthDisplay();
        this.updateEnemyDisplay();
        this.updatePowerupDisplay();
    }

    /**
     * Limpia y destruye todos los elementos de UI
     */
    destroy() {
        // Destruir elementos de salud
        if (this.healthElements.sprite) this.healthElements.sprite.destroy();
        if (this.healthElements.text) this.healthElements.text.destroy();
        if (this.healthElements.label) this.healthElements.label.destroy();

        // Destruir elementos de enemigos
        if (this.enemyElements.sprite) this.enemyElements.sprite.destroy();
        if (this.enemyElements.text) this.enemyElements.text.destroy();
        if (this.enemyElements.label) this.enemyElements.label.destroy();

        // Destruir elementos de powerups
        this.powerupElements.forEach(el => {
            if (el.sprite) el.sprite.destroy();
            if (el.text) el.text.destroy();
            if (el.timerText) el.timerText.destroy();
        });
    }
}
