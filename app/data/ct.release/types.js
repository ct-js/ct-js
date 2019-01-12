(function (ct) {
    const graphAccessor = Symbol('graph');
    class Copy extends PIXI.extras.AnimatedSprite {
        constructor(type, x, y) {
            var t;
            if (type) {
                t = ct.types.templates[type];
                if (t.graph && t.graph !== '-1') {
                    const textures = ct.res.getTexture(t.graph);
                    super(textures);
                    this[graphAccessor] = t.graph;
                    this.anchor.x = textures[0].defaultAnchor.x;
                    this.anchor.y = textures[0].defaultAnchor.y;
                } else {
                    super([PIXI.Texture.EMPTY]);
                }
                this.type = type;
                if (t.extends) {
                    ct.u.ext(this, t.extends);
                }
            } else {
                super();
            }
            this.position.set(x || 0, y || 0);
            this.xprev = this.xstart = this.x;
            this.yprev = this.ystart = this.y;
            this.speed = this.direction = this.gravity = this.hspeed = this.vspeed = 0;
            this.gravityDir = 270;
            this.depth = 0;
            this.uid = ++ct.room.uid;
            if (type) {
                ct.u.ext(this, {
                    type,
                    depth: t.depth,
                    onStep: t.onStep,
                    onDraw: t.onDraw,
                    onCreate: t.onCreate,
                    onDestroy: t.onDestroy,
                    shape: t.graph ? ct.res.registry[t.graph].shape : {}
                });
                if (ct.types.list[type]) {
                    ct.types.list[type].push(this);
                } else {
                    ct.types.list[type] = [this];
                }
                ct.types.templates[type].onCreate.apply(this);
            }
            return this;
        }

        set grav(value) {
            this.gravity = value;
            return value;
        }
        get grav() {
            return this.gravity;
        }
        set gravdir(value) {
            this.gravityDir = value;
            return value;
        }
        get gravdir() {
            return this.gravityDir;
        }
        set dir(value) {
            this.direction = value;
            return value;
        }
        get dir() {
            return this.direction;
        }
        set spd(value) {
            this.speed = value;
            return value;
        }
        get spd() {
            return this.speed;
        }

        set graph(value) {
            this.textures = ct.res.getTexture(value);
            this[graphAccessor] = value;
            return value;
        }
        get speed() {
            return Math.hypot(this.hspeed, this.vspeed);
        }
        set speed(value) {
            if (this.speed === 0) {
                this.hspeed = value;
                return;
            } 
            var multiplier = value / this.speed;
            this.hspeed *= multiplier;
            this.vspeed *= multiplier;
        }
        get direction() {
            return (Math.atan2(this.vspeed, this.hspeed) * -180 / Math.PI + 360) % 360;
        }
        set direction(value) {
            var speed = this.speed;
            this.hspeed = speed * Math.cos(value*Math.PI/-180);
            this.vspeed = speed * Math.sin(value*Math.PI/-180);
            return value;
        }
        get rotation() {
            return this.transform.rotation / Math.PI * -180;
        }
        set rotation(value) {
            this.transform.rotation = value * Math.PI / -180;
            return value;
        }
        get graph() {
            return this[graphAccessor];
        }
        move() {
            // performs movement step with Copy `o`
            if (this.gravity) {
                this.hspeed += this.gravity * ct.delta * Math.cos(this.gravityDir*Math.PI/-180);
                this.vspeed += this.gravity * ct.delta * Math.sin(this.gravityDir*Math.PI/-180);
            }
            this.x += this.hspeed * ct.delta;
            this.y += this.vspeed * ct.delta;
        }
        addSpeed(spd, dir) {
            this.hspeed += spd * Math.cos(dir*Math.PI/-180);
            this.vspeed += spd * Math.sin(dir*Math.PI/-180);
        }
        static draw() {
            console.warn('this.draw() call is not used in ct.js 1.0 and above, as all objects are now rendered by default. Please use this.visible to hide objects.');
        }
    }
    class Background extends PIXI.extras.TilingSprite {
        constructor(bgName, frame, depth, exts) {
            super(ct.res.getTexture(bgName, frame || 0), ct.width, ct.height);
            ct.types.list.BACKGROUND.push(this);
            this.depth = depth;
            this.shiftX = this.shiftY = this.movementX = this.movementY = 0;
            this.parallaxX = this.parallaxY = 1;
            if (exts) {
                ct.u.extend(this, exts);
            }
            if (this.scaleX) {
                this.tileScale.x = Number(this.scaleX);
            }
            if (this.scaleY) {
                this.tileScale.y = Number(this.scaleY);
            }
        }
        onStep() {
            this.shiftX += ct.delta * this.movementX;
            this.shiftY += ct.delta * this.movementY;
        }
        onDraw() {
            if (this.repeat !== 'repeat-x' && this.repeat !== 'no-repeat') {
                this.y = ct.room.y;
                this.tilePosition.y = -this.y*this.parallaxY + this.shiftY;
            } else {
                this.y = this.shiftY;
            }
            if (this.repeat !== 'repeat-y' && this.repeat !== 'no-repeat') {
                this.x = ct.room.x;
                this.tilePosition.x = -this.x*this.parallaxX + this.shiftX;
            } else {
                this.x = this.shiftX;
            }
        }
        static onCreate() {
            void 0;
        }
        static onDestroy() {
            void 0;
        }
    }
    class Tileset extends PIXI.Container {
        constructor(data) {
            super();
            this.depth = data.depth;
            this.tiles = data.tiles;
            ct.types.list.TILELAYER.push(this);
            for (let i = 0, l = data.tiles.length; i < l; i++) {
                const textures = ct.res.getTexture(data.tiles[i].graph);
                const sprite = new PIXI.Sprite(textures[data.tiles[i].frame]);
                this.addChild(sprite);
                sprite.x = data.tiles[i].x;
                sprite.y = data.tiles[i].y;
            }
            const bounds = this.getLocalBounds();
            const cols = Math.ceil(bounds.width / 1024),
                  rows = Math.ceil(bounds.height / 1024);
            if (cols < 2 && rows < 2) {
                if (this.width > 0 && this.height > 0) {
                    this.cacheAsBitmap = true;
                }
                return this;
            }
            /*const mask = new PIXI.Graphics();
            mask.lineStyle(0);
            mask.beginFill(0xffffff);
            mask.drawRect(0, 0, 1024, 1024);
            mask.endFill();*/
            this.cells = [];
            for (let y = 0; y < rows; y++) {
                for (let x = 0; x < cols; x++) {
                    const cell = new PIXI.Container();
                    //cell.x = x * 1024 + bounds.x;
                    //cell.y = y * 1024 + bounds.y;
                    this.cells.push(cell);
                }
            }
            for (let i = 0, l = data.tiles.length; i < l; i++) {
                const tile = this.children[0],
                      x = Math.floor((tile.x - bounds.x) / 1024),
                      y = Math.floor((tile.y - bounds.y) / 1024);
                this.cells[y * cols + x].addChild(tile);
                /*if (tile.x - x * 1024 + tile.width > 1024) {
                    this.cells[y*cols + x + 1].addChild(tile);
                    if (tile.y - y * 1024 + tile.height > 1024) {
                        this.cells[(y+1)*cols + x + 1].addChild(tile);
                    }
                }
                if (tile.y - y * 1024 + tile.height > 1024) {
                    this.cells[(y+1)*cols + x].addChild(tile);
                }*/
            }
            this.removeChildren();
            for (let i = 0, l = this.cells.length; i < l; i++) {
                if (this.cells[i].children.length === 0) {
                    this.cells.splice(i, 1);
                    i--; l--;
                    continue;
                }
                //this.cells[i].mask = mask;
                this.addChild(this.cells[i]);
                this.cells[i].cacheAsBitmap = true;
            }
        }
    }

    ct.types = {
        Copy,
        Background,
        Tileset,
        list: {
            BACKGROUND: [],
            TILELAYER: []
        },
        templates: { },
        make(type, x, y, container) {
            // An advanced constructor. Returns a Copy
            const obj = new Copy(type, x, y);
            if (container) {
                container.addChild(obj);
            } else {
                ct.room.addChild(obj);
            }
            ct.stack.push(obj);
            (function () {
                /*%oncreate%*/
            }).apply(obj);
            return obj;
        },
        move(o) {
            o.move();
        },
        addSpeed(o, spd, dir) {
            o.addSpeed(spd, dir);
        },
        each(func) {
            for (const i in ct.stack) {
                func.apply(ct.stack[i], this);
            }
        },
        'with'(obj, func) {
            func.apply(obj, this);
        }
    };
    ct.types.copy = ct.types.make;
    ct.types.addSpd = ct.types.addSpeed;

    /*@types@*/
    /*%types%*/

    ct.types.beforeStep = function () {
        /*%beforestep%*/
    };
    ct.types.afterStep = function () {
        /*%afterstep%*/
    };
    ct.types.beforeDraw = function () {
        /*%beforedraw%*/
    };
    ct.types.afterDraw = function () {
        /*%afterdraw%*/
    };
    ct.types.onDestroy = function () {
        /*%ondestroy%*/
    };
})(ct);
