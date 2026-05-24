/**
 * game_manager.js
 * Gestor principal del juego
 * Orquesta todos los componentes del juego
 * Principio SOLID: Dependency Injection y Single Responsibility
 */

class GameManager {
    /**
     * @param {Phaser.Scene} scene - Escena de Phaser
     */
    constructor(scene) {
        this.scene = scene;

        // Gestores de subsistemas
        this.mapGenerator = null;
        this.collisionManager = null;
        this.combatManager = null;
        this.projectileManager = null;
        this.spawnManager = null;
        this.effectManager = null;
        this.powerUpManager = null;

        // Entidades
        this.player = null;
        this.enemies = [];

        // Elementos de interfaz
        this.playerHealthBar = null;
        this.enemyHealthBars = [];
        this.debugText = null;

        // Grupos de física
        this.walls = null;
        this.projectiles = null;

        // Cámara
        this.camera = null;

        // Estados
        this.debugCounter = 0;
        this.gameOver = false;
        this.winner = null;
        
        // Configuración de spawn
        this.enemySpawnConfig = {
            'orc': 1 // Cantidad de orcos a generar (personalizable)
        };
    }

    /**
     * Configura la cantidad de enemigos a generar
     * @param {Object} spawnConfig - Configuración de spawn {enemyType: count}
     * @example
     * setEnemySpawnConfig({ 'orc': 3 }); // Generar 3 orcos
     * setEnemySpawnConfig({ 'orc': 2, 'goblin': 3 }); // Generar 2 orcos y 3 goblins
     */
    setEnemySpawnConfig(spawnConfig) {
        this.enemySpawnConfig = spawnConfig;
        console.log('Configuración de spawn actualizada:', this.enemySpawnConfig);
    }

    /**
     * Obtiene la configuración actual de spawn de enemigos
     * @returns {Object} Configuración de spawn
     */
    getEnemySpawnConfig() {
        return this.enemySpawnConfig;
    }

    /**
     * Inicializa el juego completo
     */
    initialize() {
        // Cargar assets
        AssetsConfig.preload(this.scene);
    }

    /**
     * Configura el juego después de que se cargaron los assets
     */
    setup() {
        console.log('Configurando el juego...');

        // Configurar mundo
        this.setupWorld();

        // Crear managers
        this.setupManagers();

        // Crear entidades
        this.setupEntities();

        //Crear powerups
        this.setupPowerUps();

        // Configurar colisiones
        this.setupCollisions();

        // Crear UI
        this.setupUI();

        // Configurar cámara
        this.setupCamera();

        console.log('Juego configurado correctamente');
    }

    /**
     * Configura el mundo físico
     */
    setupWorld() {
        const mapConfig = GameConfig.map;
        this.scene.physics.world.setBounds(
            0, 0,
            mapConfig.MAP_WIDTH * mapConfig.TILE_SIZE,
            mapConfig.MAP_HEIGHT * mapConfig.TILE_SIZE
        );

        // Crear grupo de paredes
        this.walls = this.scene.physics.add.staticGroup();

        // Generar mapa
        this.mapGenerator = new MapGenerator({
            scene: this.scene,
            wallsGroup: this.walls
        });
        this.mapGenerator.generate();
    }

    /**
     * Configura los managers de subsistemas
     */
    setupManagers() {
        this.effectManager = new EffectManager({
            scene: this.scene
        });

        this.collisionManager = new CollisionManager({
            scene: this.scene
        });

        this.combatManager = new CombatManager({
            scene: this.scene,
            effectManager: this.effectManager
        });

        // Crear grupo de proyectiles
        this.projectiles = this.scene.physics.add.group({
            defaultKey: 'projectile',
            maxSize: GameConfig.projectiles.MAX_SIZE
        });

        this.projectileManager = new Projectile({
            scene: this.scene,
            group: this.projectiles
        });

        // Crear SpawnManager
        this.spawnManager = new SpawnManager({
            scene: this.scene,
            player: null, // Se inicializará después de crear el jugador
            walls: this.walls,
            findValidPositionFarFromPlayer: this.findValidPositionFarFromPlayer.bind(this)
        });

        this.scene.gameManager = this;
    }

