/**
 * powerup_manager.js
 * Gestor de spawn de powerups
 */

class PowerUpManager {
    constructor(config) {
        this.scene = config.scene;
        this.player = config.player;
        this.walls = config.walls;
        this.findValidPosition = config.findValidPosition;
        
        this.activePowerUps = [];
        this.spawnTimer = null;
        
        // Mapeo de tipos a clases
        this.powerUpClasses = {
            'speed_boost': SpeedBoost,
            'fire_rate_boost': FireRateBoost,
            'damage_boost': DamageBoost,
            'heal': Heal,
            'slow_down': SlowDown,
            'poison': Poison
        };
        
        this.startSpawning();
    }

    startSpawning() {
        this.scheduleNextSpawn();
    }

    scheduleNextSpawn() {
        if (this.spawnTimer) {
            this.spawnTimer.remove();
        }
        
        const delay = Phaser.Math.Between(
            GameConfig.powerups.SPAWN_INTERVAL.min,
            GameConfig.powerups.SPAWN_INTERVAL.max
        );
        
        this.spawnTimer = this.scene.time.delayedCall(delay, () => {
            this.trySpawnPowerUp();
            this.scheduleNextSpawn();
        });
    }

    trySpawnPowerUp() {
        if (this.activePowerUps.length >= GameConfig.powerups.MAX_ACTIVE_POWERUPS) {
            return;
        }
        
        const position = this.findValidPosition();
        if (!position) return;
        
        // Verificar que no haya otro powerup cerca
        const isOccupied = this.activePowerUps.some(powerup => {
            const pos = powerup.getPosition();
            return Phaser.Math.Distance.Between(pos.x, pos.y, position.x, position.y) < 50;
        });
        
        if (isOccupied) return;
        
        // Seleccionar tipo aleatorio
        const types = Object.keys(this.powerUpClasses);
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        this.spawnPowerUp(randomType, position.x, position.y);
    }

    spawnPowerUp(type, x, y) {
        const PowerUpClass = this.powerUpClasses[type];
        if (!PowerUpClass) {
            console.error(`[PowerUpSpawner] Clase no encontrada para: ${type}`);
            return;
        }
        
        const powerUp = new PowerUpClass({
            scene: this.scene,
            x: x,
            y: y,
            type: type
        });
        
        powerUp.create();
        this.activePowerUps.push(powerUp);
        
        // Colisión con el jugador
        this.scene.physics.add.overlap(
            this.player.sprite,
            powerUp.sprite,
            () => this.onPlayerCollectPowerUp(powerUp),
            null,
            this
        );
    }

    onPlayerCollectPowerUp(powerUp) {
        if (!powerUp.isActive) return;
        
        console.log(`Recogido: ${powerUp.type}`);
        powerUp.applyEffect(this.player);
        this.removePowerUp(powerUp);

        if (this.scene.gameManager && this.scene.gameManager.effectManager) {
            const pos = this.player.getPosition();
            this.scene.gameManager.effectManager.createEffect('power_up_effect', {
                x: pos.x,
                y: pos.y - 2,
                scale: 0.15
            });
        }
    }

    removePowerUp(powerUp) {
        const index = this.activePowerUps.indexOf(powerUp);
        if (index !== -1) {
            this.activePowerUps.splice(index, 1);
        }
    }

    clear() {
        if (this.spawnTimer) this.spawnTimer.remove();
        this.activePowerUps.forEach(powerUp => powerUp.destroy());
        this.activePowerUps = [];
    }

    destroy() {
        this.clear();
    }
}