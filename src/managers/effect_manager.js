/**
 * effect_manager.js
 * Gestor centralizado de efectos visuales
 * Proporciona un sistema flexible y extensible para crear efectos
 */

class EffectManager {
    /**
     * @param {Object} config - Configuración del gestor de efectos
     * @param {Phaser.Scene} config.scene - Escena de Phaser
     */
    constructor(config) {
        this.scene = config.scene;
        this.effects = [];
    }

    /**
     * Crea un efecto de explosión en una posición específica
     * @param {Object} config - Configuración de la explosión
     * @param {number} config.x - Posición X de la explosión
     * @param {number} config.y - Posición Y de la explosión
     * @param {number} config.scale - Escala del efecto (default: config del juego)
     * @param {number} config.duration - Duración de la explosión en ms (default: config del juego)
     * @param {string} config.texture - Textura a usar (default: 'explosion')
     * @returns {Phaser.Physics.Sprite} El sprite de la explosión creado
     */
    createExplosion(config) {
        const {
            x,
            y,
            scale = GameConfig.effects.explosion.SCALE,
            duration = GameConfig.effects.explosion.DURATION,
            texture = 'explosion'
        } = config;
        
        // Crear el sprite de explosión
        const explosion = this.scene.add.sprite(x, y, texture);
        explosion.setScale(scale);
        explosion.setDepth(1000); // Asegurar que se vea por encima
        
        // Verificar si la animación existe
        if (this.scene.anims.exists('explosion-play')) {
            explosion.play('explosion-play');
        } else {
            // Crear animación de explosión si no existe
            this.createExplosionAnimation();
            if (this.scene.anims.exists('explosion-play')) {
                explosion.play('explosion-play');
            } else {
                // Fallback: destruir después de duration
                this.scene.time.delayedCall(duration, () => {
                    if (explosion && explosion.active) {
                        explosion.destroy();
                    }
                    this.effects = this.effects.filter(e => e !== explosion);
                });
                return explosion;
            }
        }

        // Evento para cuando termine la animación
        explosion.on('animationcomplete', () => {
            if (explosion && explosion.active) {
                explosion.destroy();
            }
            this.effects = this.effects.filter(e => e !== explosion);
        });

        // Registrar el efecto
        this.effects.push(explosion);

        // Backup: destruir después de la duración por si acaso
        this.scene.time.delayedCall(duration + 100, () => {
            if (explosion && explosion.active) {
                explosion.destroy();
                this.effects = this.effects.filter(e => e !== explosion);
            }
        });

        return explosion;
    }

    /**
     * Crea la animación de explosión para grid 3x3
     */
    createExplosionAnimation() {
        if (this.scene.anims.exists('explosion-play')) {
            return;
        }

        // Obtener la textura
        const textureObject = this.scene.textures.get('explosion');
        if (!textureObject) {
            return;
        }

        // Verificar dimensiones del spritesheet
        const sourceImage = textureObject.getSourceImage();

        // Configuración para grid 3x3
        const frameWidth = 283;  // 850 / 3
        const frameHeight = 245; // 735 / 3
        const cols = 3;
        const rows = 3;
        const totalFrames = cols * rows; // 9 frames
                
        // Generar frames explícitamente para grid 3x3
        const frames = [];
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const frameIndex = row * cols + col;
                frames.push({
                    key: 'explosion',
                    frame: frameIndex
                });
            }
        }
        
        // Crear la animación
        this.scene.anims.create({
            key: 'explosion-play',
            frames: frames,
            frameRate: GameConfig.effects.explosion.FRAME_RATE,
            repeat: 0,
            hideOnComplete: true
        });
    }

    /**
     * Método alternativo para crear animación usando generateFrameNumbers
     */
    createExplosionAnimationAlt() {
        if (this.scene.anims.exists('explosion-play')) {
            return;
        }

        // Verificar que la textura existe
        if (!this.scene.textures.exists('explosion')) {
            console.error('[EffectManager] Textura explosion no existe');
            return;
        }

        // Generar frames para grid 3x3 (9 frames: 0-8)
        const frames = this.scene.anims.generateFrameNumbers('explosion', {
            start: 0,
            end: 8,  // 9 frames total (0-8)
            first: 0
        });
                
        if (frames.length === 0) {
            console.error('[EffectManager] No se pudieron generar frames');
            return;
        }
        
        this.scene.anims.create({
            key: 'explosion-play',
            frames: frames,
            frameRate: GameConfig.effects.explosion.FRAME_RATE,
            repeat: 0,
            hideOnComplete: true
        });
    }

    /**
     * Crea la animación de explosión por defecto (6 frames)
     */
    createDefaultExplosionAnimation() {
        this.scene.anims.create({
            key: 'explosion-play',
            frames: this.scene.anims.generateFrameNumbers('explosion', { start: 0, end: 5 }),
            frameRate: GameConfig.effects.explosion.FRAME_RATE,
            repeat: 0,
            hideOnComplete: false
        });
    }

    /**
     * Limpia todos los efectos activos
     */
    clear() {
        this.effects.forEach(effect => {
            if (effect && effect.active) {
                effect.destroy();
            }
        });
        this.effects = [];
    }

    /**
     * Obtiene la cantidad de efectos activos
     * @returns {number} Cantidad de efectos
     */
    getActiveEffectCount() {
        return this.effects.length;
    }

    /**
     * Destruye el gestor de efectos
     */
    destroy() {
        this.clear();
    }
}