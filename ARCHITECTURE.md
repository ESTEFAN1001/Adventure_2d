# Guía de Arquitectura - Adventure 2D

## Descripción General

Este proyecto implementa un juego 2D de aventura en Phaser 3 usando principios **SOLID** y **Programación Orientada a Objetos (POO)**.

## Estructura del Proyecto

```
adventure_2d/
├── index.html                  # Punto de entrada, carga scripts en orden
├── css/
│   └── style.css              # Estilos globales del juego
├── assets/
│   ├── images/                # Sprites y texturas
│   ├── maps/
│   │   └── world.json         # Configuración del mapa (para futuro)
│   └── sprites/               # Spritesheets
└── src/
    ├── game.js                # Punto de entrada del juego (limpio y simple)
    ├── config/
    │   ├── game_config.js     # Configuración centralizada
    │   └── assets_config.js   # Configuración de assets
    ├── entities/
    │   ├── character.js       # Clase base para personajes
    │   ├── player.js          # Clase del jugador
    │   └── orc.js             # Clase del enemigo orco
    ├── projectiles/
    │   └── projectile.js      # Gestor de proyectiles
    ├── ui/
    │   └── health_bar.js      # Barras de vida
    ├── world/
    │   ├── map_generator.js   # Generador de mapas procedurales
    │   └── collision_manager.js # Gestor centralizado de colisiones
    └── managers/
        ├── game_manager.js    # Orquestador principal del juego
        └── combat_manager.js  # Lógica de combate
```

## Principios SOLID Implementados

### 1. **S - Single Responsibility (Responsabilidad Única)**

Cada clase tiene una única responsabilidad:
- `Character`: Base para personajes
- `Player`: Gestiona lógica específica del jugador
- `Orc`: Gestiona IA y comportamiento del enemigo
- `CombatManager`: Solo combate
- `MapGenerator`: Solo generación de mapas
- `CollisionManager`: Solo colisiones

### 2. **O - Open/Closed (Abierto/Cerrado)**

Las clases están abiertas a extensión (herencia) pero cerradas a modificación:
- `Character` es una clase base extensible
- Nuevos enemigos pueden heredar de `Character`
- Nuevos managers pueden seguir el mismo patrón

### 3. **L - Liskov Substitution (Sustitución de Liskov)**

Cualquier clase que herede de `Character` puede usarse como `Character`:
```javascript
// Ambos pueden usarse indistintamente
const entities = [player, orc];
entities.forEach(entity => entity.update());
```

### 4. **I - Interface Segregation (Segregación de Interfaz)**

Cada manager expose solo los métodos necesarios:
- `CombatManager` no expone métodos de renderizado
- `MapGenerator` no expone métodos de combate
- `CollisionManager` solo gestiona colisiones

### 5. **D - Dependency Injection (Inyección de Dependencias)**

Los managers reciben sus dependencias en el constructor:
```javascript
const combatManager = new CombatManager({ scene: this.scene });
const gameManager = new GameManager(scene);
```

## Patrones de Diseño

### 1. **Singleton (implícito)**
- `GameManager` es la única instancia que orquesta el juego
- Se accede a través de la variable global `gameManager`

### 2. **Manager/Service Pattern**
- `GameManager`: Orquestador principal
- `CombatManager`: Servicios de combate
- `CollisionManager`: Servicios de colisión
- `MapGenerator`: Servicios de generación

### 3. **Factory Pattern (MapGenerator)**
- Crea muros y elementos del mapa de forma centralizada

### 4. **Observer Pattern (Phaser events)**
- Las colisiones se manejan a través de callbacks

## Cómo Extender el Proyecto

### Agregar un Nuevo Enemigo

```javascript
// src/entities/goblin.js
class Goblin extends Character {
    constructor(config) {
        const goblinConfig = GameConfig.goblin; // Agregar a game_config.js
        super({
            scene: config.scene,
            x: config.x,
            y: config.y,
            sprite: 'goblin',
            maxHealth: goblinConfig.MAX_HEALTH,
            speed: goblinConfig.SPEED,
            spriteConfig: goblinConfig.SPRITE_CONFIG
        });
        // Lógica específica del goblin
    }
}

// En game_manager.js setupEntities():
this.goblin = new Goblin({
    scene: this.scene,
    x: goblinPos.x,
    y: goblinPos.y,
    player: this.player,
    walls: this.walls
});
```

### Agregar un Nuevo Power-Up

```javascript
// src/powerups/power_up.js
class PowerUp {
    constructor(config) {
        this.scene = config.scene;
        this.type = config.type; // 'health', 'speed', etc.
        this.sprite = null;
    }

    apply(player) {
        switch(this.type) {
            case 'health':
                player.currentHealth = Math.min(
                    player.maxHealth,
                    player.currentHealth + 50
                );
                break;
            // Más tipos...
        }
    }
}
```

### Agregar un Nuevo Manager

```javascript
// src/managers/inventory_manager.js
class InventoryManager {
    constructor(config) {
        this.scene = config.scene;
        this.items = [];
    }

    addItem(item) {
        this.items.push(item);
    }

    // Más métodos...
}

// En GameManager.setupManagers():
this.inventoryManager = new InventoryManager({
    scene: this.scene
});
```

## Flujo del Juego

1. **Inicialización** (`index.html`):
   - Carga Phaser
   - Carga todos los módulos en orden
   - Ejecuta `game.js`

2. **Preload** (`game.js` → `GameManager.initialize()`):
   - `GameManager` es creado
   - `AssetsConfig.preload()` carga todos los assets

3. **Create** (`game.js` → `GameManager.setup()`):
   - Configura el mundo
   - Crea managers
   - Instancia entidades
   - Configura colisiones
   - Configura UI
   - Configura cámara

4. **Update** (cada frame):
   - `GameManager.update()` es llamado
   - Actualiza entidades
   - Actualiza UI
   - Verifica estado del juego
   - Maneja combate

## Configuración

Todos los valores configurables están centralizados en `config/game_config.js`:

```javascript
const GameConfig = {
    player: {
        MAX_HEALTH: 100,
        SPEED: 160,
        // ...
    },
    orc: {
        MAX_HEALTH: 200,
        SPEED: 80,
        // ...
    },
    // Más configuraciones...
};
```

## Debugging

El `GameManager` proporciona información de debug cada 60 frames:
- Posición del jugador
- Salud del jugador y orco
- Proyectiles activos
- Estado del orco

Configurable en `GameConfig.debug`:
```javascript
debug: {
    LOG_INTERVAL: 60, // frames
    ENABLED: true
}
```

### Cómo hacer cambios:

1. **Cambiar configuración**: Modifica `config/game_config.js`
2. **Cambiar lógica de entidad**: Modifica la clase específica
3. **Cambiar lógica de combate**: Modifica `CombatManager`
4. **Cambiar lógica del mapa**: Modifica `MapGenerator`
5. **Agregar features**: Crea nuevos managers/clases

## Recursos

- [Documentación de Phaser 3](https://phaser.io/docs/2.6.2/)
- [Principios SOLID](https://www.freecodecamp.org/news/solid-principles-explained-in-plain-english/)
- [Patrones de Diseño en JavaScript](https://www.patterns.dev/)
