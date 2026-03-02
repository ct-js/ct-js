/* eslint-disable id-length */
type EasyStarDirection =
  | 'TOP'
  | 'TOP_RIGHT'
  | 'RIGHT'
  | 'BOTTOM_RIGHT'
  | 'BOTTOM'
  | 'BOTTOM_LEFT'
  | 'LEFT'
  | 'TOP_LEFT';

class EasyStarInstance {
    /**
    * Sets the collision grid that EasyStar uses.
    *
    * @param {Array|Number} tiles An array of numbers that represent
    * which tiles in your grid should be considered
    * acceptable, or "walkable".
    */
    setAcceptableTiles(tiles: number[] | number): void;
    /**
    * Enables sync mode for this EasyStar instance..
    * if you're into that sort of thing.
    */
    enableSync(): voi;
    /**
    * Disables sync mode for this EasyStar instance.
    */
    disableSync(): void;

    /**
    * Enable diagonal pathfinding.
    */
    enableDiagonals(): void;

    /**
    * Disable diagonal pathfinding.
    */
    disableDiagonals(): void;

    /**
    * Sets the collision grid that EasyStar uses.
    *
    * @param {Array} grid The collision grid that this EasyStar instance will read from.
    * This should be a 2D Array of Numbers.
    */
    setGrid(grid: number[][]): void;

    /**
    * Sets the tile cost for a particular tile type.
    *
    * @param {Number} The tile type to set the cost for.
    * @param {Number} The multiplicative cost associated with the given tile.
    */
    setTileCost(tileType: number, cost: number): void;

    /**
    * Sets the an additional cost for a particular point.
    * Overrides the cost from setTileCost.
    *
    * @param {Number} x The x value of the point to cost.
    * @param {Number} y The y value of the point to cost.
    * @param {Number} The multiplicative cost associated with the given point.
    */
    setAdditionalPointCost(x: number, y: number, cost: number): void;

    /**
    * Remove the additional cost for a particular point.
    *
    * @param {Number} x The x value of the point to stop costing.
    * @param {Number} y The y value of the point to stop costing.
    */
    removeAdditionalPointCost(x: number, y: number): void;

    /**
    * Remove all additional point costs.
    */
    removeAllAdditionalPointCosts(): void;

    /**
    * Sets the number of search iterations per calculation.
    * A lower number provides a slower result, but more practical if you
    * have a large tile-map and don't want to block your thread while
    * finding a path.
    *
    * @param {Number} iterations The number of searches to prefrom per calculate() call.
    */
    setIterationsPerCalculation(iterations: number): void;

    /**
    * Avoid a particular point on the grid,
    * regardless of whether or not it is an acceptable tile.
    *
    * @param {Number} x The x value of the point to avoid.
    * @param {Number} y The y value of the point to avoid.
    */
    avoidAdditionalPoint(x: number, y: number): void;

    /**
    * Stop avoiding a particular point on the grid.
    *
    * @param {Number} x The x value of the point to stop avoiding.
    * @param {Number} y The y value of the point to stop avoiding.
    */
    stopAvoidingAdditionalPoint(x: number, y: number): void;

    /**
    * Enables corner cutting in diagonal movement.
    */
    enableCornerCutting(): void;

    /**
    * Disables corner cutting in diagonal movement.
    */
    disableCornerCutting(): void;

    /**
    * Stop avoiding all additional points on the grid.
    */
    stopAvoidingAllAdditionalPoints(): void;

    /**
    * Find a path.
    *
    * @param {Number} startX The X position of the starting point.
    * @param {Number} startY The Y position of the starting point.
    * @param {Number} endX The X position of the ending point.
    * @param {Number} endY The Y position of the ending point.
    * @param {Function} callback A function that is called when your path
    * is found, or no path is found.
    * @return {Number} A numeric, non-zero value which identifies the created instance.
    * This value can be passed to cancelPath to cancel the path calculation.
    *
    */
    findPath(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    callback: (path: { x: number; y: number }[]) => void
    ): number;

    /**
    * Cancel a path calculation.
    *
    * @param {Number} instanceId The instance ID of the path being calculated
    * @return {Boolean} True if an instance was found and cancelled.
    *
    **/
    cancelPath(instanceId: number): boolean;

    /**
    * This method steps through the A* Algorithm in an attempt to
    * find your path(s). It will search 4-8 tiles (depending on diagonals) for every calculation.
    * You can change the number of calculations done in a call by using
    * map.setIteratonsPerCalculation().
    */
    calculate(): void;

    /**
    * Sets a directional condition on a tile
    *
    * @param {Number} x The x value of the point.
    * @param {Number} y The y value of the point.
    * @param {Array.<String>} allowedDirections
    * A list of all the allowed directions from which the tile is accessible.
    *
    * eg. map.setDirectionalCondition(1, 1, ['TOP']):
    * You can only access the tile by walking down onto it.
    */
    setDirectionalCondition(
    x: number,
    y: number,
    allowedDirections: EasyStarDirection[]
    ): void;

    /**
    * Remove all directional conditions
    */
    removeAllDirectionalConditions(): void;
}

