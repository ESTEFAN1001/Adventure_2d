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

        // Entidades
        this.player = null;
        this.orc = null;

        // Elementos de interfaz
        this.playerHealthBar = null;
        this.orcHealthBar = null;
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
        this.collisionManager = new CollisionManager({
            scene: this.scene
        });

        this.combatManager = new CombatManager({
            scene: this.scene
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
    }

    /**
     * Configura las entidades (jugador y orco)
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

        // Encontrar posición válida para el orco (lejos del jugador)
        let orcPos = this.findValidPositionFarFromPlayer(this.player);

        this.orc = new Orc({
            scene: this.scene,
            x: orcPos.x,
            y: orcPos.y,
            player: this.player,
            walls: this.walls
        });
        this.orc.initialize();

        console.log(`Jugador creado en (${playerPos.x}, ${playerPos.y})`);
        console.log(`Orco creado en (${orcPos.x}, ${orcPos.y})`);
    }

    /**
     * Configura las colisiones entre entidades
     */
    setupCollisions() {
        // Colisión: Jugador y Orco
        this.collisionManager.setupPlayerOrcCollision(
            this.player,
            this.orc,
            () => this.onPlayerOrcCollision()
        );

        // Colisión: Proyectiles y Orco
        this.collisionManager.setupProjectileOrcCollision(
            this.projectiles,
            this.orc,
            (projectile, orc) => this.onProjectileOrcCollision(projectile, orc)
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

        // Barra de vida del orco
        this.orcHealthBar = new HealthBar({
            scene: this.scene,
            character: this.orc
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

        if (this.orc.isActive()) {
            this.orc.update();
        }

        // Actualizar UI
        this.playerHealthBar.update();
        if (this.orc.isActive()) {
            this.orcHealthBar.update();
        } else if (this.orc.getDeadSprite()) {
            // Actualizar posición del texto si el orco está muerto
            this.orcHealthBar.update();
        }

        // Actualizar debug
        if (this.debugCounter % GameConfig.debug.LOG_INTERVAL === 0) {
            this.updateDebugInfo();
        }

        // Verificar estado del juego
        const status = this.combatManager.checkCombatStatus(this.player, this.orc);
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
            `Last Direction: ${this.player.getDirection()}`
        ];

        if (this.orc.isActive()) {
            debugInfo.push(
                `Orc Health: ${this.orc.currentHealth}/${this.orc.maxHealth}`,
                `Orc State: ${this.orc.isChasing ? 'Chasing' : 'Patrolling'}`
            );
        } else {
            debugInfo.push('Orc: DEAD');
        }

        this.debugText.setText(debugInfo);
    }

    /**
     * Maneja las colisiones entre jugador y orco
     */
    onPlayerOrcCollision() {
        this.combatManager.orcAttackPlayer(this.player, this.orc);
    }

    /**
     * Maneja las colisiones entre proyectiles y orco
     * Valida correctamente cuál es el proyectil (Phaser puede pasar parámetros en diferente orden)
     */
    onProjectileOrcCollision(body1, body2) {
        // Identificar cuál es el proyectil basado en la textura
        let projectile = null;
        if (body1.texture && body1.texture.key === 'projectile') {
            projectile = body1;
        } else if (body2.texture && body2.texture.key === 'projectile') {
            projectile = body2;
        }

        // Verificar que el orco está vivo antes de aplicar daño
        if (this.orc && this.orc.isActive() && projectile) {
            this.combatManager.projectileHitOrc(projectile, this.orc);
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
            orcHealth: this.orc.currentHealth,
            playerAlive: this.player.isActive(),
            orcAlive: this.orc.isActive()
        };
    }

    /**
     * Limpia recursos del game manager
     */
    destroy() {
        if (this.player) this.player.destroy();
        if (this.orc) this.orc.destroy();
        if (this.playerHealthBar) this.playerHealthBar.destroy();
        if (this.orcHealthBar) this.orcHealthBar.destroy();
        if (this.projectileManager) this.projectileManager.clear();
    }
}
