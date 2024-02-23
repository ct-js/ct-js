const {getUnwrappedExtends} = require('./utils');
import {getBaseScripts} from './scriptableProcessor';
import {embedStaticBehaviors, getBehaviorsList, unwrapBehaviorFields} from './behaviors';

import {ExportedTile, ExportedTilemap, ExportedCopy, ExportedBg} from './_exporterContracts';
import {getOfType, getById} from '../resources';

const getStartingRoom = (proj: IProject): IRoom => {
    const rooms = getOfType('room');
    let [startroom] = rooms; // picks the first room by default
    if (proj.startroom && proj.startroom !== -1) {
        try {
            startroom = getById('room', proj.startroom);
        } catch (Oo) {
            void Oo;
        }
    }
    return startroom;
};
const getConstraints = (r: IRoom) => {
    if (r.restrictCamera) {
        let x1 = r.restrictMinX || 0,
            y1 = r.restrictMinY || 0,
            x2 = r.restrictMaxX === void 0 ? r.width : r.restrictMaxX,
            y2 = r.restrictMaxY === void 0 ? r.height : r.restrictMaxY;
        if (x1 > x2) {
            [x1, x2] = [x2, x1];
        }
        if (y1 > y2) {
            [y1, y2] = [y2, y1];
        }
        return {
            x1,
            y1,
            x2,
            y2
        };
    }
    return false;
};
const getBindings = (copy: IRoomCopy): string | false => {
    if (!copy.bindings) {
        return false;
    }
    let bindings = '';
    for (const key of Object.keys(copy.bindings) as CopyBinding[]) {
        if (key === 'disabled') {
            bindings += `
                this.disabled = ${copy.bindings[key]};
            `;
        } else if (key === 'visible') {
            bindings += `
                this.visible = ${copy.bindings[key]};
            `;
        } else if (key === 'tex') {
            bindings += `
                let newTex = ${copy.bindings[key]};
                if (this.tex !== newTex) {
                    this.tex = newTex;
                }
            `;
        } else if (key === 'tint') {
            bindings += `
                this.tint = ${copy.bindings[key]};
            `;
        } else if (key === 'text') {
            bindings += `
                let newText = ${copy.bindings[key]};
                if (this.text !== newText) {
                    this.text = newText;
                }
            `;
        } else if (key === 'count') {
            bindings += `
                let newCount = ${copy.bindings[key]};
                if (this.count !== newCount) {
                    this.count = newCount;
                }
            `;
        }
    }
    if (bindings) {
        return bindings;
    }
    return false;
};

// eslint-disable-next-line max-lines-per-function
const stringifyRooms = (
    assets: {room: IRoom[], template: ITemplate[]},
    proj: IProject
): IScriptablesFragment => {
    let roomsCode = '';
    let rootRoomOnCreate = '';
    let rootRoomOnStep = '';
    let rootRoomOnDraw = '';
    let rootRoomOnLeave = '';

    const rooms = assets.room.map(r => embedStaticBehaviors(r, proj));

    for (const r of rooms) {
        const bindings: Record<number, string> = {};
        const objs: ExportedCopy[] = [];
        for (let i = 0, l = r.copies.length; i < l; i++) {
            const copy = r.copies[i];
            const binding = getBindings(copy);
            if (binding) {
                bindings[i] = binding;
            }
            const exportableCopy = {
                ...copy,
                template: getById('template', copy.uid).name
            };
            delete exportableCopy.uid;
            delete exportableCopy.bindings;
            objs.push(exportableCopy);
        }
        const bgs: ExportedBg[] = [];
        for (const bg of r.backgrounds) {
            bgs.push({
                texture: getById('texture', bg.texture as string).name,
                depth: Number(bg.depth),
                exts: {
                    movementX: bg.movementX,
                    movementY: bg.movementY,
                    parallaxX: bg.parallaxX,
                    parallaxY: bg.parallaxY,
                    repeat: bg.repeat,
                    scaleX: bg.scaleX,
                    scaleY: bg.scaleY,
                    shiftX: bg.shiftX,
                    shiftY: bg.shiftY
                }
            });
        }

        const tileLayers = [];
        /* eslint {max-depth: off} */
        if (r.tiles) {
            for (const tileLayer of r.tiles) {
                const layer: ExportedTilemap = {
                    depth: tileLayer.depth,
                    tiles: [] as ExportedTile[],
                    cache: tileLayer.cache ?? true,
                    extends: tileLayer.extends ? getUnwrappedExtends(tileLayer.extends) : {}
                };
                for (const tile of tileLayer.tiles) {
                    const texture = getById('texture', tile.texture);
                    layer.tiles.push({
                        texture: texture.name,
                        frame: tile.frame,
                        x: tile.x,
                        y: tile.y,
                        width: texture.width,
                        height: texture.height,
                        opacity: tile.opacity,
                        rotation: tile.rotation,
                        scale: {
                            x: tile.scale.x,
                            y: tile.scale.y
                        },
                        tint: tile.tint
                    });
                }
                tileLayers.push(layer);
            }
        }

        const constraints = getConstraints(r);
        const scriptableCode = getBaseScripts(r, proj);

        roomsCode += `
rooms.templates['${r.name}'] = {
    name: '${r.name}',
    width: ${r.width},
    height: ${r.height},` +
    /* JSON.parse is faster at loading big objects */`
    behaviors: JSON.parse('${JSON.stringify(getBehaviorsList(r))}'),
    objects: JSON.parse('${JSON.stringify(objs)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, '\\\'')}'),
    bgs: JSON.parse('${JSON.stringify(bgs)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, '\\\'')}'),
    tiles: JSON.parse('${JSON.stringify(tileLayers)
        .replace(/\\/g, '\\\\')
        .replace(/'/g, '\\\'')}'),
    backgroundColor: '${r.backgroundColor || '#000000'}',
    ${constraints ? 'cameraConstraints: ' + JSON.stringify(constraints) + ',' : ''}
    onStep() {
        ${scriptableCode.thisOnStep}
    },
    onDraw() {
        ${scriptableCode.thisOnDraw}
    },
    onLeave() {
        ${scriptableCode.thisOnDestroy}
    },
    onCreate() {
        ${scriptableCode.thisOnCreate}
    },
    isUi: ${Boolean(r.isUi)},
    follow: ${(r.follow && r.follow !== -1) ? ('\'' + getById('template', r.follow).name + '\'') : 'false'},
    extends: ${r.extends ? JSON.stringify(unwrapBehaviorFields(r, getUnwrappedExtends(r.extends)), null, 4) : '{}'},
    bindings: {
    ${Object.keys(bindings)
        .map(k => `
            /* Bindings at room ${r.name} for template ${r.copies[Number(k)].uid} */
            ${k}: function () {
                ${bindings[Number(k)]}
            }`)
        .join(',\n')}
    }
}
        `;
        rootRoomOnCreate += scriptableCode.rootRoomOnCreate;
        rootRoomOnStep += scriptableCode.rootRoomOnStep;
        rootRoomOnDraw += scriptableCode.rootRoomOnDraw;
        rootRoomOnLeave += scriptableCode.rootRoomOnLeave;
    }
    return {
        libCode: roomsCode,
        rootRoomOnCreate,
        rootRoomOnStep,
        rootRoomOnDraw,
        rootRoomOnLeave
    };
};

export {
    stringifyRooms,
    getStartingRoom
};