    /**
     * Configura las entidades (jugador y enemigos)
     */
    setupEntities() {
        // Encontrar posición válida para el jugador
        const playerPos = this.findValidPosition();
        
        this.player = new Player({
            scene: this.scene,
            x: playerPos.x,
            y: playerPos.y,
            walls: this.walls
        });
        this.player.initialize();

        // Actualizar SpawnManager con referencia al jugador
        this.spawnManager.player = this.player;

        // Generar enemigos según la configuración
        for (const [enemyType, count] of Object.entries(this.enemySpawnConfig)) {
            const spawnedEnemies = this.spawnManager.spawnEnemies(enemyType, count);
            this.enemies = this.enemies.concat(spawnedEnemies);
        }

        console.log(`Jugador creado en (${playerPos.x}, ${playerPos.y})`);
        console.log(`${this.enemies.length} enemigo(s) generado(s)`);
    }

    /**
    * Configura el sistema de powerups
    */
    setupPowerUps() {
        this.powerUpManager = new PowerUpManager({
            scene: this.scene,
            player: this.player,
            walls: this.walls,
            findValidPosition: this.findValidPositionForPowerUp.bind(this)
        });
        console.log('PowerUpManager inicializado');
    }

    /**
 * Encuentra posición válida para powerup (evita paredes y jugador)
 * @returns {Object|null} Posición {x, y} o null
 */
findValidPositionForPowerUp() {
    const mapConfig = GameConfig.map;
    const tileSize = mapConfig.TILE_SIZE;
    let attempts = 0;
    const maxAttempts = 50; // Aumentado de 30 a 50
    
    console.log('[GameManager] Buscando posición para powerup...');
    
    while (attempts < maxAttempts) {
        // Área más amplia
        const x = Phaser.Math.Between(5, mapConfig.MAP_WIDTH - 6) * tileSize;
        const y = Phaser.Math.Between(5, mapConfig.MAP_HEIGHT - 6) * tileSize;
        
        // Verificar que no colisione con paredes
        let collidesWithWall = false;
        for (let wall of this.walls.getChildren()) {
            const distance = Phaser.Math.Distance.Between(x, y, wall.x, wall.y);
            if (distance < 35) { // Reducido de 40 a 35
                collidesWithWall = true;
                break;
            }
        }
        
        if (collidesWithWall) {
            attempts++;
            continue;
        }
        
        // Verificar distancia al jugador (mínimo 150px - reducido)
        const distanceToPlayer = Phaser.Math.Distance.Between(x, y, this.player.sprite.x, this.player.sprite.y);
        
        // Condición más flexible
        if (distanceToPlayer > 150 && distanceToPlayer < 600) {
            console.log(`[GameManager] Posición encontrada: (${x}, ${y}) distancia: ${Math.floor(distanceToPlayer)}px`);
            return { x, y };
        }
        
        attempts++;
    }
    
    // FALLBACK: Si no encuentra, devuelve una posición aleatoria sin tantas restricciones
    console.log('[GameManager] Usando posición fallback');
    return {
        x: Phaser.Math.Between(10, (mapConfig.MAP_WIDTH - 10)) * tileSize,
        y: Phaser.Math.Between(10, (mapConfig.MAP_HEIGHT - 10)) * tileSize
    };
}

    /**
     * Configura las colisiones entre entidades
     */
    setupCollisions() {
        // Colisión: Jugador y Enemigos
        this.collisionManager.setupPlayerMultipleEnemiesCollision(
            this.player,
            this.enemies,
            (player, enemy) => this.onPlayerEnemyCollision(player, enemy)
        );

        // Colisión: Proyectiles y Enemigos
        this.collisionManager.setupProjectileMultipleEnemiesCollision(
            this.projectiles,
            this.enemies,
            (projectileSprite, enemySprite) => this.onProjectileEnemyCollision(projectileSprite, enemySprite)
        );

        // Colisión: Proyectiles y Paredes
        this.collisionManager.setupProjectileWallCollision(
            this.projectiles,
            this.walls,
            (projectile, wall) => projectile.destroy()
        );
    }