declare interface IPathfinderSettings {
    startingX: number;
    startingY: number;
    mapCols?: number;
    mapRows?: number;
    mapWidth?: number;
    mapHeight?: number;
    cellWidth: number;
    cellHeight: number;
    freeCells?: number;
    queries: Record<string, number>;
    fast?: boolean;
}
declare interface IPathfinderSimpleSettings {
    startingX: number;
    startingY: number;
    mapCols?: number;
    mapRows?: number;
    mapWidth?: number;
    mapHeight?: number;
    cellWidth: number;
    cellHeight: number;
    cgroup: string;
    walkable?: number;
    occupied?: number;
    fast?: boolean;
}
declare interface IPathfinderSimpleSettings {
    startingX: number;
    startingY: number;
    mapCols?: number;
    mapRows?: number;
    mapWidth?: number;
    mapHeight?: number;
    cellWidth: number;
    cellHeight: number;
    freeCells?: number;
    queries: Record<string, number>;
    fast?: boolean;
}

declare namespace EasyStar {
    var js: typeof EasyStarInstance;
}

declare namespace pathfinder {
    /**
     * Creates a new EasyStar instance (a map) with the specified options.
     * @param {boolean} diagonals - Whether to enable diagonal movement.
     * @param {boolean} cornerCutting - Whether to enable corner cutting.
     * This has no effect if diagonals are disabled.
     * @returns {EasyStarInstance} A new EasyStar instance.
     *
     * @catnipName Create a map
     * @catnipSaveReturn
     */
    function create(diagonals: boolean, cornerCutting: boolean): EasyStarInstance;

    /**
     * Fills the grid of an EasyStar instance (a map) from a ct.js room.
     * @param {EasyStarInstance} map - The EasyStar map to fill.
     * @param {string} cgroup - The collision group that is considered solid, unwalkable.
     * @param {IPathfinderSimpleSettings} options - The options for generating the map.
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
     *
     * @catnipIgnore
     */
    function generateBasic(
        map: EasyStarInstance,
        cgroup: string,
        options: IPathfinderSimpleSettings
    ): void;

    /**
     * Fills the grid of an EasyStar instance (a map) from a ct.js room.
     * @param {EasyStarInstance} map - The EasyStar map to fill.
     * @param {IPathfinderSettings} options - The options for generating the map.
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
     * @param {Record<string,number>} options.queries - A plain JS object which maps
     * collision groups to their respective values in the map's grid. Note that every
     * collision group will run its own pass of collision checks — use them sparingly, only when
     * collision groups' * copies and tiles cover a considerable amount of space.
     * Otherwise, use avoidAdditionalPoint method on map's instance to make specific cells
     * impassable.
     * @param {boolean} options.fast - Whether to use fast mode that will check for collisions
     * by checking only the central point of each cell. (Default behavior.) The slow mode
     * will instead check each cell by checking collisions against rectangles.
     *
     * @catnipIgnore
     */
    function generateAdvanced(map: EasyStarInstance, options: IPathfinderSettings): void;

    /**
     * Sets the properties of a map. This allows you to apply findPathToCoord
     * and debugging methods to manually-made pathfinding grids.
     * @catnipName Set properties for a manually-created map
     * @param {EasyStar} map - The map object. (The EasyStar instance.)
     * @param {number} width - The width of the map.
     * @param {number} height - The height of the map.
     * @param {number} startingX - The starting x-coordinate of the map.
     * @param {number} startingY - The starting y-coordinate of the map.
     * @param {number} cellWidth - The width of each cell in the map.
     * @param {number} cellHeight - The height of each cell in the map.
     * @param {Array<Array<number>>} grid - The grid of the map.
     */
    function setProps(
        map: EasyStar,
        width: number,
        height: number,
        startingX: number,
        startingY: number,
        cellWidth: number,
        cellHeight: number,
        grid: number[][]
    ): void;

    /**
     * Gets the grid of a map generated by other pathfinder methods.
     * This method is mainly for Catnip language, as you can write map.grid directly.
     * @catnipName get grid of a map
     * @catnipDisplayName get grid of
     */
    function getGrid(map: EasyStarInstance): number[][];

    /**
     * Draws debug graphics for the given map.
     *
     * Note that this requires the map to have been generated with the `generateBasic`
     * or `generateAdvanced` functions. If you're setting a grid manually, you will need to
     * assign `width`, `height`, `startingX`, `startingY`, `cellWidth`, `cellHeight`, and `grid`
     * properties to the map before calling this function.
     * @param {EasyStarInstance} map - The EasyStar instance (a map) to draw debug graphics for.
     *
     * @catnipName Draw debug graphics for map
     * @catnipSaveReturn
     */
    function drawDebugMap(map: EasyStarInstance): PIXI.Sprite;
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
    function drawDebugPath(
        path: { x: number, y: number }[],
        map: EasyStarInstance,
        color?: number
    ): PIXI.Graphics;
    /**
     * Removes all debug graphics from the game world.
     */
    function removeAllDebugGraphics(): void;
}
