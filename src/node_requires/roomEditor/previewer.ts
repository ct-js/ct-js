import {History} from './history';

import {Copy} from './entityClasses/Copy';
import {Tile} from './entityClasses/Tile';
import {TileLayer} from './entityClasses/TileLayer';
import {Background} from './entityClasses/Background';
import {Viewport} from './entityClasses/Viewport';

import {IRoomEditorRiotTag} from './IRoomEditorRiotTag';

const roomEditorDefaults = {
    width: 10,
    height: 10,
    autoDensity: true,
    transparent: false,
    sharedLoader: true,
    sharedTicker: false,
    resolution: devicePixelRatio,
    antialias: true,
    preserveDrawingBuffer: true
};

interface RoomSettings {
    x: number;
    y: number;
    scale: number;
}

export class RoomEditorPreview extends PIXI.Application {
    ctRoom: IRoom;
    camera = new PIXI.Container();
    room = new PIXI.Container();

    copies = new Set<Copy>();
    tiles = new Set<Tile>();
    backgrounds: Background[] = [];
    viewports = new Set<Viewport>();
    tileLayers: TileLayer[] = [];

    primaryViewport: Viewport;
    riotEditor: IRoomEditorRiotTag;
    history: History;
    updateMouseoverHint = (text: string, newRef: unknown) => {};
    mouseoverOut = (ref: unknown) => {};

    constructor(opts: unknown, room: IRoom, pixelart: boolean, roomSettings: RoomSettings) {
        super(Object.assign({}, roomEditorDefaults, opts, {
            roundPixels: pixelart,
            width: room.width,
            height: room.height
        }));

        // delete this block if you want a transparent preview
        const background = new PIXI.Graphics();
        background.beginFill(PIXI.utils.string2hex(room.backgroundColor));
        background.drawRect(0, 0, room.width, room.height);
        background.endFill();
        this.stage.addChild(background);

        this.ctRoom = room;
        this.room.sortableChildren = true;
        this.room.scale.set(roomSettings.scale);
        this.room.x = roomSettings.x;
        this.room.y = roomSettings.y;

        this.camera.x = room.width / 2;
        this.camera.y = room.height / 2;
        this.primaryViewport = {
            width: room.width,
            height: room.height
        } as Viewport;
        this.stage.addChild(this.camera);

        this.stage.addChild(this.room);
        this.deserialize(room);

        this.stage.interactive = false;
        
    }

    destroy(removeView: boolean, stageOptions: {
        children?: boolean;
        texture?: boolean;
        baseTexture?: boolean;
    }): void {
        super.destroy(removeView, stageOptions);
    }

    deserialize(room: IRoom): void {
        this.renderer.backgroundColor = PIXI.utils.string2hex(room.backgroundColor);
        for (const bg of room.backgrounds) {
            this.addBackground(bg);
        }
        for (const copy of room.copies) {
            try {
                const pixiCopy = new Copy(copy, this);
                this.room.addChild(pixiCopy);
            } catch (e) {
                console.error(e);
                window.alertify.error(e.message);
            }
        }
        for (const tileLayer of room.tiles) {
            this.addTileLayer(tileLayer);
        }
    }

    addTileLayer(tileLayer: ITileLayerTemplate | TileLayer, writeToHistory?: boolean): TileLayer {
        const pixiTileLayer = tileLayer instanceof TileLayer ?
            tileLayer :
            new TileLayer(tileLayer, this);
        this.room.addChild(pixiTileLayer);
        this.tileLayers.push(pixiTileLayer);
        this.tileLayers.sort((a, b) => b.zIndex - a.zIndex);
        if (pixiTileLayer.children) {
            for (const tile of pixiTileLayer.children) {
                this.tiles.add(tile);
            }
        }
        if (writeToHistory) {
            this.history.pushChange({
                type: 'tileLayerCreation',
                created: pixiTileLayer
            });
        }
        return pixiTileLayer;
    }

    addBackground(bgTemplate: IRoomBackground): Background {
        const bg = new Background(bgTemplate, this);
        this.backgrounds.push(bg);
        this.room.addChild(bg);
        return bg;
    }
}
