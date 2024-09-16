import uLib from './u';
import backgrounds, {Background} from './backgrounds';
import templatesLib, {BasicCopy, killRecursive} from './templates';
import {Tilemap} from './tilemaps';
import mainCamera from './camera';
import {copyTypeSymbol, deadPool, pixiApp, stack, forceDestroy} from '.';
import {ExportedRoom} from './../node_requires/exporter/_exporterContracts';
import {updateViewport} from 'fittoscreen';
import {runBehaviors} from './behaviors';

import type * as pixiMod from 'pixi.js';
declare var PIXI: typeof pixiMod;

type RoomMergeResult = {
    copies: BasicCopy[];
    tileLayers: Tilemap[];
    backgrounds: Background[];
};

export class Room extends PIXI.Container<pixiMod.DisplayObject> {
    static roomId = 0;
    static getNewId(): number {
        this.roomId++;
        return this.roomId;
    }
    /**
     * A unique number you can use to differ your rooms.
     */
    uid: number;
    /**
     * Whether or not this room is positioned as a UI layer.
     * See [here](https://docs.ctjs.rocks/tips-n-tricks/game-and-ui-coordinates.html)
     * for more info on UI layers.
     */
    isUi: boolean;
    alignElements: (BasicCopy | (pixiMod.Sprite & {align: ExportedRoom['objects'][0]['align']}))[] = [];
    kill = false;
    tileLayers: Tilemap[] = [];
    backgrounds: Background[] = [];
    bindings: Set<() => void> = new Set();
    tickerSet: Set<BasicCopy & {tick(): void}> = new Set();
    /** Time for the next run of the 1st timer, in seconds. */
    timer1 = 0;
    /** Time for the next run of the 2nd timer, in seconds. */
    timer2 = 0;
    /** Time for the next run of the 3rd timer, in seconds. */
    timer3 = 0;
    /** Time for the next run of the 4th timer, in seconds. */
    timer4 = 0;
    /** Time for the next run of the 5th timer, in seconds. */
    timer5 = 0;
    /** Time for the next run of the 6th timer, in seconds. */
    timer6 = 0;
    /**
     * The list of currently active behaviors. For editing this list,
     * use `behaviors.add` and `behaviors.remove`
     */
    readonly behaviors: string[];
    viewWidth: number;
    viewHeight: number;
    /** The name of this room. */
    name: string;
    /** A backlink to the template data that was used during the creation of this room. */
    template: ExportedRoom;
    /** A template name to follow around. Works with top-level rooms only. */
    follow: string | -1;
    /**
     * Called when this room is created.
     * ⚠ This is a combination of several events and it is not recommended to call it
     * without knowing exactly what you're doing.
     */
    onCreate: () => void;
    /**
     * Called on each frame.
     * ⚠ This is a combination of several events and it is not recommended to call it
     * without knowing exactly what you're doing.
     */
    onStep: () => void;
    /**
     * Called on each frame, after all the onStep events were executed.
     * ⚠ This is a combination of several events and it is not recommended to call it
     * without knowing exactly what you're doing.
     */
    onDraw: () => void;
    /**
     * Called when this room is switched (applies to top-level rooms only).
     * ⚠ This is a combination of several events and it is not recommended to call it
     * without knowing exactly what you're doing.
     */
    onLeave: () => void;

