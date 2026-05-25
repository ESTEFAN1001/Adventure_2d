/**
 * assets_config.js
 * Configuración centralizada de assets
 */

const AssetsConfig = {
    // Imágenes simples
    images: {
        wall: {
            key: 'wall',
            path: 'assets/images/wall.png'
        },
        floor: {
            key: 'floor',
            path: 'assets/images/floor.png'
        },
        projectile: {
            key: 'projectile',
            path: 'assets/images/projectile.png'
        }
    },

    // Spritesheets
    spritesheets: {
        player: {
            key: 'player',
            path: 'assets/images/player.png',
            frameConfig: {
                frameWidth: 98,
                frameHeight: 102,
                spacing: 0
            }
        },
        orc: {
            key: 'orc',
            path: 'assets/images/orc.png',
            frameConfig: {
                frameWidth: 140,
                frameHeight: 150,
                spacing: 0
            }
        },
        explosion: {
            key: 'explosion',
            path: 'assets/images/explosion.png',
            frameConfig: {
                frameWidth: 283,  
                frameHeight: 245, 
                spacing: 0,
                margin: 0,
                rows: 3,
                cols: 3,
            }
        },
        hit: {  
            key: 'hit',
            path: 'assets/images/hit_orc.png',
            frameConfig: {
                frameWidth: 192,  
                frameHeight: 196,
                spacing: 0,
                margin: 0,
                rows: 5,
                cols: 5,
            }
        },
        powerup_speed: {
            key: 'powerup_speed',
            path: 'assets/images/speed.png',
            frameConfig: {
                frameWidth: 32,  
                frameHeight: 32,
                spacing: 0,
                margin: 0,
                rows: 1,
                cols: 3,
            }
        },
        powerup_fire: {
            key: 'powerup_fire',
            path: 'assets/images/fire_rate.png',
            frameConfig: {
                frameWidth: 32,
                frameHeight: 32,
                spacing: 0,
                margin: 0,
                rows: 1,
                cols: 3,
            }
        },
        powerup_damage: {
            key: 'powerup_damage',
            path: 'assets/images/damage.png',
            frameConfig: {
                frameWidth: 32,
                frameHeight: 32,
                spacing: 0,
                margin: 0,
                rows: 1,
                cols: 3,
            }
        },
        powerup_heal: {
            key: 'powerup_heal',
            path: 'assets/images/heal.png',
            frameConfig: {
                frameWidth: 32,
                frameHeight: 32,
                spacing: 0,
                margin: 0,
                rows: 1,
                cols: 3,
            }
        },
        powerup_slow: {
            key: 'powerup_slow',
            path: 'assets/images/slow_down.png',
            frameConfig: {
                frameWidth: 32,
                frameHeight: 32,
                spacing: 0,
                margin: 0,
                rows: 1,
                cols: 3,
            }
        },
        powerup_poison: {
            key: 'powerup_poison',
            path: 'assets/images/poison.png',
            frameConfig: {
                frameWidth: 32,
                frameHeight: 32,
                spacing: 0,
                margin: 0,
                rows: 1,
                cols: 3,
            }
        }
    },

    /**
     * Carga todos los assets
     * @param {Phaser.Scene} scene - Escena de Phaser
     */
    preload(scene) {
        // Cargar imágenes
        Object.values(this.images).forEach(img => {
            scene.load.image(img.key, img.path);
        });

        // Cargar spritesheets
        Object.values(this.spritesheets).forEach(spritesheet => {
            scene.load.spritesheet(
                spritesheet.key,
                spritesheet.path,
                spritesheet.frameConfig
            );
        });
    },

    /**
     * Obtiene una configuración de asset específico
     * @param {string} type - Tipo de asset (images, spritesheets)
     * @param {string} key - Clave del asset
     * @returns {Object} Configuración del asset
     */
    getAsset(type, key) {
        return this[type]?.[key];
    }
};

Object.freeze(AssetsConfig);
