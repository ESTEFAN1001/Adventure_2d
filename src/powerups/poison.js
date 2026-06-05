/**
 * poison.js
 * Envenena al jugador, causando daño por tick
 */

class Poison extends PowerUp {
    constructor(config) {
        super(config);
    }

    applyEffect(player) {
        let ticks = 0;
        const maxTicks = GameConfig.powerups.POISON_MAX_TICKS;
        const tickDamage = GameConfig.powerups.POISON_TICK_DAMAGE;
        const tickInterval = GameConfig.powerups.POISON_TICK_INTERVAL;
        
        player.addActivePowerUp('poison', this.config.duration);
        
        this.showEffectMessage(player, '☠️ ENVENENADO!', '#aa44ff');
        
        // Mostrar contador de veneno
        let poisonCounter = null;
        
        const poisonInterval = this.scene.time.addEvent({
            delay: tickInterval,
            repeat: maxTicks - 1,
            callback: () => {
                if (player.isActive() && ticks < maxTicks) {
                    ticks++;
                    
                    // Aplicar daño
                    player.takeDamage(tickDamage);
                    
                    // Mostrar texto de daño
                    const pos = player.getPosition();
                    const poisonText = this.scene.add.text(pos.x, pos.y - 45, `POISON! -${tickDamage}`, {
                        font: 'bold 12px Arial',
                        fill: '#aa44ff',
                        stroke: '#000000',
                        strokeThickness: 2
                    });
                    poisonText.setOrigin(0.5);
                    poisonText.setDepth(1000);
                    
                    this.scene.tweens.add({
                        targets: poisonText,
                        y: poisonText.y - 35,
                        alpha: 0,
                        duration: 500,
                        onComplete: () => poisonText.destroy()
                    });
                    
                    // Actualizar contador
                    if (poisonCounter) {
                        poisonCounter.setText(`POISON: ${ticks}/${maxTicks}`);
                    }
                }
            }
        });
        
        // Crear contador visual
        const pos = player.getPosition();
        poisonCounter = this.scene.add.text(pos.x, pos.y - 70, `POISON: 0/${maxTicks}`, {
            font: 'bold 10px Arial',
            fill: '#aa44ff',
            stroke: '#000000',
            strokeThickness: 2
        });
        poisonCounter.setOrigin(0.5);
        poisonCounter.setDepth(1000);
        
        // Seguir al jugador
        const followInterval = this.scene.time.addEvent({
            delay: 50,
            repeat: maxTicks * (tickInterval / 50),
            callback: () => {
                if (player.isActive() && poisonCounter) {
                    const playerPos = player.getPosition();
                    poisonCounter.setPosition(playerPos.x, playerPos.y - 70);
                } else if (poisonCounter) {
                    poisonCounter.destroy();
                }
            }
        });
        
        // Limpiar después del veneno
        this.scene.time.delayedCall(maxTicks * tickInterval + 500, () => {
            if (poisonCounter) poisonCounter.destroy();
            followInterval.destroy();
        });
        
        this.destroy();
    }
}