    realignElements(
        oldWidth: number,
        oldHeight: number,
        newWidth: number,
        newHeight: number
    ): void {
        for (const copy of this.alignElements) {
            Room.realignElement(copy, oldWidth, oldHeight, newWidth, newHeight);
        }
    }
    static realignElement(
        copy: BasicCopy | (pixiMod.Sprite & {align: ExportedRoom['objects'][0]['align']}),
        oldWidth: number,
        oldHeight: number,
        newWidth: number,
        newHeight: number
    ): void {
        if (!copy.align) {
            return;
        }
        // get the old reference frame
        const {padding, frame} = copy.align;
        const xref = oldWidth * frame.x1 / 100 + padding.left,
              yref = oldHeight * frame.y1 / 100 + padding.top;
        const wref = oldWidth * (frame.x2 - frame.x1) / 100 - padding.left - padding.right,
              href = oldHeight * (frame.y2 - frame.y1) / 100 - padding.top - padding.bottom;
        // get the new reference frame
        const xnew = newWidth * frame.x1 / 100 + padding.left,
              ynew = newHeight * frame.y1 / 100 + padding.top;
        const wnew = newWidth * (frame.x2 - frame.x1) / 100 - padding.left - padding.right,
              hnew = newHeight * (frame.y2 - frame.y1) / 100 - padding.top - padding.bottom;
        if (oldWidth !== newWidth) {
            switch (copy.align.alignX) {
            case 'start':
                copy.x += xnew - xref;
                break;
            case 'both':
                copy.x += xnew - xref;
                copy.width += wnew - wref;
                break;
            case 'end':
                copy.x += wnew - wref + xnew - xref;
                break;
            case 'center':
                copy.x += (wnew - wref) / 2 + xnew - xref;
                break;
            case 'scale': {
                const k = wnew / wref || 1;
                copy.width *= k;
                copy.x = (copy.x - xref) * k + xnew;
            } break;
            default:
            }
        }
        if (oldHeight !== newHeight) {
            switch (copy.align.alignY) {
            case 'start':
                copy.y += ynew - yref;
                break;
            case 'both':
                copy.y += ynew - yref;
                copy.height += hnew - href;
                break;
            case 'end':
                copy.y += hnew - href + ynew - yref;
                break;
            case 'center':
                copy.y += (hnew - href) / 2 + ynew - yref;
                break;
            case 'scale': {
                const k = hnew / href || 1;
                copy.height *= k;
                copy.y = (copy.y - yref) * k + ynew;
            } break;
            default:
            }
        }
    }
    /**
     * Adds a new copy to the list of elements that should be aligned when window size changes,
     * with the specified alignment settings.
     * The copy must be positioned relative to the current camera dimensions beforehand.
     * @param copy The copy to add
     * @param align The alignment settings
     */
    makeCopyAligned(copy: BasicCopy | pixiMod.Sprite, align: {
        alignX: 'start' | 'center' | 'end' | 'scale' | 'both',
        alignY: 'start' | 'center' | 'end' | 'scale' | 'both',
        frame?: {
            x1: number,
            y1: number,
            x2: number,
            y2: number
        },
        padding?: {
            left: number,
            top: number,
            right: number,
            bottom: number
        }
    }): void {
        const alignObj = Object.assign({}, align);
        if (!align.frame) {
            alignObj.frame = {
                x1: 0,
                y1: 0,
                x2: 100,
                y2: 100
            };
        }
        if (!align.padding) {
            alignObj.padding = {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0
            };
        }
        (copy as (pixiMod.Sprite & {align: ExportedRoom['objects'][0]['align']})).align = alignObj as ExportedRoom['objects'][0]['align'];
        this.alignElements.push(copy as (pixiMod.Sprite & {align: ExportedRoom['objects'][0]['align']}));
    }
    /**
     * Adds a new copy to the list of elements that should be aligned when window size changes,
     * with the specified alignment settings.
     * The copy must be positioned relative to the room's template beforehand.
     * @param copy The copy to add
     * @param align The alignment settings
     */
    makeCopyAlignedRef(copy: BasicCopy | pixiMod.Sprite, align: Parameters<Room['makeCopyAligned']>[1]): void {
        this.makeCopyAligned(copy, align);
        Room.realignElement(
            copy as BasicCopy | (pixiMod.Sprite & {align: ExportedRoom['objects'][0]['align']}),
            this.template.width,
            this.template.height,
            mainCamera.width,
            mainCamera.height
        );
    }

