/**
 * orc.js
 * Clase del orco enemigo
 * Extiende Character para agregar IA y comportamiento específico
 */

class Orc extends Character {
    /**
     * @param {Object} config - Configuración del orco
     * @param {Phaser.Scene} config.scene - Escena de Phaser
     * @param {number} config.x - Posición X inicial
     * @param {number} config.y - Posición Y inicial
     * @param {Character} config.player - Referencia al jugador
     * @param {Object} config.walls - Grupo de paredes para colisiones
     */
    constructor(config) {
        const gameConfig = GameConfig.orc;

        super({
            scene: config.scene,
            x: config.x,
            y: config.y,
            sprite: 'orc',
            maxHealth: gameConfig.MAX_HEALTH,
            speed: gameConfig.SPEED,
            spriteConfig: gameConfig.SPRITE_CONFIG
        });

        this.player = config.player;
        this.walls = config.walls;
        this.detectionRadius = gameConfig.DETECTION_RADIUS;
        this.isChasing = false;
        this.patrolTimer = 0;
        this.patrolDirection = 'right';
        this.damageDelay = 0; // El orco puede atacar constantemente
        this.deadSprite = null;
    }

    /**
     * Inicializa el orco en la escena
     */
    initialize() {
        this.createSprite('orc');
        this.setupAnimations();
        this.setupCollisions();
        console.log(`Orco creado en posición (${this.x}, ${this.y})`);
    }

    /**
     * Configura las animaciones del orco
     */
    setupAnimations() {
        const directions = ['down', 'left', 'right', 'up'];
        const frameSets = {
            down: { start: 0, end: 2 },
            left: { start: 3, end: 5 },
            right: { start: 6, end: 8 },
            up: { start: 6, end: 8 } // Reutiliza los frames de right
        };

        // Animaciones de movimiento
        directions.forEach(direction => {
            this.scene.anims.create({
                key: `orc-${direction}`,
                frames: this.scene.anims.generateFrameNumbers('orc', frameSets[direction]),
                frameRate: GameConfig.animations.FRAME_RATE,
                repeat: -1
            });
        });

        // Animaciones idle
        const idleFrames = {
            down: 0,
            left: 3,
            right: 6,
            up: 9
        };

        directions.forEach(direction => {
            this.scene.anims.create({
                key: `orc-idle-${direction}`,
                frames: [{ key: 'orc', frame: idleFrames[direction] }],
                frameRate: 1,
                repeat: 0
            });
        });
    }

    /**
     * Configura las colisiones del orco
     */
    setupCollisions() {
        this.scene.physics.add.collider(this.sprite, this.walls);
    }

    /**
     * Actualiza el comportamiento del orco cada frame
     */
    update() {
        if (!this.isActive()) return;

        this.updateAI();
        this.updateAnimation();
    }

    /**
     * Actualiza la IA del orco (patrulla o persecución)
     */
    updateAI() {
        const distanceToPlayer = this.getDistanceTo(this.player);

        // Detectar si el jugador está en rango
        if (distanceToPlayer < this.detectionRadius) {
            this.isChasing = true;
        } else if (distanceToPlayer > this.detectionRadius * 1.5) {
            this.isChasing = false;
        }

        let velocityX = 0;
        let velocityY = 0;

        if (this.isChasing) {
            // Perseguir al jugador
            const playerPos = this.player.getPosition();
            const orcPos = this.getPosition();

            const dx = playerPos.x - orcPos.x;
            const dy = playerPos.y - orcPos.y;

            // Determinar dirección de movimiento
            if (Math.abs(dx) > Math.abs(dy)) {
                velocityX = dx > 0 ? this.speed : -this.speed;
                this.currentDirection = dx > 0 ? 'right' : 'left';
            } else {
                velocityY = dy > 0 ? this.speed : -this.speed;
                this.currentDirection = dy > 0 ? 'down' : 'up';
            }
        } else {
            // Patrullar
            this.patrolTimer++;

            if (this.patrolTimer > 180) {
                // Cambiar dirección cada 180 frames (~3 segundos)
                this.patrolTimer = 0;
                const directions = ['up', 'down', 'left', 'right'];
                this.currentDirection = directions[Phaser.Math.Between(0, 3)];
            }

            // Aplicar velocidad según dirección
            const patrolSpeed = this.speed * 0.5;
            switch (this.currentDirection) {
                case 'right':
                    velocityX = patrolSpeed;
                    break;
                case 'left':
                    velocityX = -patrolSpeed;
                    break;
                case 'up':
                    velocityY = -patrolSpeed;
                    break;
                case 'down':
                    velocityY = patrolSpeed;
                    break;
            }
        }

        this.setVelocity(velocityX, velocityY);
    }

    /**
     * Actualiza la animación según el estado actual
     */
    updateAnimation() {
        const isMoving = Math.abs(this.velocity.x) > 0 || Math.abs(this.velocity.y) > 0;

        if (isMoving) {
            const animKey = `orc-${this.currentDirection}`;
            if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim.key !== animKey) {
                this.sprite.anims.play(animKey, true);
            }
        } else {
            const idleKey = `orc-idle-${this.currentDirection}`;
            if (!this.sprite.anims.isPlaying || this.sprite.anims.currentAnim.key !== idleKey) {
                this.sprite.anims.play(idleKey, true);
            }
        }
    }

    /**
     * Maneja la muerte del orco
     */
    die() {
        super.die();
        
        if (this.sprite) {
            // Crear sprite estático del orco muerto
            this.deadSprite = this.scene.add.sprite(this.sprite.x, this.sprite.y, 'orc');
            this.deadSprite.setScale(this.spriteConfig.scale);
            this.deadSprite.setTint(0x666666); // Tinte gris
            
            if (this.sprite.frame) {
                this.deadSprite.setFrame(this.sprite.frame.name);
            }

            this.sprite.destroy();
            this.sprite = null;
        }

        console.log('Orco derrotado');
    }

    /**
     * Verifica si el orco está persiguiendo al jugador
     * @returns {boolean} True si está persiguiendo
     */
    isChasing() {
        return this.isChasing;
    }

    /**
     * Obtiene el sprite muerto (si existe)
     * @returns {Phaser.Physics.Sprite|null} El sprite muerto o null
     */
    getDeadSprite() {
        return this.deadSprite;
    }
}
