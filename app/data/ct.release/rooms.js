/**
 * @typedef IRoomMergeResult
 *
 * @property {Array<Copy>} copies
 * @property {Array<Tileset>} tileLayers
 * @property {Array<Background>} backgrounds
 */

class Room extends PIXI.Container {
    constructor(template) {
        super();
        this.x = this.y = 0;
        this.uid = 0;
        this.tileLayers = [];
        this.backgrounds = [];
        if (!ct.room) {
            ct.room = ct.rooms.current = this;
        }
        if (template) {
            this.onCreate = template.onCreate;
            this.onStep = template.onStep;
            this.onDraw = template.onDraw;
            this.onLeave = template.onLeave;
            this.template = template;
            this.name = template.name;
            for (let i = 0, li = template.bgs.length; i < li; i++) {
                const bg = new ct.types.Background(template.bgs[i].texture, null, template.bgs[i].depth, template.bgs[i].extends);
                this.backgrounds.push(bg);
                ct.stack.push(bg);
                this.addChild(bg);
            }
            for (let i = 0, li = template.tiles.length; i < li; i++) {
                const tl = ct.rooms.addTileLayer(template.tiles[i]);
                this.tileLayers.push(tl);
                this.addChild(tl);
            }
            for (let i = 0, li = template.objects.length; i < li; i++) {
                ct.types.make(template.objects[i].type, template.objects[i].x, template.objects[i].y, {
                    tx: template.objects[i].tx,
                    ty: template.objects[i].ty
                }, this);
            }
        }
        return this;
    }
    get x () {
        return -this.position.x;
    }
    set x (value) {
        this.position.x = -value;
        return value;
    }
    get y () {
        return -this.position.y;
    }
    set y (value) {
        this.position.y = -value;
        return value;
    }
}
(function () {
    /* global deadPool */
    var nextRoom;
    /**
     * @namespace
     */
    ct.rooms = {
        templates: {},
        /**
         * Creates and adds a background to the current room, at the given depth.
         * @param {string} texture The name of the texture to use
         * @param {number} depth The depth of the new background
         * @returns {Background} The created background
         */
        addBg(texture, depth) {
            const bg = new ct.types.Background(texture, null, depth);
            ct.room.addChild(bg);
            return bg;
        },
        /**
         * Adds a new empty tile layer to the room, at the given depth
         * @param {number} layer The depth of the layer
         * @returns {Tileset} The created tile layer
         */
        addTileLayer(layer) {
            return new ct.types.Tileset(layer);
        },
        /**
         * Clears the current stage, removing all rooms with copies, tile layers, backgrounds,
         * and other potential entities.
         * @returns {void}
         */
        clear() {
            ct.stage.children = [];
            ct.stack = [];
            for (var i in ct.types.list) {
                ct.types.list[i] = [];
            }
        },
        /*
         * Switches to the given room. Note that this transition happens at the end
         * of the frame, so the name of a new room may be overridden.
         */
        'switch'(roomName) {
            if (ct.rooms.templates[roomName]) {
                nextRoom = roomName;
                ct.rooms.switching = true;
            } else {
                console.error('[ct.rooms] The room "' + roomName + '" does not exist!');
            }
        },
        switching: false,
        /**
         * Creates a new room and adds it to the stage, separating its draw stack from existing ones.
         * This room is added to `ct.stage` after all the other rooms.
         * @param {string} roomName The name of the room to be appended
         * @returns {Room} A newly created room
         */
        append(roomName) {
            if (!(roomName in ct.rooms.templates)) {
                console.error(`[ct.rooms] append failed: the room ${roomName} does not exist!`);
                return false;
            }
            const room = new Room(ct.rooms.templates[roomName]);
            ct.stage.addChild(room);
            room.onCreate();
            ct.rooms.onCreate.apply(room);
            return room;
        },
        /**
         * Creates a new room and adds it to the stage, separating its draw stack from existing ones.
         * This room is added to `ct.stage` before all the other rooms.
         * @param {string} roomName The name of the room to be prepended
         * @returns {Room} A newly created room
         */
        prepend(roomName) {
            if (!(roomName in ct.rooms.templates)) {
                console.error(`[ct.rooms] prepend failed: the room ${roomName} does not exist!`);
                return false;
            }
            const room = new Room(ct.rooms.templates[roomName]);
            ct.stage.addChildAt(room, 0);
            room.onCreate();
            ct.rooms.onCreate.apply(room);
            return room;
        },
        /**
         * Merges a given room into the current one. Skips room's OnCreate event.
         *
         * @param {string} roomName The name of the room that needs to be merged
         * @returns {IRoomMergeResult} Arrays of created copies, backgrounds, tile layers,
         * added to the current room (`ct.room`). Note: it does not get updated, so beware of memory leaks
         * if you keep a reference to this array for a long time!
         */
        merge(roomName) {
            if (!(roomName in ct.rooms.templates)) {
                console.error(`[ct.rooms] merge failed: the room ${roomName} does not exist!`);
                return false;
            }
            const generated = {
                copies: [],
                tileLayers: [],
                backgrounds: []
            };
            const template = ct.rooms.templates[roomName];
            const target = ct.room;
            for (const t of template.bgs) {
                const bg = new ct.types.Background(t.texture, null, t.depth, t.extends);
                target.backgrounds.push(bg);
                ct.stack.push(bg);
                target.addChild(bg);
                generated.backgrounds.push(bg);
            }
            for (const t of template.tiles) {
                const tl = ct.rooms.addTileLayer(t);
                target.tileLayers.push(tl);
                target.addChild(tl);
                generated.tileLayers.push(tl);
            }
            for (const t of template.objects) {
                const c = ct.types.make(t.type, t.x, t.y, {
                    tx: t.tx || 1,
                    ty: t.ty || 1
                }, target);
                generated.copies.push(c);
            }
            return generated;
        },
        forceSwitch(roomName) {
            if (nextRoom) {
                roomName = nextRoom;
            }
            if (ct.room) {
                ct.room.onLeave();
                ct.rooms.onLeave.apply(ct.room);
                ct.room = void 0;
            }
            ct.rooms.clear();
            deadPool.length = 0;
            var template = ct.rooms.templates[roomName];
            ct.roomWidth = template.width;
            ct.roomHeight = template.height;
            ct.camera = new Camera(0, 0, ct.roomWidth, ct.roomHeight);
            ct.camera.x = ct.roomWidth / 2;
            ct.camera.y = ct.roomHeight / 2;
            ct.pixiApp.renderer.resize(template.width, template.height);
            ct.rooms.current = ct.room = new Room(template);
            ct.stage.addChild(ct.room);
            ct.room.onCreate();
            ct.rooms.onCreate.apply(ct.room);
            /*%switch%*/
            ct.rooms.switching = false;
            nextRoom = void 0;
        },
        onCreate() {
            /*%roomoncreate%*/
        },
        onLeave() {
            /*%roomonleave%*/
        },
        /**
         * The name of the starting room, as it was set in ct.IDE.
         * @type {string}
         */
        starting: '@startroom@'
    };
})();
/**
 * The current room
 * @type {Room}
 */
ct.room = null;

ct.rooms.beforeStep = function () {
    /*%beforeroomstep%*/
};
ct.rooms.afterStep = function () {
    /*%afterroomstep%*/
};
ct.rooms.beforeDraw = function () {
    /*%beforeroomdraw%*/
};
ct.rooms.afterDraw = function () {
    /*%afterroomdraw%*/
};

/*@rooms@*/
