/**
 * effect_manager.js
 * Gestor centralizado de efectos visuales
 * Completamente dinámico - lee toda la configuración de AssetsConfig y GameConfig
 */

class EffectManager {
    constructor(config) {
        this.scene = config.scene;
        this.effects = [];
    }

    /**
    * Obtiene la configuración completa de un efecto
    * @param {string} effectType - Tipo de efecto
    * @returns {Object} Configuración combinada
    */
    getEffectConfig(effectType) {
        const gameConfig = GameConfig.effects[effectType];
        const spritesheetConfig = AssetsConfig.spritesheets[effectType];
        
        if (!gameConfig || !spritesheetConfig) {
            return null;
        }
        
        return {
            //GameConfig
            scale: gameConfig.SCALE,
            duration: gameConfig.DURATION,
            frameRate: gameConfig.FRAME_RATE,

            //AssetsConfig
            textureKey: spritesheetConfig.key,
            frameWidth: spritesheetConfig.frameConfig.frameWidth,
            frameHeight: spritesheetConfig.frameConfig.frameHeight,
            rows: spritesheetConfig.frameConfig.rows,
            cols: spritesheetConfig.frameConfig.cols,
            totalFrames: spritesheetConfig.frameConfig.rows * spritesheetConfig.frameConfig.cols
        };
    }

    /**
     * Crea un efecto visual dinámicamente
     * @param {string} effectType - Tipo de efecto ('explosion', 'hit', 'fireball', etc.)
     * @param {Object} config - Configuración específica del efecto
     * @returns {Phaser.GameObjects.Sprite} El sprite del efecto
     */
    createEffect(effectType, config = {}) {
        // Obtener configuración completa
        const effectConfig = this.getEffectConfig(effectType);
        
        if (!effectConfig) {
            console.error(`[EffectManager] Efecto '${effectType}' no encontrado en configuraciones`);
            return null;
        }

        const {
            x,
            y,
            scale = effectConfig.scale,
            duration = effectConfig.duration
        } = config;

        // Crear el sprite
        const effectSprite = this.scene.add.sprite(x, y, effectType);
        effectSprite.setScale(scale);
        effectSprite.setDepth(1000);

        // Key de animación
        const animationKey = `${effectType}-anim`;
        
        // Crear animación si no existe
        if (!this.scene.anims.exists(animationKey)) {
            const frames = this.scene.anims.generateFrameNumbers(effectType, {
                start: 0,
                end: effectConfig.totalFrames - 1,
                first: 0
            });
            
            if (frames.length === 0) {
                console.error(`[EffectManager] No se pudieron generar frames para '${effectType}'`);
                return null;
            }
            
            this.scene.anims.create({
                key: animationKey,
                frames: frames,
                frameRate: effectConfig.frameRate,
                repeat: 0,
                hideOnComplete: true
            });
            
        }
        
        // Reproducir animación
        effectSprite.play(animationKey);
        
        // Auto-destrucción
        effectSprite.on('animationcomplete', () => {
            if (effectSprite && effectSprite.active) {
                effectSprite.destroy();
            }
            this.effects = this.effects.filter(e => e !== effectSprite);
        });
        
        // Backup timeout
        this.scene.time.delayedCall(duration + 100, () => {
            if (effectSprite && effectSprite.active) {
                effectSprite.destroy();
                this.effects = this.effects.filter(e => e !== effectSprite);
            }
        });
        
        this.effects.push(effectSprite);
        return effectSprite;
    }

    /**
     * Métodos de conveniencia (compatibilidad con código existente)
     */
    createExplosion(config) {
        return this.createEffect('explosion', config);
    }

    createHitEffect(config) {
        return this.createEffect('hit', config);
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

    getActiveEffectCount() {
        return this.effects.length;
    }

    destroy() {
        this.clear();
    }
}