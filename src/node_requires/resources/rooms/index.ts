import {RoomPreviewer} from '../preview/room';

const getDefaultRoom = require('./defaultRoom').get;
const fs = require('fs-extra');
const path = require('path');

const createNewRoom = async function createNewRoom(name: string): Promise<IRoom> {
    const room = getDefaultRoom();
    await fs.copy('./data/img/notexture.png', path.join((global as any).projdir, '/img/r' + room.uid + '.png'));
    if (name) {
        room.name = String(name);
    }
    window.currentProject.rooms.push(room);
    window.signals.trigger('roomsChanged');
    return room;
};

/**
 * Gets the ct.js room object by its id.
 * @param {string} id The id of the ct.js room
 * @returns {IRoom} The ct.js room object
 */
const getRoomFromId = function getRoomFromId(id: string): IRoom {
    const room = global.currentProject.rooms.find((r: IRoom) => r.uid === id);
    if (!room) {
        throw new Error(`Attempt to get a non-existent room with ID ${id}`);
    }
    return room;
};
const getById = getRoomFromId;

const getThumbnail = RoomPreviewer.getClassic;

export {
    createNewRoom,
    getRoomFromId,
    getById,
    getThumbnail
};
