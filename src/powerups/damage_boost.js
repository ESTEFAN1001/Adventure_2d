/**
 * damage_boost.js
 * Aumenta el daño de los proyectiles
 */

class DamageBoost extends PowerUp {
    constructor(config) {
        super(config);
    }

    applyEffect(player) {
        const originalMin = GameConfig.projectiles.DAMAGE_RANGE.min;
        const originalMax = GameConfig.projectiles.DAMAGE_RANGE.max;
        
        GameConfig.projectiles.DAMAGE_RANGE.min = originalMin * this.config.effectValue;
        GameConfig.projectiles.DAMAGE_RANGE.max = originalMax * this.config.effectValue;
        player.addActivePowerUp('damage_boost', this.config.duration);
        
        this.showEffectMessage(player, `💥 DAÑO x${this.config.effectValue}!`, '#ff0000');
        
        // Restaurar después de la duración
        this.scene.time.delayedCall(this.config.duration, () => {
            GameConfig.projectiles.DAMAGE_RANGE.min = originalMin;
            GameConfig.projectiles.DAMAGE_RANGE.max = originalMax;
            this.showEffectEndMessage(player, 'Daño normal');
        });
        
        this.destroy();
    }
}