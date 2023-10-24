import {RoomPreviewer} from '../preview/room';
import {IAssetContextItem, getOfType} from '..';

const getDefaultRoom = require('./defaultRoom').get;
const fs = require('fs-extra');
const path = require('path');

const createNewRoom = async function createNewRoom(name: string): Promise<IRoom> {
    const room = getDefaultRoom();
    await fs.copy('./data/img/notexture.png', path.join((global as any).projdir, '/img/r' + room.uid + '.png'));
    if (name) {
        room.name = String(name);
    }
    window.signals.trigger('roomsChanged');
    return room;
};

const getStartingRoom = (): IRoom => {
    const rooms = getOfType('room');
    if (global.currentProject.startroom && global.currentProject.startroom !== -1) {
        return rooms.find(room => room.uid === global.currentProject.startroom);
    }
    return rooms[0];
};

const getThumbnail = RoomPreviewer.getClassic;
const areThumbnailsIcons = false;

const removeAsset = (room: IRoom): void => {
    if (global.currentProject.startroom === room.uid) {
        global.currentProject.startroom = -1;
    }
};

const assetContextMenuItems: IAssetContextItem[] = [
    {
        icon: 'play',
        vocPath: 'rooms.makeStarting',
        action: async (
            asset: ISkeleton,
            collection: folderEntries,
            folder: IAssetFolder
        ) => {
            global.currentProject.startroom = asset.uid;
        }
    }
];

export {
    createNewRoom,
    getStartingRoom,
    areThumbnailsIcons,
    removeAsset,
    assetContextMenuItems,
    createNewRoom as createAsset,
    getThumbnail
};
