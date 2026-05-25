/**
 * powerup.js
 * Clase base abstracta para todos los powerups
 */

class PowerUp {
    /**
     * @param {Object} config - Configuración del powerup
     * @param {Phaser.Scene} config.scene - Escena de Phaser
     * @param {number} config.x - Posición X
     * @param {number} config.y - Posición Y
     * @param {string} config.type - Tipo de powerup
     */
    constructor(config) {
        this.scene = config.scene;
        this.x = config.x;
        this.y = config.y;
        this.type = config.type;
        this.config = GameConfig.powerups.types[this.type];
        
        this.spriteKeyMap = {
            'speed_boost': 'powerup_speed',
            'fire_rate_boost': 'powerup_fire',
            'damage_boost': 'powerup_damage',
            'heal': 'powerup_heal',
            'slow_down': 'powerup_slow',
            'poison': 'powerup_poison'
        };
        
        this.sprite = null;
        this.text = null;
        this.isActive = true;
    }

    /**
     * Crea el sprite del powerup 
     */
    create() {
        const spriteKey = this.spriteKeyMap[this.type];
        
        // Verificar que existe el spritesheet
        if (!this.scene.textures.exists(spriteKey)) {
            console.error(`[PowerUp] Spritesheet no encontrado: ${spriteKey} para tipo ${this.type}`);
            return;
        }
        
        // Crear sprite con frame 0
        this.sprite = this.scene.add.sprite(this.x, this.y, spriteKey, 0);
        this.sprite.setDepth(900);
        this.sprite.setScale(1.5);
        
        // Agregar física
        this.scene.physics.add.existing(this.sprite);
        this.sprite.body.setCircle(16);
        this.sprite.body.setImmovable(true);
        
        // ANIMACIÓN de los 3 frames
        this.scene.anims.create({
            key: `anim_${this.type}`,
            frames: this.scene.anims.generateFrameNumbers(spriteKey, {
                start: 0,
                end: 2
            }),
            frameRate: 6,
            repeat: -1
        });
        
        this.sprite.anims.play(`anim_${this.type}`);
        
        // Texto opcional
        this.text = this.scene.add.text(this.x, this.y - 28, this.config.name, {
            font: 'bold 10px Arial',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        });
        this.text.setOrigin(0.5);
        this.text.setDepth(901);
        
        // Animación flotante
        this.scene.tweens.add({
            targets: [this.sprite, this.text],
            y: this.y - 8,
            duration: 1200,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Método abstracto - debe ser implementado por las clases hijas
     * @param {Player} player - El jugador
     */
    applyEffect(player) {
        throw new Error('applyEffect() debe ser implementado por la clase hija');
    }

    /**
     * Muestra mensaje de efecto aplicado
     * @param {Player} player - El jugador
     * @param {string} message - Mensaje a mostrar
     * @param {string} color - Color del mensaje
     */
    showEffectMessage(player, message, color = '#ffff00') {
        const pos = player.getPosition();
        const effectText = this.scene.add.text(pos.x, pos.y - 55, message, {
            font: 'bold 16px Arial',
            fill: color,
            stroke: '#000000',
            strokeThickness: 3
        });
        effectText.setOrigin(0.5);
        effectText.setDepth(1000);
        
        this.scene.tweens.add({
            targets: effectText,
            y: effectText.y - 70,
            alpha: 0,
            duration: 1500,
            onComplete: () => effectText.destroy()
        });
    }

    /**
     * Muestra mensaje de fin de efecto
     * @param {Player} player - El jugador
     * @param {string} message - Mensaje a mostrar
     */
    showEffectEndMessage(player, message) {
        const pos = player.getPosition();
        const effectText = this.scene.add.text(pos.x, pos.y - 55, message, {
            font: '12px Arial',
            fill: '#cccccc',
            stroke: '#000000',
            strokeThickness: 2
        });
        effectText.setOrigin(0.5);
        effectText.setDepth(1000);
        
        this.scene.tweens.add({
            targets: effectText,
            y: effectText.y - 50,
            alpha: 0,
            duration: 1000,
            onComplete: () => effectText.destroy()
        });
    }

    /**
     * Destruye el powerup
     */
    destroy() {
        this.isActive = false;
        if (this.sprite) this.sprite.destroy();
        if (this.text) this.text.destroy();
    }

    /**
     * Obtiene la posición del powerup
     */
    getPosition() {
        return { x: this.sprite?.x || this.x, y: this.sprite?.y || this.y };
    }
}