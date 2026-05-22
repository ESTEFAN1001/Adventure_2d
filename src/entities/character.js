/**
 * character.js
 * Clase base para todos los personajes (jugador, enemigos, etc.)
 * Principio SOLID: Single Responsibility - gestiona las propiedades comunes
 */

class Character {
    /**
     * @param {Object} config - Configuración del personaje
     * @param {Phaser.Scene} config.scene - Escena de Phaser
     * @param {number} config.x - Posición X
     * @param {number} config.y - Posición Y
     * @param {string} config.sprite - Clave del sprite
     * @param {number} config.maxHealth - Salud máxima
     * @param {number} config.speed - Velocidad de movimiento
     * @param {Object} config.spriteConfig - Configuración del sprite
     */
    constructor(config) {
        this.scene = config.scene;
        this.x = config.x;
        this.y = config.y;
        this.sprite = null;
        this.maxHealth = config.maxHealth;
        this.currentHealth = config.maxHealth;
        this.speed = config.speed;
        this.spriteConfig = config.spriteConfig;
        this.currentDirection = 'down';
        this.isAlive = true;
        this.lastDamageTime = 0;
        this.damageDelay = 0;
        this.velocity = { x: 0, y: 0 };
    }

    /**
     * Crea el sprite del personaje
     * @param {string} spriteKey - Clave del sprite a usar
     */
    createSprite(spriteKey) {
        this.sprite = this.scene.physics.add.sprite(this.x, this.y, spriteKey);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.setScale(this.spriteConfig.scale);
        
        // Configurar hitbox
        this.sprite.body.setSize(
            this.spriteConfig.hitbox.width,
            this.spriteConfig.hitbox.height
        );
        this.sprite.body.setOffset(
            this.spriteConfig.hitbox.offsetX,
            this.spriteConfig.hitbox.offsetY
        );
    }

    /**
     * Aplica daño al personaje
     * @param {number} amount - Cantidad de daño
     * @returns {boolean} True si el personaje murió
     */
    takeDamage(amount) {
        const currentTime = this.scene.time.now;

        // Verificar delay de daño
        if (currentTime - this.lastDamageTime < this.damageDelay) {
            return false;
        }

        this.currentHealth = Math.max(0, this.currentHealth - amount);
        this.lastDamageTime = currentTime;

        if (this.currentHealth <= 0) {
            this.die();
            return true;
        }

        return false;
    }

    /**
     * Método llamado cuando el personaje muere
     */
    die() {
        this.isAlive = false;
        if (this.sprite) {
            this.sprite.setActive(false);
            this.sprite.setVisible(false);
        }
    }

    /**
     * Establece la velocidad del personaje
     * @param {number} vx - Velocidad en X
     * @param {number} vy - Velocidad en Y
     */
    setVelocity(vx, vy) {
        this.velocity.x = vx;
        this.velocity.y = vy;
        if (this.sprite) {
            this.sprite.setVelocity(vx, vy);
        }
    }

    /**
     * Obtiene la posición actual
     * @returns {Object} Posición {x, y}
     */
    getPosition() {
        return {
            x: this.sprite?.x || this.x,
            y: this.sprite?.y || this.y
        };
    }

    /**
     * Obtiene la distancia a otro personaje
     * @param {Character} other - Otro personaje
     * @returns {number} Distancia en píxeles
     */
    getDistanceTo(other) {
        const pos1 = this.getPosition();
        const pos2 = other.getPosition();
        return Phaser.Math.Distance.Between(pos1.x, pos1.y, pos2.x, pos2.y);
    }

    /**
     * Verifica si el personaje está vivo
     * @returns {boolean} True si está vivo
     */
    isActive() {
        return this.isAlive && this.sprite?.active;
    }

    /**
     * Actualiza el estado del personaje (llamado en cada frame)
     */
    update() {
        // Será sobrescrito por las clases derivadas
    }

    /**
     * Limpia los recursos del personaje
     */
    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
        this.isAlive = false;
    }
}
