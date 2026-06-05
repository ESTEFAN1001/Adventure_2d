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

        this.lastKeyPress = null;
        this.lastPressTime = 0;
        this.dashCooldown = 0;
        this.isDashing = false;
        this.DASH_COOLDOWN = 5000; // 5 segundos
        this.DASH_DISTANCE = 150;   // Distancia del dash en píxeles
        this.DASH_DURATION = 150;   // Duración del dash en ms
        this.DOUBLE_PRESS_DELAY = 300; // Tiempo máximo entre dos presiones (ms)

        // Sistema de powerups activos
        this.activePowerUps = []; // Array de {type, endTime, startTime}
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

        // Configurar controles de dash
        this.setupDashControls();

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

        // Movimiento VERTICAL 
        if (this.cursors.up.isDown || this.wKey.isDown) {
            this.sprite.setVelocityY(-this.speed);
            this.sprite.anims.play('player-up', true);
            this.currentDirection = 'up';
            this.isMoving = true;
        } 
        else if (this.cursors.down.isDown || this.sKey.isDown) {
            this.sprite.setVelocityY(this.speed);
            this.sprite.anims.play('player-down', true);
            this.currentDirection = 'down';
            this.isMoving = true;
        }
        // Movimiento HORIZONTAL 
        else if (this.cursors.left.isDown || this.aKey.isDown) {
            this.sprite.setVelocityX(-this.speed);
            this.sprite.anims.play('player-left', true);
            this.currentDirection = 'left';
            this.isMoving = true;
        } 
        else if (this.cursors.right.isDown || this.dKey.isDown) {
            this.sprite.setVelocityX(this.speed);
            this.sprite.anims.play('player-right', true);
            this.currentDirection = 'right';
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

        this.scene.tweens.killTweensOf(this.sprite);
        this.sprite.alpha = 1;

        if (this.currentHealth > 0) {
            this.scene.tweens.add({
                targets: this.sprite,
                alpha: 0.5,
                duration: 200,
                yoyo: true,
                repeat: 4,
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

    /**
     * Configura la detección de doble presión para dash
    */
    setupDashControls() {
        // Teclas WASD
        this.wKey.on('down', () => this.handleDashInput('up'));
        this.aKey.on('down', () => this.handleDashInput('left'));
        this.sKey.on('down', () => this.handleDashInput('down'));
        this.dKey.on('down', () => this.handleDashInput('right'));
        
        // Teclas de flechas
        this.cursors.up.on('down', () => this.handleDashInput('up'));
        this.cursors.down.on('down', () => this.handleDashInput('down'));
        this.cursors.left.on('down', () => this.handleDashInput('left'));
        this.cursors.right.on('down', () => this.handleDashInput('right'));
    }

    /**
     * Maneja la lógica de doble presión para dash
     * @param {string} direction - Dirección presionada
     */
    handleDashInput(direction) {
        const currentTime = this.scene.time.now;
        
        // Verificar cooldown
        if (this.dashCooldown > currentTime) {
            return;
        }
        
        // Si es la misma dirección y está dentro del tiempo límite
        if (this.lastKeyPress === direction && 
            (currentTime - this.lastPressTime) <= this.DOUBLE_PRESS_DELAY) {
            this.executeDash(direction);
            this.lastKeyPress = null; // Resetear para evitar múltiples dashes
        } else {
            // Guardar primera presión
            this.lastKeyPress = direction;
            this.lastPressTime = currentTime;
        }
    }

    /**
     * Ejecuta el dash en la dirección indicada
     * @param {string} direction - Dirección del dash
     */
    executeDash(direction) {
        if (this.isDashing) return;
        
        // Calcular destino
        let targetX = this.sprite.x;
        let targetY = this.sprite.y;
        
        switch(direction) {
            case 'up':
                targetY = this.sprite.y - this.DASH_DISTANCE;
                break;
            case 'down':
                targetY = this.sprite.y + this.DASH_DISTANCE;
                break;
            case 'left':
                targetX = this.sprite.x - this.DASH_DISTANCE;
                break;
            case 'right':
                targetX = this.sprite.x + this.DASH_DISTANCE;
                break;
        }
        
        // Limitar dentro de los límites del mundo
        const bounds = this.scene.physics.world.bounds;
        targetX = Math.min(Math.max(targetX, bounds.x + 20), bounds.x + bounds.width - 20);
        targetY = Math.min(Math.max(targetY, bounds.y + 20), bounds.y + bounds.height - 20);
        
        // Animar el dash
        this.scene.tweens.add({
            targets: this.sprite,
            x: targetX,
            y: targetY,
            duration: this.DASH_DURATION,
            ease: 'Power2',
            onComplete: () => {
                // Reactivar colisiones
                this.sprite.body.enable = true;
                this.isDashing = false;
                
                // Iniciar cooldown
                this.dashCooldown = this.scene.time.now + this.DASH_COOLDOWN;
            }
        });
    }

    /**
     * Agrega un powerup activo al jugador
     * @param {string} type - Tipo de powerup
     * @param {number} duration - Duración en ms
     */
    addActivePowerUp(type, duration) {
        // Limpiar powerups expirados
        this.activePowerUps = this.activePowerUps.filter(
            p => this.scene.time.now < p.endTime
        );

        const endTime = this.scene.time.now + duration;
        this.activePowerUps.push({
            type: type,
            startTime: this.scene.time.now,
            endTime: endTime,
            duration: duration
        });
    }

    /**
     * Obtiene los powerups activos
     * @returns {Array} Array de powerups activos
     */
    getActivePowerUps() {
        // Filtrar powerups expirados
        this.activePowerUps = this.activePowerUps.filter(
            p => this.scene.time.now < p.endTime
        );
        return this.activePowerUps;
    }

    /**
     * Obtiene el tiempo restante del cooldown del dash en ms
     * @returns {number} Milisegundos restantes (0 si está disponible)
     */
    getDashCooldownRemaining() {
        const remaining = this.dashCooldown - this.scene.time.now;
        return Math.max(0, remaining);
    }
}
