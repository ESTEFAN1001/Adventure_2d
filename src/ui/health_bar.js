/**
 * health_bar.js
 * Clase para gestionar barras de vida
 */

class HealthBar {
    /**
     * @param {Object} config - Configuración de la barra de vida
     * @param {Phaser.Scene} config.scene - Escena de Phaser
     * @param {Character} config.character - Personaje asociado
     * @param {Object} config.style - Estilos de la barra y texto
     */
    constructor(config) {
        this.scene = config.scene;
        this.character = config.character;
        this.style = config.style || {
            barWidth: 50,
            barHeight: 10,
            offsetY: 40,
            textOffsetY: 55,
            backgroundColor: 0x000000,
            healthColor: 0xff0000,
            textStyle: {
                font: '12px Arial',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2
            }
        };

        this.graphics = this.scene.add.graphics();
        this.text = this.scene.add.text(0, 0, '', this.style.textStyle);
        this.isVisible = true;

        // Configuración de la barra de dash
        this.dashBarHeight = 5;
        this.dashBarSpacing = 2;
    }

    /**
     * Actualiza la posición y estado de la barra de vida
     */
    update() {
        if (!this.isVisible || !this.character.sprite) return;

        const pos = this.character.getPosition();
        const barX = pos.x - this.style.barWidth / 2;
        const barY = pos.y - this.style.offsetY;

        // Limpiar y redibujar la barra
        this.graphics.clear();
        
        // Barra de vida
        // Fondo negro
        this.graphics.fillStyle(this.style.backgroundColor);
        this.graphics.fillRect(barX, barY, this.style.barWidth, this.style.barHeight);

        // Barra de vida
        const healthPercent = this.character.currentHealth / this.character.maxHealth;
        const healthWidth = Math.max(0, this.style.barWidth * healthPercent);
        
        this.graphics.fillStyle(this.style.healthColor);
        this.graphics.fillRect(barX, barY, healthWidth, this.style.barHeight);

        // Barra de dash 
        if (typeof this.character.getDashCooldownRemaining === 'function') {
            const dashY = barY + this.style.barHeight + this.dashBarSpacing;
            
            // Fondo de la barra de dash
            this.graphics.fillStyle(this.style.backgroundColor);
            this.graphics.fillRect(barX, dashY, this.style.barWidth, this.dashBarHeight);
            
            const dashCooldownRemaining = this.character.getDashCooldownRemaining();
            const dashCooldown = this.character.DASH_COOLDOWN;
            const dashPercent = Math.max(0, (dashCooldown - dashCooldownRemaining) / dashCooldown);
            const dashWidth = Math.max(0, this.style.barWidth * dashPercent);
            
            // Color verde cuando está listo, naranja cuando está en cooldown
            const dashColor = dashCooldownRemaining <= 0 ? 0x00ff00 : 0xff8800;
            this.graphics.fillStyle(dashColor);
            this.graphics.fillRect(barX, dashY, dashWidth, this.dashBarHeight);
        }

        // Actualizar texto
        this.text.setPosition(
            pos.x - this.style.barWidth / 2,
            pos.y - this.style.textOffsetY
        );
        this.text.setText(`${this.character.currentHealth}/${this.character.maxHealth}`);
    }

    /**
     * Muestra la barra de vida
     */
    show() {
        this.isVisible = true;
        this.text.setVisible(true);
    }

    /**
     * Oculta la barra de vida
     */
    hide() {
        this.isVisible = false;
        this.text.setVisible(false);
        this.graphics.clear();
    }

    /**
     * Cambia el color de la barra de vida
     * @param {number} color - Color hexadecimal
     */
    setHealthColor(color) {
        this.style.healthColor = color;
    }

    /**
     * Establece el color del texto
     * @param {string} color - Color CSS
     */
    setTextColor(color) {
        this.text.setColor(color);
    }

    /**
     * Destruye la barra de vida
     */
    destroy() {
        this.graphics.destroy();
        this.text.destroy();
    }
}
