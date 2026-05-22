# Adventure 2D - Phaser.js RPG Game

Un juego RPG 2D desarrollado con Phaser 3.55.2, presentando un personaje jugable que combate contra enemigos en un mundo procedural con obstáculos, colisiones físicas y un sistema de combate basado en proyectiles.

## Características Principales

- Personaje jugable animado con movimiento en 4 direcciones
- Sistema de combate con proyectiles (disparados con SPACE)
- Enemigo (Orc) con comportamiento de patrulla y persecución
- Sistema de salud y daño con barras visuales
- Generación procedural del mundo con obstáculos
- Sistema de colisiones completo
- Cámara que sigue al jugador
- Arquitectura modular SOLID/POO

## Estructura del Proyecto

```
adventure_2d/
├── index.html                  # Punto de entrada
├── css/
│   └── style.css
├── assets/
│   ├── images/
│   ├── maps/
│   │   └── world.json
│   └── sprites/
└── src/
    ├── game.js                 # Punto de entrada (refactorizado)
    ├── config/
    │   ├── game_config.js      # Configuración centralizada
    │   └── assets_config.js    # Configuración de assets
    ├── entities/
    │   ├── character.js        # Clase base para personajes
    │   ├── player.js           # Clase del jugador
    │   └── orc.js              # Enemigo IA
    ├── projectiles/
    │   └── projectile.js       # Sistema de proyectiles
    ├── ui/
    │   └── health_bar.js       # Barras de vida
    ├── world/
    │   ├── map_generator.js    # Generador de mapas
    │   └── collision_manager.js # Gestor de colisiones
    └── managers/
        ├── game_manager.js     # Orquestador principal
        └── combat_manager.js   # Lógica de combate
```

## Arquitectura

El proyecto está refactorizado siguiendo principios SOLID y orientación a objetos:

- **Configuración**: `game_config.js` centraliza todos los valores (salud, velocidad, daño)
- **Entidades**: Jerarquía con clase base `Character` y subclases `Player` y `Orc`
- **Managers**: `GameManager` orquesta el juego completo, `CombatManager` gestiona el combate
- **Sistemas**: Generación de mapas, colisiones, proyectiles y UI separados en módulos
- **Punto de entrada**: `game.js` simplificado a solo 50 líneas

## Jerarquía de Clases

```
Character (clase base)
├── Player (jugador controlable)
└── Orc (enemigo IA)
```

Todas las entidades heredan de `Character`, que proporciona métodos base como `takeDamage()`, `getDistanceTo()` e `isActive()`.

## Cómo Ejecutar

1. Abre `index.html` en un navegador web
2. El juego cargará automáticamente todos los módulos en orden
3. Comienza a jugar inmediatamente

## Controles

- **WASD o Flechas**: Mover al personaje en 4 direcciones
- **SPACE**: Disparar proyectiles en la dirección que miras
- **C**: Alternar ropa del personaje

## Mecánicas de Juego

**Jugador**:
- Vida: 100 HP
- Velocidad: 160 px/s
- Ataque: Proyectiles con 200 px/s

**Orco (Enemigo)**:
- Vida: 200 HP
- Velocidad: 80 px/s
- Comportamiento: Patrulla y persigue si está a 150 px de distancia
- Ataque: Contacto directo causa daño

**Mapas**:
- Tamaño: 50x50 tiles (32px cada uno)
- 8 clusters de obstáculos generados proceduralmente
- Bordes con paredes de colisión

## Configuración

Todos los valores del juego se centralizan en `src/config/game_config.js`:

- Salud máxima de personajes
- Velocidades de movimiento
- Velocidades de proyectiles
- Valores de daño
- Radios de detección IA

Cambiar valores aquí afecta inmediatamente al juego sin reescribir ningún código de lógica.

## Características Técnicas

- **Motor**: Phaser 3.55.2
- **Física**: Arcade (sin gravedad)
- **Resolución**: 800x600 píxeles
- **Colisiones**: Hitbox dinámicas y callbacks personalizados
- **Animaciones**: 4 direcciones de movimiento para jugador y orco 