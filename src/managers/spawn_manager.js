/**
 * spawn_manager.js
 * Gestor de spawn de enemigos
 * Controla la creación y ciclo de vida de múltiples enemigos
 * Soporta diferentes tipos de enemigos y colisiones con múltiples objetivos
 */

class SpawnManager {
    /**
     * @param {Object} config - Configuración del gestor
     * @param {Phaser.Scene} config.scene - Escena de Phaser
     * @param {Character} config.player - Referencia al jugador
     * @param {Object} config.walls - Grupo de paredes
     * @param {Function} config.findValidPositionFarFromPlayer - Función para encontrar posiciones válidas
     */
    constructor(config) {
        this.scene = config.scene;
        this.player = config.player;
        this.walls = config.walls;
        this.findValidPositionFarFromPlayer = config.findValidPositionFarFromPlayer;

        // Array de enemigos activos
        this.enemies = [];

        // Mapeo de tipos de enemigos a sus constructores
        this.enemyTypes = {
            'orc': Orc
        };

        // Mapeo de barras de salud para cada enemigo
        this.healthBars = new Map();

        console.log('SpawnManager inicializado');
    }

    /**
     * Registra un nuevo tipo de enemigo
     * @param {string} name - Nombre del tipo de enemigo
     * @param {Class} EnemyClass - Clase del enemigo
     */
    registerEnemyType(name, EnemyClass) {
        this.enemyTypes[name] = EnemyClass;
        console.log(`Tipo de enemigo registrado: ${name}`);
    }

    /**
     * Spawn múltiples enemigos del mismo tipo
     * @param {string} enemyType - Tipo de enemigo a crear ('orc', etc.)
     * @param {number} count - Cantidad de enemigos a crear
     * @returns {Array} Array de enemigos creados
     */
    spawnEnemies(enemyType, count) {
        if (!this.enemyTypes[enemyType]) {
            console.error(`Tipo de enemigo desconocido: ${enemyType}`);
            return [];
        }

        const spawnedEnemies = [];

        for (let i = 0; i < count; i++) {
            const enemy = this.spawnEnemy(enemyType);
            if (enemy) {
                spawnedEnemies.push(enemy);
            }
        }

        console.log(`${spawnedEnemies.length} ${enemyType}(s) generado(s)`);
        return spawnedEnemies;
    }

    /**
     * Spawn un único enemigo
     * @param {string} enemyType - Tipo de enemigo a crear
     * @returns {Enemy} El enemigo creado o null si falló
     */
    spawnEnemy(enemyType) {
        if (!this.enemyTypes[enemyType]) {
            console.error(`Tipo de enemigo desconocido: ${enemyType}`);
            return null;
        }

        // Encontrar posición válida para el enemigo
        const position = this.findValidPositionFarFromPlayer(this.player);

        const EnemyClass = this.enemyTypes[enemyType];
        const enemy = new EnemyClass({
            scene: this.scene,
            x: position.x,
            y: position.y,
            player: this.player,
            walls: this.walls
        });

        enemy.initialize();
        this.enemies.push(enemy);

        return enemy;
    }

    /**
     * Agrega una barra de salud para un enemigo
     * @param {Enemy} enemy - Enemigo al que agregar la barra
     * @param {HealthBar} healthBar - Barra de salud a agregar
     */
    addHealthBar(enemy, healthBar) {
        this.healthBars.set(enemy, healthBar);
    }

    /**
     * Obtiene todos los enemigos activos
     * @returns {Array} Array de enemigos activos
     */
    getActiveEnemies() {
        return this.enemies.filter(enemy => enemy.isActive());
    }

    /**
     * Obtiene todos los enemigos (activos e inactivos)
     * @returns {Array} Array de todos los enemigos
     */
    getAllEnemies() {
        return this.enemies;
    }

    /**
     * Obtiene la cantidad de enemigos activos
     * @returns {number} Cantidad de enemigos activos
     */
    getActiveEnemyCount() {
        return this.getActiveEnemies().length;
    }

    /**
     * Obtiene la cantidad total de enemigos
     * @returns {number} Cantidad total de enemigos
     */
    getTotalEnemyCount() {
        return this.enemies.length;
    }

    /**
     * Actualiza todos los enemigos cada frame
     */
    update() {
        this.enemies.forEach(enemy => {
            if (enemy.isActive()) {
                enemy.update();
            }
        });

        // Actualizar barras de salud
        this.updateHealthBars();
    }

    /**
     * Actualiza las barras de salud de los enemigos
     */
    updateHealthBars() {
        this.healthBars.forEach((healthBar, enemy) => {
            healthBar.update();
        });
    }

    /**
     * Limpia recursos del spawn manager
     */
    clear() {
        this.enemies.forEach(enemy => {
            if (enemy.sprite) {
                enemy.sprite.destroy();
            }
            if (enemy.deadSprite) {
                enemy.deadSprite.destroy();
            }
        });

        this.healthBars.forEach(healthBar => {
            if (healthBar.destroy) {
                healthBar.destroy();
            }
        });

        this.enemies = [];
        this.healthBars.clear();
    }

    /**
     * Destruye todos los enemigos y limpia recursos
     */
    destroy() {
        this.clear();
    }

    /**
     * Obtiene información de debug sobre los enemigos
     * @returns {Array} Array con información de cada enemigo
     */
    getDebugInfo() {
        return this.enemies.map((enemy, index) => ({
            index,
            type: enemy.enemyType,
            alive: enemy.isActive(),
            health: enemy.currentHealth,
            maxHealth: enemy.maxHealth,
            x: Math.floor(enemy.x),
            y: Math.floor(enemy.y),
            chasing: enemy.isChasingPlayer()
        }));
    }
}
