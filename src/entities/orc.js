/**
 * orc.js
 * Clase del orco enemigo
 * Extiende Enemy para agregar configuración y animaciones específicas del orco
 */

class Orc extends Enemy {
    /**
     * @param {Object} config - Configuración del orco
     * @param {Phaser.Scene} config.scene - Escena de Phaser
     * @param {number} config.x - Posición X inicial
     * @param {number} config.y - Posición Y inicial
     * @param {Character} config.player - Referencia al jugador
     * @param {Object} config.walls - Grupo de paredes para colisiones
     */
    constructor(config) {
        super({
            scene: config.scene,
            x: config.x,
            y: config.y,
            sprite: 'orc',
            player: config.player,
            walls: config.walls,
            gameConfig: GameConfig.orc
        });

        this.damageDelay = 0; // El orco puede atacar constantemente
    }

    /**
     * Inicializa el orco en la escena
     */
    initialize() {
        super.initialize('orc');
    }

    /**
     * Configura las animaciones del orco
     */
    setupAnimations(spriteKey) {
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
}
