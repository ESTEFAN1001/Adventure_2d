/**
 * collision_manager.js
 * Gestor centralizado de colisiones
 */

class CollisionManager {
    /**
     * @param {Object} config - Configuración del gestor
     * @param {Phaser.Scene} config.scene - Escena de Phaser
     */
    constructor(config) {
        this.scene = config.scene;
        this.collisionCallbacks = {};
    }

    /**
     * Configura colisiones entre el jugador y el orco
     * @param {Player} player - Instancia del jugador
     * @param {Orc} orc - Instancia del orco
     * @param {Function} onCollision - Callback cuando colisionan
     */
    setupPlayerOrcCollision(player, orc, onCollision) {
        this.scene.physics.add.collider(
            player.sprite,
            orc.sprite,
            onCollision,
            null,
            this.scene
        );
    }

    /**
     * Configura colisiones entre proyectiles y el orco
     * @param {Phaser.Physics.Group} projectiles - Grupo de proyectiles
     * @param {Orc} orc - Instancia del orco
     * @param {Function} onCollision - Callback cuando colisionan
     */
    setupProjectileOrcCollision(projectiles, orc, onCollision) {
        this.scene.physics.add.collider(
            projectiles,
            orc.sprite,
            onCollision,
            null,
            this.scene
        );
    }

    /**
     * Configura colisiones entre proyectiles y paredes
     * @param {Phaser.Physics.Group} projectiles - Grupo de proyectiles
     * @param {Phaser.Physics.StaticGroup} walls - Grupo de paredes
     * @param {Function} onCollision - Callback cuando colisionan
     */
    setupProjectileWallCollision(projectiles, walls, onCollision) {
        this.scene.physics.add.collider(
            projectiles,
            walls,
            onCollision,
            null,
            this.scene
        );
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
}