    /**
     * Configura la interfaz de usuario
     */
    setupUI() {
        // Barra de vida del jugador
        this.playerHealthBar = new HealthBar({
            scene: this.scene,
            character: this.player
        });
        this.player.setHealthBar(this.playerHealthBar);

        // Barras de vida de los enemigos
        this.enemies.forEach((enemy, index) => {
            const enemyHealthBar = new HealthBar({
                scene: this.scene,
                character: enemy
            });
            this.spawnManager.addHealthBar(enemy, enemyHealthBar);
            this.enemyHealthBars.push(enemyHealthBar);
        });

        // Texto de debug
        this.debugText = this.scene.add.text(16, 16, '', {
            font: '16px Arial',
            fill: '#ffffff',
            backgroundColor: '#000000'
        });
        this.debugText.setScrollFactor(0);
    }

    /**
     * Configura la cámara
     */
    setupCamera() {
        this.camera = this.scene.cameras.main;
        this.camera.startFollow(this.player.sprite);
        
        const mapConfig = GameConfig.map;
        this.camera.setBounds(
            0, 0,
            mapConfig.MAP_WIDTH * mapConfig.TILE_SIZE,
            mapConfig.MAP_HEIGHT * mapConfig.TILE_SIZE
        );
        this.camera.setZoom(1.0);
    }

    /**
     * Actualiza el estado del juego cada frame
     */
    update() {
        this.debugCounter++;

        // Actualizar entidades
        if (this.player.isActive()) {
            this.player.update();
        }

        // Actualizar todos los enemigos a través del SpawnManager
        this.spawnManager.update();

        // Actualizar UI
        this.playerHealthBar.update();

        // Actualizar debug
        if (this.debugCounter % GameConfig.debug.LOG_INTERVAL === 0) {
            this.updateDebugInfo();
        }

        // Verificar estado del juego
        const status = this.combatManager.checkCombatStatus(this.player, this.enemies);
        if (status.gameOver && !this.gameOver) {
            this.handleGameOver(status);
        }
    }

    /**
     * Actualiza la información de debug
     */
    updateDebugInfo() {
        const playerPos = this.player.getPosition();
        const debugInfo = [
            `Player X: ${Math.floor(playerPos.x)}`,
            `Player Y: ${Math.floor(playerPos.y)}`,
            `Player Health: ${this.player.currentHealth}/${this.player.maxHealth}`,
            `Camera X: ${Math.floor(this.camera.scrollX)}`,
            `Camera Y: ${Math.floor(this.camera.scrollY)}`,
            `Active Projectiles: ${this.projectileManager.getActiveCount()}`,
            `Last Direction: ${this.player.getDirection()}`,
            `Enemies: ${this.spawnManager.getActiveEnemyCount()}/${this.spawnManager.getTotalEnemyCount()}`
        ];

        // Agregar información de cada enemigo
        this.enemies.forEach((enemy, index) => {
            if (enemy.isActive()) {
                debugInfo.push(
                    `${enemy.enemyType} ${index}: HP=${enemy.currentHealth}/${enemy.maxHealth}, State=${enemy.isChasingPlayer() ? 'Chasing' : 'Patrolling'}`
                );
            } else {
                debugInfo.push(`${enemy.enemyType} ${index}: DEAD`);
            }
        });

        this.debugText.setText(debugInfo);
    }

    /**
     * Maneja las colisiones entre jugador y enemigos
     */
    onPlayerEnemyCollision(player, enemy) {
        this.combatManager.enemyAttackPlayer(player, enemy);
    }

    /**
     * Maneja las colisiones entre proyectiles y enemigos
     * Valida correctamente cuál es el proyectil (Phaser puede pasar parámetros en diferente orden)
     */
    onProjectileEnemyCollision(body1, body2) {        
        // Identificar cuál es el proyectil basado en la textura
        let projectile = null;
        if (body1.texture && body1.texture.key === 'projectile') {
            projectile = body1;
        } else if (body2.texture && body2.texture.key === 'projectile') {
            projectile = body2;
        }

        // Encontrar cuál es el enemigo
        let enemy = null;
        for (let e of this.enemies) {
            if (body1 === e.sprite || body2 === e.sprite) {
                enemy = e;
                break;
            }
        }

        // Verificar que el enemigo está vivo antes de aplicar daño
        if (enemy && enemy.isActive() && projectile) {
            this.combatManager.projectileHitEnemy(projectile, enemy);
        } else if (projectile) {
            projectile.destroy();
        }
    }

