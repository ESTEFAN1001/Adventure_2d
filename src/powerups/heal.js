/**
 * heal.js
 * Cura al jugador
 */

class Heal extends PowerUp {
    constructor(config) {
        super(config);
    }

    applyEffect(player) {
        const healAmount = Phaser.Math.Between(
            GameConfig.powerups.HEAL_RANGE.min,
            GameConfig.powerups.HEAL_RANGE.max
        );
        
        const oldHealth = player.currentHealth;
        const newHealth = Math.min(player.maxHealth, oldHealth + healAmount);
        const actualHeal = newHealth - oldHealth;
        
        player.currentHealth = newHealth;
        
        // Actualizar barra de vida
        if (player.healthBar) {
            player.healthBar.update();
        }
        
        this.showEffectMessage(player, `❤️ +${actualHeal} VIDA!`, '#00ff00');
        
        this.destroy();
    }
}