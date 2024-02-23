import * as PIXI from 'node_modules/pixi.js';
import {BaseClassCapability, baseClassCapabilities} from '../resources/templates';

interface ISimplePoint {
    x: number;
    y: number;
}

export const defaultTextStyle = new PIXI.TextStyle({
    dropShadow: true,
    dropShadowDistance: 2,
    dropShadowAlpha: 0.35,
    fill: '#fff',
    fontFamily: '\'Open Sans\',sans-serif,serif',
    fontSize: 16
});

/** Converts global coordinates to coordinates on a diagonal grid */
export const toDiagonal = (pos: ISimplePoint, gridX: number, gridY: number): ISimplePoint => ({
    x: pos.y / gridY + pos.x / gridX,
    y: -pos.x / gridX + pos.y / gridY
});
/** Converts coordinates on a diagonal grid to global coordinates */
export const fromDiagonal = (pos: ISimplePoint, gridX: number, gridY: number): ISimplePoint => ({
    x: 0.5 * gridX * (pos.x - pos.y),
    y: 0.5 * gridY * (pos.x + pos.y)
});
/** Converts global coordinates to coordinates on a rectangular grid */
export const toRectangular = (pos: ISimplePoint, gridX: number, gridY: number): ISimplePoint => ({
    x: pos.x / gridX,
    y: pos.y / gridY
});
/** Converts coordinates on a rectangular grid to global coordinates */
export const fromRectangular = (pos: ISimplePoint, gridX: number, gridY: number): ISimplePoint => ({
    x: pos.x * gridX,
    y: pos.y * gridY
});

export const snapToDiagonalGrid = (
    pos: ISimplePoint,
    gridX: number,
    gridY: number
): ISimplePoint => {
    const diag = toDiagonal({
        x: pos.x,
        y: pos.y
    }, gridX, gridY);
    return fromDiagonal({
        x: Math.round(diag.x),
        y: Math.round(diag.y)
    }, gridX, gridY);
};
export const snapToRectangularGrid = (
    pos: ISimplePoint,
    gridX: number,
    gridY: number
): ISimplePoint => ({
    x: Math.round(pos.x / gridX) * gridX,
    y: Math.round(pos.y / gridY) * gridY
});

export const eraseCursor = 'url("data/cursorErase.svg") 1 1, default';
export const rotateCursor = 'url("data/cursorRotate.svg") 12 12, pointer';

/**
 * Six filters that recolor any DisplayObject to one of the primary+secondary colors.
 * The colors:
 *
 * 0: Red
 * 1: Yellow
 * 2: Green
 * 3: Aqua
 * 4: Blue
 * 5: Magenta
 */
export const recolorFilters: PIXI.ColorMatrixFilter[] = [];
for (let i = 0; i < 6; i++) {
    const filter = new PIXI.ColorMatrixFilter();
    recolorFilters.push(filter);
}
/* eslint-disable array-element-newline, no-underscore-dangle, no-multi-spaces */
recolorFilters[0].matrix = [
    1,    1,    1,    0,  0,
    0.1,  0.1,  0.1,  0,  0,
    0.1,  0.1,  0.1,  0,  0,
    0,    0,    0,    1,  0
];
recolorFilters[1].matrix = [
    0.5,  0.5,  0.5,  0,  0,
    0.5,  0.5,  0.5,  0,  0,
    0.1,  0.1,  0.1,  0,  0,
    0,    0,    0,    1,  0
];
recolorFilters[2].matrix = [
    0.1,  0.1,  0.1,  0,  0,
    1,    1,    1,    0,  0,
    0.1,  0.1,  0.1,  0,  0,
    0,    0,    0,    1,  0
];
recolorFilters[3].matrix = [
    0.1,  0.1,  0.1,  0,  0,
    0.5,  0.5,  0.5,  0,  0,
    0.5,  0.5,  0.5,  0,  0,
    0,    0,    0,    1,  0
];
recolorFilters[4].matrix = [
    0.1,  0.1,  0.1,  0,  0,
    0.1,  0.1,  0.1,  0,  0,
    1,    1,    1,    0,  0,
    0,    0,    0,    1,  0
];
recolorFilters[5].matrix = [
    0.5,  0.5,  0.5,  0,  0,
    0.1,  0.1,  0.1,  0,  0,
    0.5,  0.5,  0.5,  0,  0,
    0,    0,    0,    1,  0
];
/* eslint-enable array-element-newline, no-underscore-dangle, no-multi-spaces*/

export const toPrecision = (input: number, precision: number): number => {
    const mantissa = input % 1;
    const whole = input > 0 ? Math.floor(input) : Math.ceil(input);
    return whole + Math.round(mantissa * (10 ** precision)) / (10 ** precision);
};

export const copyBindingTypes: Record<CopyBinding, CopyBindingValType> = {
    disabled: 'boolean',
    tex: 'string',
    text: 'string',
    visible: 'boolean',
    tint: 'number',
    count: 'number'
};
const bindingsMap: Partial<Record<BaseClassCapability, CopyBinding[]>> = {
    textured: ['tex', 'tint'],
    visualStates: ['disabled'],
    text: ['text', 'tint'],
    embeddedText: ['text'],
    repeater: ['count']
};
export const getBindingsForBaseClass = (baseClass: TemplateBaseClass): CopyBinding[] => {
    const bindings: CopyBinding[] = ['visible'];
    for (const capability of baseClassCapabilities[baseClass]) {
        if (!(capability in bindingsMap)) {
            continue;
        }
        for (const binding of bindingsMap[capability]) {
            if (!bindings.includes(binding)) {
                bindings.push(binding);
            }
        }
    }
    return bindings;
};
