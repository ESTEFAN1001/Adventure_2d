/**
 * combat_manager.js
 * Gestor de combate
 * Principio SOLID: Single Responsibility - solo gestiona la lógica de combate
 */

class CombatManager {
    /**
     * @param {Object} config - Configuración del gestor de combate
     * @param {Phaser.Scene} config.scene - Escena de Phaser
     */
    constructor(config) {
        this.scene = config.scene;
    }

    /**
     * Aplica daño entre dos personajes
     * @param {Character} attacker - Personaje que ataca
     * @param {Character} defender - Personaje que recibe daño
     * @param {number} damageAmount - Cantidad de daño
     */
    dealDamage(attacker, defender, damageAmount) {
        if (!defender.isActive()) return;

        const died = defender.takeDamage(damageAmount);

        this.createDamageText(defender, damageAmount);

        if (died) {
            console.log(`${defender.constructor.name} ha muerto`);
        }

        return died;
    }

    /**
     * Crea un efecto visual de daño flotante
     * @param {Character} character - Personaje que recibe daño
     * @param {number} amount - Cantidad de daño
     */
    createDamageText(character, amount) {
        const pos = character.getPosition();

        const damageText = this.scene.add.text(pos.x, pos.y - 30, `-${amount}`, {
            font: '20px Arial',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 2
        });

        this.scene.tweens.add({
            targets: damageText,
            y: damageText.y - 40,
            alpha: 0,
            duration: 800,
            onComplete: () => damageText.destroy()
        });
    }

    /**
     * Aplica daño del orco al jugador
     * @param {Character} player - Jugador
     * @param {Character} orc - Orco
     */
    orcAttackPlayer(player, orc) {
        if (!player.isActive() || !orc.isActive()) return;

        const damage = Phaser.Math.Between(
            GameConfig.combat.ORC_DAMAGE_RANGE.min,
            GameConfig.combat.ORC_DAMAGE_RANGE.max
        );

        const died = this.dealDamage(orc, player, damage);

        if (died) {
            this.handlePlayerDeath(player);
        }
    }

    /**
     * Proyectil golpea al orco
     * @param {Phaser.Physics.Sprite} projectile - Proyectil
     * @param {Orc} orc - Orco
     */
    projectileHitOrc(projectile, orc) {
        // Verificar que el orco está vivo y es activo
        if (!orc || !orc.isActive()) {
            if (projectile && projectile.active) {
                projectile.destroy();
            }
            return;
        }

        // Verificar que el proyectil existe y es activo
        if (!projectile || !projectile.active) {
            return;
        }

        // Aplicar daño aleatorio entre 5 y 15
        const damage = Phaser.Math.Between(
            GameConfig.projectiles.DAMAGE_RANGE.min,
            GameConfig.projectiles.DAMAGE_RANGE.max
        );

        console.log(`Proyectil golpea al orco: ${damage} daño`);
        this.dealDamage(null, orc, damage);
        
        // Destruir el proyectil solo una vez
        if (projectile.active) {
            projectile.destroy();
        }
    }

    /**
     * Maneja la muerte del jugador
     * @param {Character} player - Jugador
     */
    handlePlayerDeath(player) {
        console.log('¡GAME OVER! El jugador ha muerto');
        this.scene.physics.pause();

        const pos = player.getPosition();
        this.scene.add.text(pos.x, pos.y - 50, 'GAME OVER', {
            font: '32px Arial',
            fill: '#ff0000',
            stroke: '#000000',
            strokeThickness: 4
        }).setScrollFactor(0);
    }

    /**
     * Verifica si el combate ha terminado
     * @param {Character} player - Jugador
     * @param {Character} orc - Orco
     * @returns {Object} Estado del juego {gameOver: boolean, winner: string}
     */
    checkCombatStatus(player, orc) {
        if (!player.isActive() && !orc.isActive()) {
            return { gameOver: true, winner: 'draw' };
        }

        if (!player.isActive()) {
            return { gameOver: true, winner: 'orc' };
        }

        if (!orc.isActive()) {
            return { gameOver: true, winner: 'player' };
        }

        return { gameOver: false, winner: null };
    }
}
