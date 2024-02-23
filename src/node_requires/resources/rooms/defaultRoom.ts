import generateGUID from './../../generateGUID';

const room = {
    type: 'room' as const,
    oncreate: '',
    onstep: '',
    ondraw: '',
    onleave: '',
    gridX: 64,
    gridY: 64,
    diagonalGrid: false,
    simulate: true,
    width: 1280,
    height: 720,
    restrictCamera: false,
    restrictMaxX: 1280,
    restrictMinX: 1280,
    restrictMaxY: 720,
    restrictMinY: 720,
    isUi: false
};

const get = function (): IRoom {
    const uid = generateGUID();
    const newRoom: IRoom = Object.assign({}, room, {
        name: 'Room_' + uid.slice(-6),
        backgroundColor: '#000000',
        restrictCamera: false,
        follow: -1 as assetRef,
        backgrounds: [],
        copies: [],
        tiles: [],
        extends: {},
        lastmod: Number(new Date()),
        events: [],
        behaviors: [],
        uid
    });
    return newRoom;
};

export {get};
