/* eslint-disable no-unused-vars */
/**
 * This class represents a camera that is used by ct.js' cameras.
 * Usually you won't create new instances of it, but if you need, you can substitute
 * ct.camera with a new one.
 *
 * @extends {PIXI.AnimatedSprite}
 * @class
 *
 * @property {number} x The real x-coordinate of the camera. It does not have a screen shake effect applied, as well as may differ from `targetX` if the camera is in transition.
 * @property {number} y The real y-coordinate of the camera. It does not have a screen shake effect applied, as well as may differ from `targetY` if the camera is in transition.
 * @property {number} width The width of the unscaled shown region. This is the base, unscaled value. Use ct.camera.scale.x to get a scaled version. To change this value, see `ct.width` property.
 * @property {number} height The width of the unscaled shown region. This is the base, unscaled value. Use ct.camera.scale.y to get a scaled version. To change this value, see `ct.height` property.
 * @property {number} targetX The x-coordinate of the target location. Moving it instead of just using the `x` parameter will trigger the drift effect.
 * @property {number} targetY The y-coordinate of the target location. Moving it instead of just using the `y` parameter will trigger the drift effect.
 *
 * @property {Copy|false} follow If set, the camera will follow the given copy.
 * @property {number|null} borderX Works if `follow` is set to a copy. Sets the frame inside which the copy will be kept, in game pixels. Can be set to `null` so the copy is set to the center of the screen.
 * @property {number|null} borderY Works if `follow` is set to a copy. Sets the frame inside which the copy will be kept, in game pixels. Can be set to `null` so the copy is set to the center of the screen.
 * @property {number} shiftX Works if `follow` is set to a copy. Displaces the camera horizontally, relative to the copy.
 * @property {number} shiftY Works if `follow` is set to a copy. Displaces the camera vertically, relative to the copy.
 * @property {number} drift Works if `follow` is set to a copy. If set to a value between 0 and 1, it will make camera movement smoother
 *
 * @property {number} shake The current power of a screen shake effect, relative to the screen's max side (100 is 100% of screen shake). If set to 0 or less, it, disables the effect.
 * @property {number} shakePhase The current phase of screen shake oscillation.
 * @property {number} shakeDecay The amount of `shake` units substracted in a second.
 * @property {number} shakeFrequency The base frequency of the screen shake effect.
 * @property {number} shakeX A multiplier applied to the horizontal screen shake effect. Default is 1.
 * @property {number} shakeY A multiplier applied to the vertical screen shake effect. Default is 1.
 * @property {number} shakeMax The maximum possible value for the `shake` property to protect players from losing their monitor, in `shake` units. Default is 10.
 *
 * @property {boolean} roundValues If set to true, the computed coordinates will be rounded. This can help with developing pixelart games.
 */
class Camera extends PIXI.DisplayObject {
    constructor(x, y, w, h) {
        super();
        this.follow = this.rotate = false;
        this.targetX = this.x = x;
        this.targetY = this.y = y;
        this.width = w || 1920;
        this.height = h || 1080;
        this.shiftX = this.shiftY = 0;
        this.borderX = this.borderY = null;
        this.drift = 0;
        this.shake = this.shakeDecay = 0;
        this.shakeX = this.shakeY = 1;
        this.shakeFrequency = 10;

        this.shakePhase = this.shakePhaseX = this.shakePhaseY = 0;
    }

    /**
     * Moves the camera to a new position. It will have a smooth transition
     * if a `drift` parameter is set.
     * @param {number} x New x coordinate
     * @param {number} y New y coordinate
     * @returns {void}
     */
    moveTo(x, y) {
        this.targetX = x;
        this.targetY = y;
    }

    /**
     * Moves the camera to a new position. Ignores the `drift` value.
     * @param {number} x New x coordinate
     * @param {number} y New y coordinate
     * @returns {void}
     */
    teleportTo(x, y) {
        this.targetX = this.x = x;
        this.targetY = this.y = y;
        this.shakePhase = this.shakePhaseX = this.shakePhaseY = 0;
    }

    /**
     * Updates the position of the camera
     * @param {number} delta A delta value between the last two frames. This is usually ct.delta.
     * @returns {void}
     */
    update(delta) {
        if (this.follow.kill) {
            this.follow = false;
        }

        const sec = delta / PIXI.Ticker.shared.maxFPS;
        this.shakePhase += sec * this.shakeFrequency;
        this.shakePhaseX += sec * this.shakeFrequency + Math.sin(this.shakeFrequency * 1.489); // no logic in these constants
        this.shakePhaseY += sec * this.shakeFrequency + Math.cos(this.shakeFrequency * 1.734); // They are used to desync fluctuations and remove repetitive circular movements

        // The speed of drift movement
        const speed = this.drift? Math.min(1, (1-this.drift)*delta) : 1;

        if (this.follow && ('x' in this.follow) && ('y' in this.follow)) {
            let cx = 0,
                cy = 0;
            const w = this.borderX === null? this.width / 2 : Math.min(this.borderX, this.width / 2);
            const h = this.borderY === null? this.height / 2 : Math.min(this.borderY, this.height / 2);

            if (this.follow.x + this.shiftX - this.x < w) {
                cx = this.follow.x + this.shiftX - this.x - w;
            }
            if (this.follow.x + this.shiftX - this.x > this.width - w) {
                cx = this.follow.x + this.shiftX - this.x - this.width + w;
            }
            if (this.follow.y + this.shiftY - this.y < h) {
                cy = this.follow.y + this.shiftY - this.y - h;
            }
            if (this.follow.y + this.shiftY - this.y > this.width - h) {
                cy = this.follow.y + this.shiftY - this.y - this.width + h;
            }
            this.targetX += cx;
            this.targetY += cy;
        }

        this.x = this.targetX * (1-speed) + this.x * speed;
        this.y = this.targetY * (1-speed) + this.y * speed;

        this.x = this.x || 0;
        this.y = this.y || 0;
    }

