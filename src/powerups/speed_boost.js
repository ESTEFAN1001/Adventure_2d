/**
 * speed_boost.js
 * Aumenta la velocidad del jugador
 */

class SpeedBoost extends PowerUp {
    constructor(config) {
        super(config);
    }

    applyEffect(player) {
        const originalSpeed = player.speed;
        const boostedSpeed = originalSpeed * this.config.effectValue;
        
        player.speed = boostedSpeed;
        player.addActivePowerUp('speed_boost', this.config.duration);
        
        this.showEffectMessage(player, `⚡ VELOCIDAD +${(this.config.effectValue - 1) * 100}%!`, '#00ff00');
        
        // Restaurar después de la duración
        this.scene.time.delayedCall(this.config.duration, () => {
            if (player.isActive()) {
                player.speed = originalSpeed;
                this.showEffectEndMessage(player, 'Velocidad normal');
            }
        });
        
        this.destroy();
    }
}