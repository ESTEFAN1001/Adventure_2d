/**
 * player.js
 * Clase del jugador
 * Extiende Character para agregar funcionalidad específica del jugador
 */

class Player extends Character {
    /**
     * @param {Object} config - Configuración del jugador
     * @param {Phaser.Scene} config.scene - Escena de Phaser
     * @param {number} config.x - Posición X inicial
     * @param {number} config.y - Posición Y inicial
     * @param {Object} config.walls - Grupo de paredes para colisiones
     */
    constructor(config) {
        const gameConfig = GameConfig.player;
        
        super({
            scene: config.scene,
            x: config.x,
            y: config.y,
            sprite: 'player',
            maxHealth: gameConfig.MAX_HEALTH,
            speed: gameConfig.SPEED,
            spriteConfig: gameConfig.SPRITE_CONFIG
        });

        this.clothes = gameConfig.CLOTHES_DEFAULT;
        this.walls = config.walls;
        this.isMoving = false;
        this.damageDelay = GameConfig.combat.PLAYER_DAMAGE_DELAY;
        this.inputHandler = null;
        this.healthBar = null;
        this.healthText = null;
    }

    /**
     * Inicializa el jugador en la escena
     */
    initialize() {
        this.createSprite('player');
        this.setupAnimations();
        this.setupControls();
        this.setupCollisions();
    }

    /**
     * Configura las animaciones del jugador
     */
    setupAnimations() {
        const directions = ['down', 'left', 'right', 'up'];
        const frameSets = {
            down: { start: 0, end: 5 },
            left: { start: 6, end: 11 },
            right: { start: 12, end: 17 },
            up: { start: 18, end: 23 }
        };

        // Animaciones de movimiento
        directions.forEach(direction => {
            this.scene.anims.create({
                key: `player-${direction}`,
                frames: this.scene.anims.generateFrameNumbers('player', frameSets[direction]),
                frameRate: GameConfig.animations.FRAME_RATE,
                repeat: -1
            });
        });

        // Animaciones idle
        const idleFrames = {
            down: [0, 1],
            left: [6, 7],
            right: [12, 13],
            up: [18, 19]
        };

        directions.forEach(direction => {
            this.scene.anims.create({
                key: `player-idle-${direction}`,
                frames: this.scene.anims.generateFrameNumbers('player', { frames: idleFrames[direction] }),
                frameRate: GameConfig.animations.IDLE_FRAME_RATE,
                repeat: -1
            });
        });
    }

    /**
     * Configura los controles del jugador
     */
    setupControls() {
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.wKey = this.scene.input.keyboard.addKey('W');
        this.aKey = this.scene.input.keyboard.addKey('A');
        this.sKey = this.scene.input.keyboard.addKey('S');
        this.dKey = this.scene.input.keyboard.addKey('D');
        this.cKey = this.scene.input.keyboard.addKey('C');

        // Evento para cambiar ropa
        this.scene.input.keyboard.on('keydown-C', () => this.toggleClothes());
    }

    /**
     * Configura las colisiones del jugador
     */
    setupCollisions() {
        this.scene.physics.add.collider(this.sprite, this.walls);
    }

    /**
     * Cambia la ropa del jugador
     */
    toggleClothes() {
        this.clothes = this.clothes === 'red' ? 'black' : 'red';
        console.log(`Ropa cambiada a: ${this.clothes}`);
    }

    /**
     * Actualiza el estado del jugador cada frame
     */
    update() {
        if (!this.isActive()) return;

        this.isMoving = false;
        this.sprite.setVelocity(0);

        // Movimiento horizontal
        if (this.cursors.left.isDown || this.aKey.isDown) {
            this.sprite.setVelocityX(-this.speed);
            this.sprite.anims.play('player-left', true);
            this.currentDirection = 'left';
            this.isMoving = true;
        } else if (this.cursors.right.isDown || this.dKey.isDown) {
            this.sprite.setVelocityX(this.speed);
            this.sprite.anims.play('player-right', true);
            this.currentDirection = 'right';
            this.isMoving = true;
        }

        // Movimiento vertical
        if (this.cursors.up.isDown || this.wKey.isDown) {
            this.sprite.setVelocityY(-this.speed);
            this.sprite.anims.play('player-up', true);
            this.currentDirection = 'up';
            this.isMoving = true;
        } else if (this.cursors.down.isDown || this.sKey.isDown) {
            this.sprite.setVelocityY(this.speed);
            this.sprite.anims.play('player-down', true);
            this.currentDirection = 'down';
            this.isMoving = true;
        }

        // Animación idle si no se mueve
        if (!this.isMoving) {
            this.sprite.anims.play(`player-idle-${this.currentDirection}`, true);
        }
    }

    /**
     * Aplica daño al jugador (sobrescribe el método de Character)
     * @param {number} amount - Cantidad de daño
     */
    takeDamage(amount) {
        const died = super.takeDamage(amount);

        if (this.currentHealth > 0) {
            // Efecto visual de daño
            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0.5,
                duration: 100,
                yoyo: true,
                repeat: 3
            });
        }

        return died;
    }

    /**
     * Establece las barras de vida
     * @param {HealthBar} healthBar - Instancia de la barra de vida
     */
    setHealthBar(healthBar) {
        this.healthBar = healthBar;
    }

    /**
     * Obtiene la dirección actual del jugador
     * @returns {string} Dirección (up, down, left, right)
     */
    getDirection() {
        return this.currentDirection;
    }

    /**
     * Verifica si el jugador se está moviendo
     * @returns {boolean} True si se está moviendo
     */
    isPlayerMoving() {
        return this.isMoving;
    }
}
