/**
 * fire_rate_boost.js
 * Aumenta la velocidad de disparo (reduce el delay)
 */

class FireRateBoost extends PowerUp {
    constructor(config) {
        super(config);
    }

    applyEffect(player) {
        // Obtener referencia al projectileManager
        const gameManager = this.scene.gameManager;
        
        if (!gameManager || !gameManager.projectileManager) {
            console.error('[FireRateBoost] No se encontró projectileManager');
            this.destroy();
            return;
        }
        
        const originalDelay = gameManager.projectileManager.fireDelay;
        const boostedDelay = originalDelay * this.config.effectValue;
        
        gameManager.projectileManager.setFireDelay(boostedDelay);
        
        this.showEffectMessage(player, `🔥 CADENCIA +${Math.round((1 - this.config.effectValue) * 100)}%!`, '#ff6600');
        
        // Restaurar después de la duración
        this.scene.time.delayedCall(this.config.duration, () => {
            if (gameManager.projectileManager) {
                gameManager.projectileManager.setFireDelay(originalDelay);
                this.showEffectEndMessage(player, 'Cadencia normal');
            }
        });
        
        this.destroy();
    }
}