    /**
     * Dispara un proyectil desde el jugador
     */
    fireProjectile() {
        const direction = this.player.getDirection();
        return this.projectileManager.fire(this.player, direction);
    }

    /**
     * Maneja el fin del juego
     * @param {Object} status - Estado final del juego
     */
    handleGameOver(status) {
        this.gameOver = true;
        this.winner = status.winner;

        console.log(`GAME OVER - Ganador: ${status.winner}`);
        this.scene.physics.pause();
    }

    /**
     * Encuentra una posición válida en el mapa
     * @returns {Object} Posición {x, y}
     */
    findValidPosition() {
        const mapConfig = GameConfig.map;
        const tileSize = mapConfig.TILE_SIZE;
        let x, y, attempts = 0;

        do {
            x = Phaser.Math.Between(3, mapConfig.MAP_WIDTH - 4) * tileSize;
            y = Phaser.Math.Between(3, mapConfig.MAP_HEIGHT - 4) * tileSize;
            attempts++;
        } while (!this.isValidSpawnPosition(x, y) && attempts < 200);

        if (attempts >= 200) {
            console.warn('No se pudo encontrar posición válida');
            return {
                x: (mapConfig.MAP_WIDTH / 2) * tileSize,
                y: (mapConfig.MAP_HEIGHT / 2) * tileSize
            };
        }

        return { x, y };
    }

    /**
     * Encuentra una posición válida lejos del jugador
     * @param {Character} player - Referencia al jugador
     * @returns {Object} Posición {x, y}
     */
    findValidPositionFarFromPlayer(player) {
        const mapConfig = GameConfig.map;
        const minDistance = 10 * mapConfig.TILE_SIZE;
        let position;
        let attempts = 0;

        do {
            position = this.findValidPosition();
            const distance = Phaser.Math.Distance.Between(
                player.x, player.y,
                position.x, position.y
            );

            if (distance >= minDistance) {
                return position;
            }
            attempts++;
        } while (attempts < 200);

        return position;
    }

    /**
     * Verifica si una posición es válida para spawn
     * @param {number} x - Coordenada X
     * @param {number} y - Coordenada Y
     * @returns {boolean} True si es válida
     */
    isValidSpawnPosition(x, y) {
        const mapConfig = GameConfig.map;
        const tileSize = mapConfig.TILE_SIZE;
        const tileX = Math.floor(x / tileSize);
        const tileY = Math.floor(y / tileSize);

        if (tileX <= 1 || tileX >= mapConfig.MAP_WIDTH - 2 ||
            tileY <= 1 || tileY >= mapConfig.MAP_HEIGHT - 2) {
            return false;
        }

        for (let wall of this.walls.getChildren()) {
            const wallX = Math.floor(wall.x / tileSize);
            const wallY = Math.floor(wall.y / tileSize);

            if (Math.abs(wallX - tileX) <= 2 && Math.abs(wallY - tileY) <= 2) {
                return false;
            }
        }

        return true;
    }

    /**
     * Obtiene el estado actual del juego
     * @returns {Object} Estado del juego
     */
    getGameState() {
        return {
            gameOver: this.gameOver,
            winner: this.winner,
            playerHealth: this.player.currentHealth,
            playerAlive: this.player.isActive(),
            enemyCount: this.enemies.length,
            activeEnemyCount: this.spawnManager.getActiveEnemyCount(),
            enemies: this.enemies.map(e => ({
                type: e.enemyType,
                alive: e.isActive(),
                health: e.currentHealth,
                maxHealth: e.maxHealth
            }))
        };
    }

    /**
     * Limpia recursos del game manager
     */
    destroy() {
        if (this.player) this.player.destroy();
        if (this.spawnManager) this.spawnManager.destroy();
        if (this.playerHealthBar) this.playerHealthBar.destroy();
        this.enemyHealthBars.forEach(hb => {
            if (hb) hb.destroy();
        });
        if (this.projectileManager) this.projectileManager.clear();
        if (this.powerUpManager) this.powerUpManager.destroy();
        if (this.effectManager) this.effectManager.destroy();
    }
}
