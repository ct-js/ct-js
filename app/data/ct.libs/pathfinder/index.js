/* global place EasyStar */

const pathfinderValidate = (o) => {
    if (!place) {
        throw new Error('[pathfinder] Generating a grid from a room requires `place` catmod to be enabled.');
    }
    if (!o.queries || !Object.keys(o.queries).length) {
        throw new Error('[pathfinder] You must provide cost values for collision groups. (queries option for generateAdvanced, walkable and occupied for generateBasic)');
    }
    if (!o.cellWidth) {
        throw new Error('[pathfinder] cellWidth was not passed to setGridFromRoom');
    }
    if (!o.cellHeight) {
        throw new Error('[pathfinder] cellHeight was not passed to setGridFromRoom');
    }
    if (!o.mapCols && !o.mapWidth) {
        throw new Error('[pathfinder] Map width was not specified for setGridFromRoom');
    }
    if (!o.mapRows && !o.mapHeight) {
        throw new Error('[pathfinder] Map width was not specified for setGridFromRoom');
    }
};
/* eslint-disable max-depth */
const pathfinder = {
    /**
     * Creates a new EasyStar instance (a map) with the specified options.
     * @param {boolean} diagonals - Whether to enable diagonal movement.
     * @param {boolean} cornerCutting - Whether to enable corner cutting.
     * This has no effect if diagonals are disabled.
     * @returns {EasyStar} A new EasyStar instance.
     */
    create(diagonals, cornerCutting) {
        const star = new EasyStar.js();
        if (diagonals) {
            star.enableDiagonals();
            if (!cornerCutting) {
                star.disableCornerCutting();
            }
        }
        return star;
    },
    /**
     * Fills the grid of an EasyStar instance (a map) from a ct.js room.
     * @param {Array} map - The EasyStar map to fill.
     * @param {Object} options - The options for generating the map.
     * @param {number} options.startingX - The starting X coordinate.
     * @param {number} options.startingY - The starting Y coordinate.
     * @param {number} options.mapCols - The number of columns in the map.
     * This can be used instead of mapWidth.
     * @param {number} options.mapRows - The number of rows in the map.
     * This can be used instead of mapHeight.
     * @param {number} options.mapWidth - The width of the map in pixels.
     * This can be used instead of mapCols.
     * @param {number} options.mapHeight - The height of the map in pixels.
     * This can be used instead of mapRows.
     * @param {number} options.cellWidth - The width of each cell.
     * @param {number} options.cellHeight - The height of each cell.
     * @param {string} options.freeCells - The value representing walkable cells
     * that will be written into the map's grid. Defaults to 1.
     * @param {Record<string, number>} options.queries - A plain JS object which maps collision
     * groups to their respective values in the map's grid. Note that every collision group will
     * run its own pass of collision checks — use them sparingly, only when collision groups'
     * copies and tiles cover a considerable amount of space. Otherwise, use avoidAdditionalPoint
     * method on map's instance to make specific cells impassable.
     * @param {boolean} options.fast - Whether to use fast mode that will check for collisions
     * by checking only the central point of each cell. (Default behavior.) The slow mode
     * will instead check each cell by checking collisions against rectangles.
     */
    generateAdvanced(map, options) {
        const defaults = {
            startingX: 0,
            startingY: 0,
            freeCells: 1,
            fast: true
        };
        const o = Object.assign({}, defaults, options);
        pathfinderValidate(o);

        const {cellWidth, cellHeight, startingX, startingY, freeCells} = o;
        const width = o.mapCols ? Math.ceil(o.mapCols) : Math.ceil(o.mapWidth / cellWidth);
        const height = o.mapRows ? Math.ceil(o.mapRows) : Math.ceil(o.mapHeight / cellHeight);
        const grid = [];
        const queriesEntries = Object.entries(o.queries);
        if (o.fast) {
            const baseX = (startingX || 0) + cellWidth / 2;
            const baseY = (startingY || 0) + cellHeight / 2;
            for (let y = 0; y < height; y++) {
                const row = [];
                for (let x = 0; x < width; x++) {
                    let value = freeCells;
                    for (const [cgroup, cvalue] of queriesEntries) {
                        if (place.tracePoint({
                            x: baseX + x * cellWidth,
                            y: baseY + y * cellHeight
                        }, cgroup)) {
                            value = cvalue;
                        }
                    }
                    row.push(value);
                }
                grid.push(row);
            }
        } else {
            // Make rectangles a bit smaller than the cell size to not overlap with adjacent cells
            const baseX = (startingX || 0) + 0.1;
            const baseY = (startingY || 0) + 0.1;
            const cellWidthShrunk = cellWidth - 0.2;
            const cellHeightShrunk = cellHeight - 0.2;
            for (let y = 0; y < height; y++) {
                const row = [];
                for (let x = 0; x < width; x++) {
                    let value = freeCells;
                    for (const [cgroup, cvalue] of queriesEntries) {
                        if (place.traceRect({
                            x: baseX + x * cellWidth,
                            y: baseY + y * cellHeight,
                            width: cellWidthShrunk,
                            height: cellHeightShrunk
                        }, cgroup)) {
                            value = cvalue;
                        }
                    }
                    row.push(value);
                }
                grid.push(row);
            }
        }
        map.setGrid(grid);
        // Expose used variables on the map instance for debugging and converter methods
        Object.assign(map, {
            width,
            height,
            startingX,
            startingY,
            cellWidth,
            cellHeight,
            grid
        });
    },
    /**
     * Fills the grid of an EasyStar instance (a map) from a ct.js room.
     * @param {Array} map - The EasyStar map to fill.
     * @param {string} cgroup - The collision group that is considered solid, unwalkable.
     * @param {Object} options - The options for generating the map.
     * @param {number} options.startingX - The starting X coordinate.
     * @param {number} options.startingY - The starting Y coordinate.
     * @param {number} options.mapCols - The number of columns in the map.
     * This can be used instead of mapWidth.
     * @param {number} options.mapRows - The number of rows in the map.
     * This can be used instead of mapHeight.
     * @param {number} options.mapWidth - The width of the map in pixels.
     * This can be used instead of mapCols.
     * @param {number} options.mapHeight - The height of the map in pixels.
     * This can be used instead of mapRows.
     * @param {number} options.cellWidth - The width of each cell.
     * @param {number} options.cellHeight - The height of each cell.
     * @param {number} options.walkable - The value representing walkable cells
     * that will be written into the map's grid. Defaults to 1.
     * @param {number} options.occupied - The value representing occupied cells
     * that will be written into the map's grid. Defaults to 0.
     * @param {boolean} options.fast - Whether to use fast mode that will check for collisions
     * by checking only the central point of each cell. (Default behavior.) The slow mode
     * will instead check each cell by checking collisions against rectangles.
     */
    generateBasic(map, cgroup, options) {
        pathfinder.generateAdvanced(map, {
            ...options,
            freeCells: options.walkable,
            queries: {
                [cgroup]: options.occupied
            }
        });
    },

    // RGB values and their respective PIXI colors
    debugColors: [
        [0, 0, 0, 0x000000],
        [255, 255, 255, 0xFFFFFF],
        [0, 255, 0, 0x00FF00],
        [255, 0, 0, 0xFF0000],
        [0, 0, 255, 0x0000FF],
        [255, 255, 0, 0xFFFF00],
        [0, 255, 255, 0x00FFFF],
        [255, 0, 255, 0xFF00FF],
        [192, 192, 192, 0xC0C0C0],
        [128, 128, 128, 0x808080],
        [64, 64, 64, 0x404040]
    ],
    debugGraphics: [],
    // Used to give paths different colors
    debugCounter: 0,
    /**
     * Draws debug graphics for the given map.
     *
     * Note that this requires the map to have been generated with the `generateBasic`
     * or `generateAdvanced` functions. If you're setting a grid manually, you will need to
     * assign `width`, `height`, `startingX`, `startingY`, `cellWidth`, `cellHeight`, and `grid`
     * properties to the map before calling this function.
     * @param {EasyStarInstance} map - The EasyStar instance (a map) to draw debug graphics for.
     * @returns {PIXI.Sprite} The debug graphics that were drawn. Use it to later
     * remove it from the screen with a destroy() call.
     */
    drawDebugMap(map) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = map.width;
        canvas.height = map.height;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const fragment = imageData.data;
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                const shift = (y * map.width + x) * 4;
                const cell = map.grid[y][x];
                const color = pathfinder.debugColors[cell % pathfinder.debugColors.length];
                /* eslint-disable prefer-destructuring */
                fragment[shift] = color[0];
                fragment[shift + 1] = color[1];
                fragment[shift + 2] = color[2];
                fragment[shift + 3] = 255;
                /* eslint-enable prefer-destructuring */
            }
        }
        ctx.putImageData(imageData, 0, 0);

        // Plop the resulting canvas as a PIXI sprite into the game world
        const sprite = PIXI.Sprite.from(canvas);
        sprite.position.set(map.startingX ?? 0, map.startingY ?? 0);
        sprite.scale.set(map.cellWidth, map.cellHeight);
        sprite.zIndex = Infinity;
        sprite.alpha = 0.5;
        sprite.texture.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;
        rooms.current.addChild(sprite);

        pathfinder.debugGraphics.push(sprite);
        sprite.on('destroyed', () => {
            const index = pathfinder.debugGraphics.indexOf(sprite);
            if (index !== -1) {
                pathfinder.debugGraphics.splice(index, 1);
            }
        });
        return sprite;
    },
    /**
     * Draws debug graphics for the given path.
     *
     * Note that this requires the map to have been generated with the `generateBasic`
     * or `generateAdvanced` functions. If you're setting a grid manually, you will need to
     * assign `width`, `height`, `startingX`, `startingY`, `cellWidth`, `cellHeight`, and `grid`
     * properties to the map before calling this function.
     * @param {{x: number, y: number}[]} path - The path to draw debug graphics for.
     * @param {EasyStarInstance} map - The EasyStar instance (a map) to draw debug graphics for.
     * @param {number} [color] - The color to draw the debug graphics in.
     * @returns {PIXI.Graphics} The graphics object that was drawn. Use it to later
     * remove it from the screen with a destroy() call.
     *
     * @catnipName Draw debug graphics for a path
     * @catnipSaveReturn
     */
    drawDebugPath(path, map, color) {
        if (!color) {
            const colors = pathfinder.debugColors;
            // eslint-disable-next-line prefer-destructuring
            color = colors[pathfinder.debugCounter % colors.length][3];
            pathfinder.debugCounter++;
        }
        const graphics = new PIXI.Graphics();
        graphics.lineStyle(2, color);
        graphics.zIndex = Infinity;
        path.forEach((point, index) => {
            if (index === 0) {
                graphics.moveTo(point.x * map.cellWidth, point.y * map.cellHeight);
            } else {
                graphics.lineTo(point.x * map.cellWidth, point.y * map.cellHeight);
            }
        });
        graphics.endFill();
        rooms.current.addChild(graphics);
        pathfinder.debugGraphics.push(graphics);
        graphics.on('destroyed', () => {
            const index = pathfinder.debugGraphics.indexOf(graphics);
            if (index !== -1) {
                pathfinder.debugGraphics.splice(index, 1);
            }
        });
        return graphics;
    },
    /**
     * Removes all debug graphics from the game world.
     */
    removeAllDebugGraphics() {
        [...pathfinder.debugGraphics].forEach((item) => {
            item.destroy();
        });
    },
    /**
     * Finds a path from one coordinate to another.
     * @catnipName Find a path to coordinates
     */
    findPathToCoord(map, fromX, fromY, toX, toY, callback) {
        if (!map.cellWidth || !map.cellHeight) {
            throw new Error('[pathfinder] Map dimensions (map.cellWidth, map.cellHeight) are not set. Define cellWidth and cellHeight or use pathfinder.toCell instead');
        }
        const startingCol = Math.round(fromX / map.cellWidth);
        const startingRow = Math.round(fromY / map.cellHeight);
        const targetCol = Math.round(toX / map.cellWidth);
        const targetRow = Math.round(toY / map.cellHeight);
        map.findPath(startingCol, startingRow, targetCol, targetRow, callback);
    },
    /**
     * Finds a path from one cell to another.
     * @catnipName Find a path to a cell
     */
    findPathToCell(map, fromCol, fromRow, toCol, toRow, callback) {
        map.findPath(fromCol, fromRow, toCol, toRow, callback);
    },
    /**
     * Converts a coordinate to a cell in a map. Returns an object with x and y properties.
     * @catnipIgnore
     */
    toCell(map, x, y) {
        if (!map.cellWidth || !map.cellHeight) {
            throw new Error('[pathfinder] Map dimensions (map.cellWidth, map.cellHeight) are not set. Define cellWidth and cellHeight on the map.');
        }
        return {
            x: Math.round(x / map.cellWidth),
            y: Math.round(y / map.cellHeight)
        };
    },
    /**
     * Converts a cell in a map to a coordinate. Returns an object with x and y properties.
     * @catnipIgnore
     */
    toCoordinates(map, col, row) {
        if (!map.cellWidth || !map.cellHeight) {
            throw new Error('[pathfinder] Map dimensions (map.cellWidth, map.cellHeight) are not set. Define cellWidth and cellHeight on the map.');
        }
        return {
            x: col * map.cellWidth,
            y: row * map.cellHeight
        };
    },
    /**
     * Sets the properties of a map. This allows you to apply findPathToCoord
     * and debugging methods to manually-made pathfinding grids.
     * @param {EasyStar} map - The map object. (The EasyStar instance.)
     * @param {number} width - The width of the map.
     * @param {number} height - The height of the map.
     * @param {number} startingX - The starting x-coordinate of the map.
     * @param {number} startingY - The starting y-coordinate of the map.
     * @param {number} cellWidth - The width of each cell in the map.
     * @param {number} cellHeight - The height of each cell in the map.
     * @param {Array<Array<number>>} grid - The grid of the map.
     */
    // eslint-disable-next-line max-params
    setProps(
        map,
        width,
        height,
        startingX,
        startingY,
        cellWidth,
        cellHeight,
        grid
    ) {
        map.width = width;
        map.height = height;
        map.startingX = startingX;
        map.startingY = startingY;
        map.cellWidth = cellWidth;
        map.cellHeight = cellHeight;
        map.grid = grid;
        map.setGrid(grid);
    },
    /**
     * Gets the grid of a map generated by other pathfinder methods.
     */
    getGrid(map) {
        if (!('grid' in map)) {
            throw new Error('[pathfinder] Map does not have a grid. If you\'re setting a grid manually, reuse your preexisting 2D array.');
        }
        return map.grid;
    }
};
if (settings.isDebug) {
    window.pathfinder = pathfinder;
}
