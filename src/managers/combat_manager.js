/**
 * combat_manager.js
 * Gestor de combate
 * Principio SOLID: Single Responsibility - solo gestiona la lógica de combate
 * Soporta múltiples enemigos
 */

class CombatManager {
    /**
     * @param {Object} config - Configuración del gestor de combate
     * @param {Phaser.Scene} config.scene - Escena de Phaser
     * @param {EffectManager} config.effectManager - Gestor de efectos visuales
     */
    constructor(config) {
        this.scene = config.scene;
        this.effectManager = config.effectManager || null;
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
            console.log(`${defender.enemyType || 'Player'} ha muerto`);
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
     * Aplica daño de un enemigo específico al jugador
     * @param {Player} player - Jugador
     * @param {Enemy} enemy - Enemigo que ataca
     */
    enemyAttackPlayer(player, enemy) {
        if (!player.isActive() || !enemy.isActive()) return;

        const damage = Phaser.Math.Between(
            GameConfig.combat.ORC_DAMAGE_RANGE.min,
            GameConfig.combat.ORC_DAMAGE_RANGE.max
        );

        // Efecto visual de ataque
        if (this.effectManager) {
            const pos = player.getPosition();
            this.effectManager.createEffect('hit', {
                x: pos.x,
                y: pos.y,
            });
        }

        const died = this.dealDamage(enemy, player, damage);

        if (died) {
            this.handlePlayerDeath(player);
        }
    }

    /**
     * Maneja la muerte del jugador (versión compatible)
     * @param {Character} player - Jugador
     */
    orcAttackPlayer(player, orc) {
        this.enemyAttackPlayer(player, orc);
    }

    /**
     * Proyectil golpea a un enemigo
     * @param {Phaser.Physics.Sprite} projectile - Proyectil
     * @param {Enemy} enemy - Enemigo golpeado
     */
    projectileHitEnemy(projectile, enemy) {
        // Verificar que el enemigo está vivo y es activo
        if (!enemy || !enemy.isActive()) {
            if (projectile && projectile.active) {
                projectile.destroy();
            }
            return;
        }

        // Verificar que el proyectil existe y es activo
        if (!projectile || !projectile.active) {
            return;
        }

        // Obtener posición del impacto
        const impactPos = {
            x: projectile.x,
            y: projectile.y
        };

        // Aplicar daño aleatorio entre 5 y 15
        const damage = Phaser.Math.Between(
            GameConfig.projectiles.DAMAGE_RANGE.min,
            GameConfig.projectiles.DAMAGE_RANGE.max
        );

        console.log(`Proyectil golpea a ${enemy.enemyType}: ${damage} daño`);
        this.dealDamage(null, enemy, damage);

        // Crear efecto de explosión en el punto de impacto
        if (this.effectManager) {
            console.log(`Creando explosión en (${impactPos.x}, ${impactPos.y})`);
            this.effectManager.createEffect('explosion', {
                x: impactPos.x,
                y: impactPos.y,
            });

        } else {
            console.error('EffectManager no está disponible');
        }
        
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
     * @param {Array} enemies - Array de enemigos
     * @returns {Object} Estado del juego {gameOver: boolean, winner: string}
     */
    checkCombatStatus(player, enemies) {
        // Verificar si el jugador está vivo
        const playerAlive = player.isActive();
        
        // Verificar si hay enemigos vivos
        const enemiesAlive = enemies.some(enemy => enemy.isActive());

        if (!playerAlive && !enemiesAlive) {
            return { gameOver: true, winner: 'draw' };
        }

        if (!playerAlive) {
            return { gameOver: true, winner: 'enemies' };
        }

        if (!enemiesAlive) {
            return { gameOver: true, winner: 'player' };
        }

        return { gameOver: false, winner: null };
    }
}