    /** Returns the current camera position plus the screen shake effect. */
    get computedX() {
        const dx = (Math.sin(this.shakePhaseX) + Math.sin(this.shakePhaseX * 2.1846)) / 1.5;
        const x = this.x + dx * this.shake * Math.max(ct.viewWidth, this.height) / 100 * this.shakeX;
        return this.roundValues? Math.round(x) : x;
    }
    /** Returns the current camera position plus the screen shake effect. */
    get computedY() {
        const dy = (Math.sin(this.shakePhaseX) + Math.sin(this.shakePhaseX * 1.8948)) / 1.5;
        const y = this.y + dy * this.shake * Math.max(ct.viewWidth, this.height) / 100 * this.shakeY;
        return this.roundValues? Math.round(y) : y;
    }

    /**
     * Returns the position of the left edge where the visible rectangle ends, in game coordinates.
     * This can be used for UI positioning in game coordinates. This does not count for rotations, though.
     * For rotated and/or scaled viewports, see `getTopLeftCorner` and `getBottomLeftCorner` methods.
     */
    get left() {
        return this.computedX + (this.width / 2) * this.scale.x;
    }
    /**
     * Returns the position of the top edge where the visible rectangle ends, in game coordinates.
     * This can be used for UI positioning in game coordinates. This does not count for rotations, though.
     * For rotated and/or scaled viewports, see `getTopLeftCorner` and `getTopRightCorner` methods.
     */
    get top() {
        return this.computedY - (this.height / 2) * this.scale.y;
    }
    /**
     * Returns the position of the right edge where the visible rectangle ends, in game coordinates.
     * This can be used for UI positioning in game coordinates. This does not count for rotations, though.
     * For rotated and/or scaled viewports, see `getTopRightCorner` and `getBottomRightCorner` methods.
     */
    get right() {
        return this.computedX + (this.width / 2) * this.scale.x;
    }
    /**
     * Returns the position of the bottom edge where the visible rectangle ends, in game coordinates.
     * This can be used for UI positioning in game coordinates. This does not count for rotations, though.
     * For rotated and/or scaled viewports, see `getBottomLeftCorner` and `getBottomRightCorner` methods.
     */
    get bottom() {
        return this.computedY + (this.height / 2) * this.scale.y;
    }

    /**
     * Gets the position of the top-left corner of the viewport in game coordinates.
     * This is useful for positioning UI elements in game coordinates, especially with rotated viewports.
     * @returns {Array<number>} A pair of `x` and `y` coordinates.
     */
    getTopLeftCorner() {
        const hw = this.width / 2 * this.scale.x;
        const hh = this.height / 2 * this.scale.y;
        return ct.u.rotate(this.x - hw, this.y - hh, this.angle);
    }

    /**
     * Gets the position of the top-right corner of the viewport in game coordinates.
     * This is useful for positioning UI elements in game coordinates, especially with rotated viewports.
     * @returns {Array<number>} A pair of `x` and `y` coordinates.
     */
    getTopRightCorner() {
        const hw = this.width / 2 * this.scale.x;
        const hh = this.height / 2 * this.scale.y;
        return ct.u.rotate(this.x + hw, this.y - hh, this.angle);
    }

    /**
     * Gets the position of the bottom-left corner of the viewport in game coordinates.
     * This is useful for positioning UI elements in game coordinates, especially with rotated viewports.
     * @returns {Array<number>} A pair of `x` and `y` coordinates.
     */
    getBottomLeftCorner() {
        const hw = this.width / 2 * this.scale.x;
        const hh = this.height / 2 * this.scale.y;
        return ct.u.rotate(this.x - hw, this.y + hh, this.angle);
    }

    /**
     * Gets the position of the bottom-right corner of the viewport in game coordinates.
     * This is useful for positioning UI elements in game coordinates, especially with rotated viewports.
     * @returns {Array<number>} A pair of `x` and `y` coordinates.
     */
    getBottomRightCorner() {
        const hw = this.width / 2 * this.scale.x;
        const hh = this.height / 2 * this.scale.y;
        return ct.u.rotate(this.x + hw, this.y + hh, this.angle);
    }

    /**
     * Returns the bounding box of the camera.
     * Useful for rotated viewports when something needs to be reliably covered by a rectangle.
     * @returns {PIXI.Rectangle} The bounding box of the camera.
     */
    getBoundingBox() {
        const bb = new PIXI.Bounds();
        const hw = this.width / 2 * this.scale.x;
        const hh = this.height / 2 * this.scale.y;
        const tl = ct.u.rotate(this.x - hw, this.y - hh, this.angle),
              tr = ct.u.rotate(this.x + hw, this.y - hh, this.angle),
              bl = ct.u.rotate(this.x - hw, this.y + hh, this.angle),
              br = ct.u.rotate(this.x + hw, this.y + hh, this.angle);
        bb.addPoint(new PIXI.Point(tl[0], tl[1]));
        bb.addPoint(new PIXI.Point(tr[0], tr[1]));
        bb.addPoint(new PIXI.Point(bl[0], bl[1]));
        bb.addPoint(new PIXI.Point(br[0], br[1]));
        return bb.getRectangle();
    }
}
