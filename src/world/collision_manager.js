/**
 * collision_manager.js
 * Gestor centralizado de colisiones
 * Soporta colisiones con múltiples enemigos
 */

class CollisionManager {
    /**
     * @param {Object} config - Configuración del gestor
     * @param {Phaser.Scene} config.scene - Escena de Phaser
     */
    constructor(config) {
        this.scene = config.scene;
        this.collisionCallbacks = {};
        this.activeColliders = [];
    }

    /**
     * Configura colisiones entre el jugador y un único enemigo
     * @param {Player} player - Instancia del jugador
     * @param {Enemy} enemy - Instancia del enemigo
     * @param {Function} onCollision - Callback cuando colisionan
     */
    setupPlayerEnemyCollision(player, enemy, onCollision) {
        const collider = this.scene.physics.add.collider(
            player.sprite,
            enemy.sprite,
            onCollision,
            null,
            this.scene
        );
        this.activeColliders.push(collider);
    }

    /**
     * Configura colisiones entre el jugador y múltiples enemigos
     * @param {Player} player - Instancia del jugador
     * @param {Array} enemies - Array de enemigos
     * @param {Function} onCollision - Callback cuando colisionan (recibe player, enemy)
     */
    setupPlayerMultipleEnemiesCollision(player, enemies, onCollision) {
        enemies.forEach(enemy => {
            this.setupPlayerEnemyCollision(player, enemy, (playerSprite, enemySprite) => {
                onCollision(player, enemy);
            });
        });
    }

    /**
     * Configura colisiones entre proyectiles y un único enemigo
     * @param {Phaser.Physics.Group} projectiles - Grupo de proyectiles
     * @param {Enemy} enemy - Instancia del enemigo
     * @param {Function} onCollision - Callback cuando colisionan
     */
    setupProjectileEnemyCollision(projectiles, enemy, onCollision) {
        const collider = this.scene.physics.add.collider(
            projectiles,
            enemy.sprite,
            onCollision,
            null,
            this.scene
        );
        this.activeColliders.push(collider);
    }

    /**
     * Configura colisiones entre proyectiles y múltiples enemigos
     * @param {Phaser.Physics.Group} projectiles - Grupo de proyectiles
     * @param {Array} enemies - Array de enemigos
     * @param {Function} onCollision - Callback cuando colisionan (recibe projectile, enemySprite)
     */
    setupProjectileMultipleEnemiesCollision(projectiles, enemies, onCollision) {
        enemies.forEach(enemy => {
            this.setupProjectileEnemyCollision(projectiles, enemy, (projectile, enemySprite) => {
                onCollision(projectile, enemySprite);
            });
        });
    }

    /**
     * Configura colisiones entre proyectiles y paredes
     * @param {Phaser.Physics.Group} projectiles - Grupo de proyectiles
     * @param {Phaser.Physics.StaticGroup} walls - Grupo de paredes
     * @param {Function} onCollision - Callback cuando colisionan
     */
    setupProjectileWallCollision(projectiles, walls, onCollision) {
        const collider = this.scene.physics.add.collider(
            projectiles,
            walls,
            onCollision,
            null,
            this.scene
        );
        this.activeColliders.push(collider);
    }

    /**
     * Registra un callback de colisión personalizado
     * @param {string} id - Identificador único
     * @param {Function} callback - Función a ejecutar
     */
    registerCollisionCallback(id, callback) {
        this.collisionCallbacks[id] = callback;
    }

    /**
     * Ejecuta un callback de colisión registrado
     * @param {string} id - Identificador del callback
     * @param {...*} args - Argumentos para pasar al callback
     */
    executeCollisionCallback(id, ...args) {
        if (this.collisionCallbacks[id]) {
            this.collisionCallbacks[id](...args);
        }
    }

    /**
     * Limpia todos los callbacks
     */
    clearCallbacks() {
        this.collisionCallbacks = {};
    }

    /**
     * Limpia todos los colisores activos
     */
    clearColliders() {
        this.activeColliders.forEach(collider => {
            collider.destroy();
        });
        this.activeColliders = [];
    }

    /**
     * Limpia todos los recursos
     */
    destroy() {
        this.clearCallbacks();
        this.clearColliders();
    }
}