    // eslint-disable-next-line max-lines-per-function
    constructor(template: ExportedRoom, isRoot: boolean) {
        super();
        this.x = this.y = 0;
        this.sortableChildren = true;
        this.uid = Room.getNewId();
        if (template) {
            this.onCreate = template.onCreate;
            this.onStep = template.onStep;
            this.onDraw = template.onDraw;
            this.onLeave = template.onLeave;
            this.template = template;
            this.name = template.name;
            this.isUi = template.isUi;
            this.follow = template.follow;
            this.viewWidth = template.width;
            this.viewHeight = template.height;
            this.behaviors = [...template.behaviors];
            if (template.extends) {
                Object.assign(this, template.extends);
            }
            if (isRoot) {
                roomsLib.current = this;
                (pixiApp.renderer as pixiMod.Renderer).background.color =
                    uLib.hexToPixi(this.template.backgroundColor);
            }
            /*!%beforeroomoncreate%*/
            for (let i = 0, li = template.bgs.length; i < li; i++) {
                // Need to put additional properties like parallax here,
                // so we don't use ct.backgrounds.add
                const bg = new Background(
                    template.bgs[i].texture,
                    0,
                    template.bgs[i].depth,
                    template.bgs[i].exts
                );
                this.addChild(bg);
            }
            for (let i = 0, li = template.tiles.length; i < li; i++) {
                const tl = new Tilemap(template.tiles[i]);
                this.tileLayers.push(tl);
                this.addChild(tl);
            }
            for (let i = 0, li = template.objects.length; i < li; i++) {
                const copy = template.objects[i];
                const exts = copy.exts || {};
                const customProperties = copy.customProperties || {};
                const ctCopy = templatesLib.copyIntoRoom(
                    copy.template,
                    copy.x,
                    copy.y,
                    this,
                    {
                        ...exts,
                        ...customProperties,
                        scaleX: copy.scale.x,
                        scaleY: copy.scale.y,
                        rotation: copy.rotation,
                        alpha: copy.opacity,
                        tint: copy.tint,
                        customSize: copy.customSize,
                        customWordWrap: copy.customWordWrap,
                        customText: copy.customText,
                        customAnchor: copy.customAnchor,
                        align: copy.align
                    }
                );
                if (copy.align) {
                    this.alignElements.push(ctCopy);
                }
                if (template.bindings[i]) {
                    this.bindings.add(template.bindings[i].bind(ctCopy));
                }
            }
            if (this.alignElements.length) {
                this.realignElements(
                    template.width,
                    template.height,
                    mainCamera.width,
                    mainCamera.height
                );
            }
        } else {
            this.behaviors = [];
        }
        return this;
    }
    get x(): number {
        if (this.isUi) {
            return this.position.x;
        }
        return -this.position.x;
    }
    set x(value: number) {
        if (this.isUi) {
            this.position.x = value;
        }
        this.position.x = -value;
    }
    get y(): number {
        if (this.isUi) {
            return this.position.y;
        }
        return -this.position.y;
    }
    set y(value: number) {
        if (this.isUi) {
            this.position.y = value;
        }
        this.position.y = -value;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}
Room.roomId = 0;

let nextRoom: string | undefined;
const roomsLib = {
    /**
     * All the existing room templates that can be used in the game.
     * It is usually prefilled by ct.IDE.
     * @catnipIgnore
     */
    templates: {} as Record<string, ExportedRoom>,
    /**
     * @catnipIgnore
     */
    Room,
    /** The current top-level room in the game. */
    current: null as (Room | null),
    /**
     * An object that contains arrays of currently present rooms.
     * These include the current room (`rooms.current`), as well as any rooms
     * appended or prepended through `rooms.append` and `rooms.prepend`.
     * @catnipList room
     */
    list: {} as Record<string, Room[]>,
    /**
     * Creates and adds a background to the current room, at the given depth.
     * @param {string} texture The name of the texture to use
     * @catnipAsset texture:texture
     * @param {number} depth The depth of the new background
     * @returns {Background} The created background
     * @catnipSaveReturn
     */
    addBg(texture: string, depth: number): Background {
        if (!roomsLib.current) {
            throw new Error('[rooms.addBg] You cannot add a background before a room is created');
        }
        const bg = new Background(texture, 0, depth);
        roomsLib.current.addChild(bg);
        return bg;
    },
    /**
     * Clears the current stage, removing all rooms with copies, tile layers, backgrounds,
     * and other potential entities.
     * @returns {void}
     */
    clear(): void {
        pixiApp.stage.children.length = 0;
        stack.length = 0;
        for (const i in templatesLib.list) {
            templatesLib.list[i] = [];
        }
        for (const i in backgrounds.list) {
            backgrounds.list[i] = [];
        }
        roomsLib.list = {};
        for (const name in roomsLib.templates) {
            roomsLib.list[name] = [];
        }
    },
    /**
     * This method safely removes a previously appended/prepended room from the stage.
     * It will trigger "On Leave" for a room and "On Destroy" event
     * for all the copies of the removed room.
     * The room will also have `this.kill` set to `true` in its event, if it comes in handy.
     * This method cannot remove `rooms.current`, the main room.
     * @param {Room} room The `room` argument must be a reference
     * to the previously created room.
     * @returns {void}
     */
    remove(room: Room): void {
        if (!(room instanceof Room)) {
            if (typeof room === 'string') {
                console.error('[rooms.remove] To remove a room, you should provide a reference to it (to an object), not its name. Provided value:', room);
                throw new Error('[rooms.remove] Invalid argument type');
            }
            throw new Error('[rooms] An attempt to remove a room that is not actually a room! Provided value:' + room);
        }
        const ind = roomsLib.list[room.name].indexOf(room);
        if (ind !== -1) {
            roomsLib.list[room.name].splice(ind, 1);
        } else {
            // eslint-disable-next-line no-console
            console.warn('[rooms] Removing a room that was not found in rooms.list. This is strange…');
        }
        room.kill = true;
        pixiApp.stage.removeChild(room);
        for (const copy of room.children) {
            if (copyTypeSymbol in copy) {
                killRecursive(copy as BasicCopy);
            }
        }
        room.onLeave();
        roomsLib.onLeave.apply(room);
    },
    /**
     * Switches to the given room. Note that this transition happens at the end
     * of the frame, so the name of a new room may be overridden.
     * @catnipAsset roomName:room
     */
    'switch'(roomName: string): void {
        if (roomsLib.templates[roomName]) {
            nextRoom = roomName;
            roomsLib.switching = true;
        } else {
            console.error('[rooms] The room "' + roomName + '" does not exist!');
        }
    },
    /**
     * Whether a room switch is scheduled.
     * @catnipIgnore
     */
    switching: false,
    /**
     * Restarts the current room.
     * @returns {void}
     */
    restart(): void {
        if (!roomsLib.current) {
            throw new Error('[rooms.restart] Cannot restart a room before it is created');
        }
        roomsLib.switch(roomsLib.current.name);
    },
    /**
     * Creates a new room and adds it to the stage, separating its draw stack
     * from existing ones.
     * This room is added to `ct.stage` after all the other rooms.
     * @param {string} roomName The name of the room to be appended
     * @param {object} [params] Any additional parameters applied to the new room.
     * Useful for passing settings and data to new widgets and prefabs.
     * @returns {Room} A newly created room
     * @catnipIgnore Defined in catnip/stdLib/rooms.ts
     */
    append(roomName: string, params?: Record<string, unknown>): Room {
        if (!(roomName in roomsLib.templates)) {
            throw new Error(`[rooms.append] append failed: the room ${roomName} does not exist!`);
        }
        const room = new Room(roomsLib.templates[roomName], false);
        if (params) {
            Object.assign(room, params);
        }
        pixiApp.stage.addChild(room);
        room.onCreate.apply(room);
        roomsLib.onCreate.apply(room);
        roomsLib.list[roomName].push(room);
        return room;
    },
    /**
     * Creates a new room and adds it to the stage, separating its draw stack
     * from existing ones.
     * This room is added to `ct.stage` before all the other rooms.
     * @param {string} roomName The name of the room to be prepended
     * @param {object} [params] Any additional parameters applied to the new room.
     * Useful for passing settings and data to new widgets and prefabs.
     * @returns {Room} A newly created room
     * @catnipIgnore Defined in catnip/stdLib/rooms.ts
     */
    prepend(roomName: string, params?: Record<string, unknown>): Room {
        if (!(roomName in roomsLib.templates)) {
            throw new Error(`[rooms] prepend failed: the room ${roomName} does not exist!`);
        }
        const room = new Room(roomsLib.templates[roomName], false);
        if (params) {
            Object.assign(room, params);
        }
        pixiApp.stage.addChildAt(room, 0);
        room.onCreate.apply(room);
        roomsLib.onCreate.apply(room);
        roomsLib.list[roomName].push(room);
        return room;
    },
    /**
     * Merges a given room into the current one. Skips room's OnCreate event.
     *
     * @param roomName The name of the room that needs to be merged
     * @catnipAsset roomName:room
     * @returns Arrays of created copies, backgrounds, tile layers,
     * added to the current room (`rooms.current`). Note: it does not get updated,
     * so beware of memory leaks if you keep a reference to this array for a long time!
     * @catnipSaveReturn
     */
    merge(roomName: string): RoomMergeResult | false {
        if (!roomsLib.current) {
            throw new Error('[rooms.merge] Cannot merge in a room before the main one is created');
        }
        if (!(roomName in roomsLib.templates)) {
            console.error(`[rooms] merge failed: the room ${roomName} does not exist!`);
            return false;
        }
        const generated: RoomMergeResult = {
            copies: [],
            tileLayers: [],
            backgrounds: []
        };
        const template = roomsLib.templates[roomName];
        const target = roomsLib.current;
        for (const t of template.bgs) {
            const bg = new Background(t.texture, 0, t.depth, t.exts);
            target.backgrounds.push(bg);
            target.addChild(bg);
            generated.backgrounds.push(bg);
        }
        for (const t of template.tiles) {
            const tl = new Tilemap(t);
            target.tileLayers.push(tl);
            target.addChild(tl);
            generated.tileLayers.push(tl);
        }
        for (const t of template.objects) {
            const c = templatesLib.copyIntoRoom(t.template, t.x, t.y, target, {
                tx: t.scale.x || 1,
                ty: t.scale.y || 1,
                tr: t.rotation || 0,
                scaleX: t.scale?.x,
                scaleY: t.scale?.y,
                rotation: t.rotation,
                alpha: t.opacity,
                ...t.customProperties
            });
            generated.copies.push(c);
        }
        return generated;
    },
    /**
     * @catnipIgnore
     */
    forceSwitch(roomName?: string): void {
        if (nextRoom) {
            roomName = nextRoom;
        }
        if (roomsLib.current) {
            roomsLib.rootRoomOnLeave.apply(roomsLib.current);
            roomsLib.current.onLeave();
            roomsLib.onLeave.apply(roomsLib.current);
            roomsLib.current = null;
        }
        roomsLib.clear();
        for (const copy of forceDestroy) {
            copy.destroy();
        }
        forceDestroy.clear();
        deadPool.length = 0;
        var template = roomsLib.templates[roomName as string];
        mainCamera.reset(
            template.width / 2,
            template.height / 2,
            template.width,
            template.height
        );
        if (template.cameraConstraints) {
            mainCamera.minX = template.cameraConstraints.x1;
            mainCamera.maxX = template.cameraConstraints.x2;
            mainCamera.minY = template.cameraConstraints.y1;
            mainCamera.maxY = template.cameraConstraints.y2;
        }
        roomsLib.current = new Room(template, true);
        pixiApp.stage.addChild(roomsLib.current);
        updateViewport();
        roomsLib.rootRoomOnCreate.apply(roomsLib.current);
        roomsLib.current.onCreate();
        roomsLib.onCreate.apply(roomsLib.current);
        roomsLib.list[roomName as string].push(roomsLib.current);
        /*!%switch%*/
        mainCamera.manageStage();
        roomsLib.switching = false;
        nextRoom = void 0;
    },
    /**
     * @catnipIgnore
     */
    onCreate(this: Room): void {
        /*!%roomoncreate%*/
        if (this.behaviors.length) {
            runBehaviors(this, 'rooms', 'thisOnCreate');
        }
    },
    /**
     * @catnipIgnore
     */
    onLeave(this: Room): void {
        /*!%roomonleave%*/
        if (this.behaviors.length) {
            runBehaviors(this, 'rooms', 'thisOnDestroy');
        }
    },
    /**
     * @catnipIgnore
     */
    beforeStep(this: Room): void {
        /*!%beforeroomstep%*/
    },
    /**
     * @catnipIgnore
     */
    afterStep(this: Room): void {
        /*!%afterroomstep%*/
        if (this.behaviors.length) {
            runBehaviors(this, 'rooms', 'thisOnStep');
        }
        for (const c of this.tickerSet) {
            c.tick();
        }
    },
    /**
     * @catnipIgnore
     */
    beforeDraw(this: Room): void {
        /*!%beforeroomdraw%*/
    },
    /**
     * @catnipIgnore
     */
    afterDraw(this: Room): void {
        /*!%afterroomdraw%*/
        if (this.behaviors.length) {
            runBehaviors(this, 'rooms', 'thisOnDraw');
        }
        for (const fn of this.bindings) {
            fn();
        }
    },
    /**
     * @catnipIgnore
     */
    rootRoomOnCreate(this: Room): void {
        /*!@rootRoomOnCreate@*/
    },
    /**
     * @catnipIgnore
     */
    rootRoomOnStep(this: Room): void {
        /*!@rootRoomOnStep@*/
    },
    /**
     * @catnipIgnore
     */
    rootRoomOnDraw(this: Room): void {
        /*!@rootRoomOnDraw@*/
    },
    /**
     * @catnipIgnore
     */
    rootRoomOnLeave(this: Room): void {
        /*!@rootRoomOnLeave@*/
    },
    /**
     * The name of the starting room, as it was set in ct.IDE.
     * @type {string}
     */
    starting: '/*!@startroom@*/'
};
export default roomsLib;
