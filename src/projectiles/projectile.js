/**
 * projectile.js
 * Clase para gestionar proyectiles
 */

class Projectile {
    /**
     * @param {Object} config - Configuración del proyectil
     * @param {Phaser.Scene} config.scene - Escena de Phaser
     * @param {Phaser.Physics.Group} config.group - Grupo de física para proyectiles
     */
    constructor(config) {
        this.scene = config.scene;
        this.group = config.group;
        this.lastFireTime = 0;
        this.fireDelay = GameConfig.projectiles.FIRE_DELAY;
    }

    /**
     * Dispara un proyectil
     * @param {Character} character - Personaje que dispara
     * @param {string} direction - Dirección del disparo
     */
    fire(character, direction) {
        const currentTime = this.scene.time.now;

        // Verificar delay de disparo
        if (currentTime - this.lastFireTime < this.fireDelay) {
            return false;
        }

        const projectile = this.group.get(character.sprite.x, character.sprite.y);

        if (projectile) {
            projectile.setActive(true);
            projectile.setVisible(true);
            projectile.setScale(0.2);

            // Calcular velocidad según dirección
            const { velocityX, velocityY, rotation } = this.getVelocityAndRotation(direction);

            projectile.setVelocity(velocityX, velocityY);
            projectile.setRotation(rotation);
            projectile.rotation_speed = 5;

            // Destruir después del tiempo de vida
            this.scene.time.delayedCall(GameConfig.projectiles.LIFETIME, () => {
                if (projectile.active) {
                    projectile.destroy();
                }
            });

            this.lastFireTime = currentTime;
            return true;
        }

        return false;
    }

    /**
     * Calcula la velocidad y rotación según la dirección
     * @param {string} direction - Dirección (up, down, left, right)
     * @returns {Object} Objeto con velocityX, velocityY y rotation
     */
    getVelocityAndRotation(direction) {
        const speed = GameConfig.projectiles.SPEED;
        const velocities = {
            left: { velocityX: -speed, velocityY: 0, rotation: Math.PI },
            right: { velocityX: speed, velocityY: 0, rotation: 0 },
            up: { velocityX: 0, velocityY: -speed, rotation: -Math.PI / 2 },
            down: { velocityX: 0, velocityY: speed, rotation: Math.PI / 2 }
        };

        return velocities[direction] || velocities.down;
    }

    /**
     * Obtiene el grupo de proyectiles
     * @returns {Phaser.Physics.Group} Grupo de proyectiles
     */
    getGroup() {
        return this.group;
    }

    /**
     * Obtiene el número de proyectiles activos
     * @returns {number} Cantidad de proyectiles activos
     */
    getActiveCount() {
        return this.group.countActive();
    }

    /**
     * Limpia todos los proyectiles
     */
    clear() {
        this.group.children.entries.forEach(projectile => {
            if (projectile.active) {
                projectile.destroy();
            }
        });
    }
}
