/**
 * enemy.js
 * Clase base para todos los enemigos
 * Proporciona IA y comportamiento común a todos los enemigos
 * Extiende Character para agregar funcionalidad específica de enemigos
 */

class Enemy extends Character {
    /**
     * @param {Object} config - Configuración del enemigo
     * @param {Phaser.Scene} config.scene - Escena de Phaser
     * @param {number} config.x - Posición X
     * @param {number} config.y - Posición Y
     * @param {string} config.sprite - Clave del sprite
     * @param {Character} config.player - Referencia al jugador
     * @param {Object} config.walls - Grupo de paredes
     * @param {Object} config.gameConfig - Configuración del enemigo desde GameConfig
     */
    constructor(config) {
        super({
            scene: config.scene,
            x: config.x,
            y: config.y,
            sprite: config.sprite,
            maxHealth: config.gameConfig.MAX_HEALTH,
            speed: config.gameConfig.SPEED,
            spriteConfig: config.gameConfig.SPRITE_CONFIG
        });

        this.player = config.player;
        this.walls = config.walls;
        this.detectionRadius = config.gameConfig.DETECTION_RADIUS;
        this.isChasing = false;
        this.patrolTimer = 0;
        this.patrolDirection = 'right';
        this.deadSprite = null;
        this.enemyType = config.sprite; // Para identificar el tipo de enemigo
    }

    /**
     * Inicializa el enemigo en la escena
     * @param {string} spriteKey - Clave del sprite a crear
     */
    initialize(spriteKey) {
        this.createSprite(spriteKey);
        this.setupAnimations(spriteKey);
        this.setupCollisions();
        console.log(`${this.enemyType} creado en posición (${this.x}, ${this.y})`);
    }

    /**
     * Configura las animaciones del enemigo (debe ser sobrescrito por subclases)
     * @param {string} spriteKey - Clave del sprite
     */
    setupAnimations(spriteKey) {
        // Implementación en subclases
        console.warn('setupAnimations debe ser implementado en la subclase');
    }

    /**
     * Configura las colisiones del enemigo
     */
    setupCollisions() {
        this.scene.physics.add.collider(this.sprite, this.walls);
    }

    /**
     * Actualiza el comportamiento del enemigo cada frame
     */
    update() {
        if (!this.isActive()) return;

        this.updateAI();
        this.updateAnimation();
    }

    /**
     * Actualiza la IA del enemigo (patrulla o persecución)
     */
    updateAI() {
        const distanceToPlayer = this.getDistanceToPlayer();

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
            const enemyPos = this.getPosition();

            const dx = playerPos.x - enemyPos.x;
            const dy = playerPos.y - enemyPos.y;

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
     * Actualiza la animación según el estado actual (debe ser sobrescrito por subclases)
     */
    updateAnimation() {
        // Implementación en subclases
    }

    /**
     * Obtiene la distancia al jugador
     * @param {Character} target - Objetivo a medir
     * @returns {number} Distancia en píxeles
     */
    getDistanceToPlayer() {
        return this.getDistanceTo(this.player);
    }

    /**
     * Verifica si el enemigo está persiguiendo al jugador
     * @returns {boolean} True si está persiguiendo
     */
    isChasingPlayer() {
        return this.isChasing;
    }

    /**
     * Maneja la muerte del enemigo
     */
    die() {
        super.die();
        
        if (this.sprite) {
            // Crear sprite estático del enemigo muerto
            this.deadSprite = this.scene.add.sprite(this.sprite.x, this.sprite.y, this.enemyType);
            this.deadSprite.setScale(this.spriteConfig.scale);
            this.deadSprite.setTint(0x666666); // Tinte gris
            
            if (this.sprite.frame) {
                this.deadSprite.setFrame(this.sprite.frame.name);
            }

            this.sprite.destroy();
            this.sprite = null;
        }

        console.log(`${this.enemyType} derrotado`);
    }

    /**
     * Obtiene el sprite muerto (si existe)
     * @returns {Phaser.Physics.Sprite|null} El sprite muerto o null
     */
    getDeadSprite() {
        return this.deadSprite;
    }
}
