/**
 * slow_down.js
 * Reduce la velocidad del jugador (powerup negativo)
 */

class SlowDown extends PowerUp {
    constructor(config) {
        super(config);
    }

    applyEffect(player) {
        const originalSpeed = player.speed;
        const slowedSpeed = originalSpeed * this.config.effectValue;
        
        player.speed = slowedSpeed;
        
        this.showEffectMessage(player, `🐌 VELOCIDAD -${Math.round((1 - this.config.effectValue) * 100)}%!`, '#ff4444');
        
        // Restaurar después de la duración
        this.scene.time.delayedCall(this.config.duration, () => {
            if (player.isActive()) {
                player.speed = originalSpeed;
                this.showEffectEndMessage(player, 'Velocidad restaurada');
            }
        });
        
        this.destroy();
    }
}