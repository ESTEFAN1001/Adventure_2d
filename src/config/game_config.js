/**
 * game_config.js
 * Configuración centralizada del juego
 */

const GameConfig = {
    // Configuración de Phaser
    phaser: {
        type: Phaser.AUTO,
        width: window.innerWidth,  
        height: window.innerHeight, 
        parent: 'game',
        pixelArt: true,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        }
    },

    // Configuración del mapa
    map: {
        TILE_SIZE: 32,
        MAP_WIDTH: 50,
        MAP_HEIGHT: 50
    },

    // Configuración del jugador
    player: {
        MAX_HEALTH: 100,
        SPEED: 160,
        CLOTHES_DEFAULT: 'red', // 'red' o 'black'
        SPRITE_CONFIG: {
            frameWidth: 98,
            frameHeight: 102,
            scale: 0.5,
            hitbox: {
                width: 32,
                height: 32,
                offsetX: 33,
                offsetY: 50
            }
        }
    },

    // Configuración del orco
    orc: {
        MAX_HEALTH: 200,
        SPEED: 120,
        DETECTION_RADIUS: 200,
        SPRITE_CONFIG: {
            frameWidth: 140,
            frameHeight: 150,
            scale: 0.6,
            hitbox: {
                width: 52,
                height: 52,
                offsetX: 26,
                offsetY: 36
            }
        }
    },

    // Configuración de proyectiles
    projectiles: {
        SPEED: 200,
        FIRE_DELAY: 500, // milisegundos
        MAX_SIZE: 10,
        LIFETIME: 2000, // milisegundos
        DAMAGE_RANGE: { min: 5, max: 15 }
    },

    // Configuración de efectos visuales
    effects: {
        explosion: {
            SCALE: 0.5,
            DURATION: 600,
            FRAME_RATE: 12
        },
        hit: {
            SCALE: 0.5,     
            DURATION: 400,   
            FRAME_RATE: 20, 
        }
    },

    // Configuración de daño
    combat: {
        PLAYER_DAMAGE_DELAY: 1000, // milisegundos entre daños
        ORC_DAMAGE_RANGE: { min: 10, max: 20 }
    },

    // Configuración de animaciones
    animations: {
        DIRECTIONS: ['up', 'down', 'left', 'right'],
        FRAME_RATE: 8,
        IDLE_FRAME_RATE: 2
    },

    // Configuración de debugging
    debug: {
        LOG_INTERVAL: 60, // frames
        ENABLED: true
    }
};

Object.freeze(GameConfig);
