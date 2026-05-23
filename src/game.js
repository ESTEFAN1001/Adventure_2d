/**
 * game.js
 * Punto de entrada principal del juego
 * Implementa la escena de Phaser y orquesta el juego a través del GameManager*/

// Variable global para el gestor del juego
let gameManager;

// Configuración de Phaser basada en GameConfig
const config = {
    ...GameConfig.phaser,
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Crear instancia del juego
const game = new Phaser.Game(config);

/**
 * Fase de precarga de Phaser
 * Carga los assets necesarios
 */
function preload() {
    // El GameManager cargará los assets a través de AssetsConfig
    gameManager = new GameManager(this);
    gameManager.initialize();
}

/**
 * Fase de creación de Phaser
 * Configura el juego, entidades y managers
 */
function create() {
    // Cambiar la cantidad y tipos de enemigos aquí:
    gameManager.setEnemySpawnConfig({
        'orc': 3
    });

    gameManager.setup();

    // Configurar evento de disparo
    this.input.keyboard.on('keydown-SPACE', () => {
        gameManager.fireProjectile();
    });
}

/**
 * Fase de actualización de Phaser
 * Llamada cada frame para actualizar el estado del juego
 */
function update() {
    gameManager.update();
}