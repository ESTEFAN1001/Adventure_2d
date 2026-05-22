/**
 * map_generator.js
 * Generador de mapas procedurales
 */

class MapGenerator {
    /**
     * @param {Object} config - Configuración del generador
     * @param {Phaser.Scene} config.scene - Escena de Phaser
     * @param {Phaser.Physics.StaticGroup} config.wallsGroup - Grupo de paredes
     */
    constructor(config) {
        this.scene = config.scene;
        this.wallsGroup = config.wallsGroup;
        this.tileSize = GameConfig.map.TILE_SIZE;
        this.mapWidth = GameConfig.map.MAP_WIDTH;
        this.mapHeight = GameConfig.map.MAP_HEIGHT;
    }

    /**
     * Genera el mapa completo
     */
    generate() {
        this.createFloor();
        this.createBorderWalls();
        this.createRandomWallClusters();
    }

    /**
     * Crea el piso del mapa
     */
    createFloor() {
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                this.scene.add.image(
                    x * this.tileSize,
                    y * this.tileSize,
                    'floor'
                );
            }
        }
    }

    /**
     * Crea las paredes del borde del mapa
     */
    createBorderWalls() {
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                if (x === 0 || x === this.mapWidth - 1 || y === 0 || y === this.mapHeight - 1) {
                    this.wallsGroup.create(x * this.tileSize, y * this.tileSize, 'wall');
                }
            }
        }
    }

    /**
     * Crea clusters aleatorios de paredes
     */
    createRandomWallClusters() {
        const clusterCount = 8;

        for (let i = 0; i < clusterCount; i++) {
            const centerX = Phaser.Math.Between(5, this.mapWidth - 6);
            const centerY = Phaser.Math.Between(5, this.mapHeight - 6);

            // Crear pequeños clusters alrededor del centro
            for (let j = 0; j < 4; j++) {
                const offsetX = Phaser.Math.Between(-2, 2);
                const offsetY = Phaser.Math.Between(-2, 2);
                const wallX = centerX + offsetX;
                const wallY = centerY + offsetY;

                if (this.canPlaceWall(wallX, wallY)) {
                    this.wallsGroup.create(wallX * this.tileSize, wallY * this.tileSize, 'wall');
                }
            }
        }
    }

    /**
     * Verifica si se puede colocar una pared en una posición
     * @param {number} x - Coordenada X del tile
     * @param {number} y - Coordenada Y del tile
     * @returns {boolean} True si se puede colocar
     */
    canPlaceWall(x, y) {
        const minDistance = 4;

        for (let wall of this.wallsGroup.getChildren()) {
            const wallX = Math.floor(wall.x / this.tileSize);
            const wallY = Math.floor(wall.y / this.tileSize);

            const dx = Math.abs(wallX - x);
            const dy = Math.abs(wallY - y);

            if (dx < minDistance && dy < minDistance) {
                return false;
            }
        }

        return true;
    }

    /**
     * Obtiene el grupo de paredes
     * @returns {Phaser.Physics.StaticGroup} Grupo de paredes
     */
    getWalls() {
        return this.wallsGroup;
    }
}
