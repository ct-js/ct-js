# Pathfinder

Pathfinder allows you to create a grid-based map from a predesigned room or a custom grid, and find the shortest path between two points in your game world while avoiding obstacles. This is useful for AI navigation, player movement, or any scenario where you need to find the most efficient route, even in games not built on a grid.

Pathfinder is a module for ct.js that provides A* (A-Star) pathfinding functionality using the [EasyStar.js](https://easystarjs.com/) library. The catmod provides helper methods relevant to game making in ct.js and adds lots of blocks for the Catnip language to work with EasyStar instances.

## Optional `place` dependency

To use Pathfinder's methods that generate a grid based on an existing room, you will need to have the **place** module enabled in your project, as Pathfinder relies on its collision detection system to determine walkable areas.

## Quick Start

Here's a basic example of how to set up pathfinding in your game:

```js
// 1. Create a pathfinding map (usually in a room's script)
this.map = pathfinder.create(true, false);

// 2. Generate a grid from the current room
// Uses 'Solid' collision group as obstacles, 32x32 pixel cells
pathfinder.generateBasic(this.map, 'Solid', {
    cellWidth: 32,
    cellHeight: 32,
    mapWidth: rooms.current.width, 
    mapHeight: rooms.current.height
});
// Alternatively — Generate a custom grid as a 2D number array and use map.setGrid(grid);
// Note that some methods require cellWidth, cellHeight and other properties of the map
// to properly convert grid cells to map coordinates, see the pathfinder.setProps method.

// 3. Find a path from current position to target
// The path won't be found right away, it will be queued and calculated asynchronously
pathfinder.findPathToCoord(rooms.current.map, this.x, this.y, target.x, target.y, (path) => {
    if (path) {
        // Path found! path is an array of {x, y} cells
        console.log('Path length:', path.length);
    }
});

// 4. Calculate queued paths (run in main room's Frame Start event.)
this.map.calculate();
```

## Core Concepts

### Maps

A map (`EasyStar` instance) represents a pathfinding grid. You can have multiple maps for different purposes: for example, for flying and walking enemies or a crude grid for long-distance movement and a finer grid for avoiding smaller obstacles.

A new map instance is created with `pathfinder.create` method:

```js
this.map = pathfinder.create(diagonals, cornerCutting);
```

- **diagonals** (boolean): Enable 8-directional movement
- **cornerCutting** (boolean): Allow cutting corners when moving diagonally

Most of the time, you will store this map instance in a room or a global variable.

### Tiles and Cost Values

Tiles in a map are represented as numbers, and each this number can be either a walkable tile or an impassable tile. Additionally, walkable tiles can have different movement costs. Higher cost values make cells more expensive to traverse, useful for creating preferred paths. We can think of these costs as of time needed to traverse a cell: when finding a path, the algorithm will try to minimize the total cost — time — of the path.

To define these, you must firstly execute `mapInstance.setAcceptableTiles(tiles)` to specify which tiles are walkable:

```js
// Tiles 1, 2, 3 will be walkable; 0, 4 and others will be considered impassable
this.map.setAcceptableTiles([1, 2, 3]);
```

Then you can set the cost values for each walkable tile:

```js
this.map.setTileCost(1, 1); // Cost for tile 1 is 1 (regular tile)
this.map.setTileCost(2, 1.5); // Cost for tile 2 is 1.5 (slightly harder to traverse than tile 1)
this.map.setTileCost(3, 2); // Cost for tile 3 is 2 (twice as hard to traverse as tile 1)
```

> Note: In Catnip, both these methods are combined into a single block "Set walkable cells and their costs".

### Grid Generation

This catmod allows you to create a pathfinding grid from a predesigned ct.js room. Note that this is not the fastest option and if you are creating a room procedurally, you should provide a grid as a 2D array instead. (See the next section.)

You can generate a pathfinding grid in two ways:

**Basic mode** - Uses a single collision group to mark obstacles:

```js
pathfinder.generateBasic(this.map, 'Solid', {
    cellWidth: 32,
    cellHeight: 32,
    mapWidth: 800,
    mapHeight: 600,
    walkable: 1,    // Value for walkable cells (default: 1)
    occupied: 0,    // Value for blocked cells (default: 0)
    fast: true      // Use fast collision checks (default: true, checks by tracing points instead of rectangles)
});
```

**Advanced mode** - Uses multiple collision groups with different costs:

```js
pathfinder.generateAdvanced(this.map, {
    cellWidth: 32,
    cellHeight: 32,
    mapWidth: 800,
    mapHeight: 600,
    freeCells: 1,
    queries: {
        'Solid': 0,      // Impassable
        'Slow': 2,       // Slow terrain (cost = 1.5 with the previous settings)
        'Water': 3       // Water (cost = 2)
    },
    fast: true
});
```


### Custom Grids

In cases where you're generating rooms procedurally, or loading them from a 3rd-party source, you can provide a custom grid as a 2D array:

```js
var customGrid = [
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1]
];

this.map.setGrid(map, customGrid);
```

Note that methods that work with game coordinates require additional properties to be set onto the map instance:

- `width` - The amount of columns in the grid.
- `height` - The amount of rows in the grid.
- `startingX` - The starting x-coordinate of the map in the game world.
- `startingY` - The starting y-coordinate of the map in the game world.
- `cellWidth` - The width of each cell in the map.
- `cellHeight` - The height of each cell in the map.
- `grid` - The custom grid array. (Allows viewing the map with `pathfinder.drawDebugMap(mapInstance))`

You can write them with `map.width = ...` or use the `pathfinder.setProps` method to set them in one go. But, you can also use methods that don't work with game coordinates and convert them yourself.

### Finding Paths

Pathfinding is asynchronous. You provide a callback that receives the path:

```js
// In game coordinates
pathfinder.findPathToCoord(map, fromX, fromY, toX, toY, (path) => {
    if (path) {
        // path is an array of {x, y} objects (cell coordinates)
    }
});
// In grid coordinates
pathfinder.findPathToCell(map, fromCol, fromRow, toCol, toRow, (path) => {
    // Same callback structure
});
```

After calling `findPathToCoord` or `findPathToCell`, you must call `map.calculate()` to actually compute the path.

### Working with Paths

Paths are arrays of `{x, y}` objects, where `x` and `y` are grid cell indices. You will either use the last point, or iterate over the path to create an animation. The built-in Pathfinding project template in ct.js shows a good implementation of smooth movement along a path using the `tween` catmod, but it's definitely not the only way to handle pathfinding animations.

The `pathfinder` module provides utility functions to convert cell coordinates to game coordinates and vice versa:

**Convert a cell to coordinates:**

```js
var coords = pathfinder.toCoordinates(map, cellX, cellY);
// coords.x and coords.y are pixel coordinates
```

**Convert coordinates to a cell:**

```js
var cell = pathfinder.toCoordinates(map, pixelX, pixelY);
// cell.x and cell.y are grid cell indices
```

## Dynamic Cell Modification

You can dynamically modify the grid during gameplay without regenerating the map:

```js
// Make a cell temporarily impassable
this.map.avoidAdditionalPoint(column, row);
// Stop avoiding a cell
this.map.stopAvoidingAdditionalPoint(column, row);
// Stop avoiding all additional cells
this.map.stopAvoidingAllAdditionalPoints();

// Override cell cost (for advanced grids)
this.map.setAdditionalPointCost(column, row, 10);
// Remove cost override
this.map.removeAdditionalPointCost(column, row);
// Reset all overrides
this.map.removeAllAdditionalPointCosts();

// Set directional condition for a cell to restrict in which directions it can be traversed.
// `allowedDirections` is an array of strings, valid values are 'TOP', 'TOP_RIGHT', 'RIGHT',
// 'BOTTOM_RIGHT', 'BOTTOM', 'BOTTOM_LEFT', 'LEFT', and 'TOP_LEFT'.
// You can also use EasyStar.TOP and so on instead of strings.
this.map.setDirectionalCondition(x, y, allowedDirections);
// * Remove all directional conditions
this.map.removeAllDirectionalConditions();
```


## Debug Visualization

Pathfinder includes built-in debug tools:

```js
// Draw the grid as colored tiles.
// `debugMap` will be a PIXI.Sprite attached to your main room and is similar to ct.js copies.
// You can remove it with `debugMap.destroy()`
var debugMap = pathfinder.drawDebugMap(map);

// Draw a specific path. Color is optional.
// `debugPath` will be a PIXI.Graphics object attached to your main room.
// You can remove it with `debugPath.destroy()`
var debugPath = pathfinder.drawDebugPath(path, map, color);

// Remove all debug graphics
pathfinder.removeAllDebugGraphics();
```

## Performance Tips

- Use **fast: true** (default) for maps that were designed on-grid.
- Set **iterationsPerCalculation** for large maps to prevent frame drops — long paths will be calculated in multiple frames to keep FPS stable.
- Avoid regenerating the grid often; use `avoidAdditionalPoint` for temporary obstacles.
