room-editor.panel.view
    .toolbar.tall(style="width: {sidebarWidth}px")
        copy-custom-properties-modal(if="{showCopyPropertiesModal}" closestcopy="{closestCopy}" showme="{toggleCopyProperties}")
        .settings.nogrow.noshrink
            b {voc.name}
            br
            input.wide(type="text" value="{room.name}" onchange="{wire('this.room.name')}")
            .anErrorNotice(if="{nameTaken}" ref="errorNotice") {vocGlob.nametaken}
            button.wide(onclick="{openRoomEvents}")
                svg.feather(if="{room.oncreate || room.onstep || room.ondestroy || room.ondraw}")
                    use(xlink:href="data/icons.svg#check")
                span {voc.events}
        .palette
            .tabwrap
                ul.tabs.nav.noshrink.nogrow
                    li(onclick="{changeTab('roomcopies')}" title="{voc.copies}" class="{active: tab === 'roomcopies'}")
                        svg.feather
                            use(xlink:href="data/icons.svg#type")
                        span(if="{sidebarWidth > 500}") {voc.copies}
                    li(onclick="{changeTab('roombackgrounds')}" title="{voc.backgrounds}" class="{active: tab === 'roombackgrounds'}")
                        svg.feather
                            use(xlink:href="data/icons.svg#image")
                        span(if="{sidebarWidth > 500}") {voc.backgrounds}
                    li(onclick="{changeTab('roomtiles')}" title="{voc.tiles}" class="{active: tab === 'roomtiles'}")
                        svg.feather
                            use(xlink:href="data/icons.svg#texture")
                        span(if="{sidebarWidth > 500}") {voc.tiles}
                    li(onclick="{changeTab('properties')}" title="{voc.properties}" class="{active: tab === 'properties'}")
                        svg.feather
                            use(xlink:href="data/icons.svg#settings")
                        span(if="{sidebarWidth > 500}") {voc.properties}
                .relative
                    room-type-picker(show="{tab === 'roomcopies'}" current="{currentType}")
                    room-backgrounds-editor(show="{tab === 'roombackgrounds'}" room="{room}")
                    room-tile-editor(show="{tab === 'roomtiles'}" room="{room}")
                    .pad.panel(show="{tab === 'properties'}")
                        fieldset
                            .fifty.npt.npb.npl
                                b {voc.width}
                                br
                                input.wide(type="number" value="{room.width}" onchange="{wireAndRedraw('this.room.width')}")
                            .fifty.npt.npb.npr
                                b {voc.height}
                                br
                                input.wide(type="number" value="{room.height}" onchange="{wireAndRedraw('this.room.height')}")
                            .clear
                        fieldset
                            label.checkbox
                                input(type="checkbox" checked="{room.restrictCamera}" onchange="{wireAndRedraw('this.room.restrictCamera')}")
                                span {voc.restrictCamera}
                            .aPoint2DInput.compact.wide(if="{room.restrictCamera}")
                                label
                                    span {voc.minimumX}:
                                    |
                                    input.compact(
                                        step="{room.gridX}" type="number"
                                        oninput="{wireAndRedraw('this.room.restrictMinX')}"
                                        value="{room.restrictMinX === void 0 ? 0 : room.restrictMinX}"
                                    )
                                .spacer
                                label
                                    span.nogrow {voc.minimumY}:
                                    |
                                    input.compact(
                                        step="{room.gridY}" type="number"
                                        oninput="{wireAndRedraw('this.room.restrictMinY')}"
                                        value="{room.restrictMinY === void 0 ? 0 : room.restrictMinY}"
                                    )
                            .aPoint2DInput.compact.wide(if="{room.restrictCamera}")
                                label
                                    span {voc.maximumX}:
                                    |
                                    input.compact(
                                        step="{room.gridX}" type="number"
                                        oninput="{wireAndRedraw('this.room.restrictMaxX')}"
                                        value="{room.restrictMaxX === void 0 ? room.width : room.restrictMaxX}"
                                    )
                                .spacer
                                label
                                    span.nogrow {voc.maximumY}:
                                    |
                                    input.compact(
                                        step="{room.gridY}" type="number"
                                        oninput="{wireAndRedraw('this.room.restrictMaxY')}"
                                        value="{room.restrictMaxY === void 0 ? room.height : room.restrictMaxY}"
                                    )

                        fieldset
                            b {voc.backgroundColor}
                            br
                            color-input.wide(onchange="{updateRoomBackground}" color="{room.backgroundColor || '#000000'}")

                        fieldset
                            extensions-editor(entity="{room.extends}" type="room" wide="aye" compact="sure")

                        fieldset
                            label.block.checkbox
                                input(type="checkbox" checked="{room.extends.isUi}" onchange="{wire('this.room.extends.isUi')}")
                                b {voc.isUi}

        .done.nogrow
            button.wide#roomviewdone(onclick="{roomSave}")
                svg.feather
                    use(xlink:href="data/icons.svg#check")
                span {voc.done}
    .aResizer.vertical(ref="gutter" onmousedown="{gutterMouseDown}")
    .editor(ref="canvaswrap")
        canvas(
            ref="canvas"
            onclick="{onCanvasClick}"
            onmousedown="{onCanvasPress}"
            onmousemove="{onCanvasMove}"
            onmouseup="{onCanvasMouseUp}"
            onmouseout="{refreshRoomCanvas}"
            onmousewheel="{onCanvasWheel}"
            oncontextmenu="{onCanvasContextMenu}"
        )
        .shift
            button.inline.square(title="{voc.shift}" onclick="{roomShift}")
                svg.feather
                    use(xlink:href="data/icons.svg#move")
            button.inline.square(
                title="{voc.sortHorizontally}"
                onclick="{sortHorizontally}"
                if="{tab === 'roomcopies' || tab === 'roomtiles'}"
            )
                svg.feather
                    use(xlink:href="data/icons.svg#sort-horizontal")
            button.inline.square(
                title="{voc.sortVertically}"
                onclick="{sortVertically}"
                if="{tab === 'roomcopies' || tab === 'roomtiles'}"
            )
                svg.feather
                    use(xlink:href="data/icons.svg#sort-vertical")
            span(if="{window.innerWidth - sidebarWidth > 940}") {voc.hotkeysNotice}
        .zoom.flexrow
            b(if="{window.innerWidth - sidebarWidth > 980}") {vocGlob.zoom}:
            .spacer
            b {Math.round(zoomFactor * 100)}%
            .spacer
            zoom-slider(onchanged="{setZoom}" ref="zoomslider" value="{zoomFactor}")
        .grid
            button#roomgrid(onclick="{roomToggleGrid}" class="{active: room.gridX > 0}")
                span {voc[room.gridX > 0? 'gridoff' : 'grid']}
        .center
            button#roomcenter(onclick="{roomToCenter}") {voc.tocenter}
            span.aMouseCoord(show="{window.innerWidth - sidebarWidth > 470}" ref="mousecoords") ({mouseX}:{mouseY})
        room-copy-properties(
            if="{this.selectedCopies && this.selectedCopies.length === 1}"
            copy="{this.selectedCopies[0]}"
            onchange="{refreshRoomCanvas}" oninput="{refreshRoomCanvas}"
        )
    room-events-editor(if="{editingCode}" room="{room}")
    context-menu(menu="{roomCanvasCopiesMenu}" ref="roomCanvasCopiesMenu")
    context-menu(menu="{roomCanvasMenu}" ref="roomCanvasMenu")
    context-menu(menu="{roomCanvasTileMenu}" ref="roomCanvasTileMenu")
    context-menu(menu="{roomCanvasTilesMenu}" ref="roomCanvasTilesMenu")
    script.
        const minSizeW = 250;
        const getMaxSizeW = () => window.innerWidth - 300;
        this.sidebarWidth = Math.max(
            minSizeW,
            Math.min(getMaxSizeW(), localStorage.roomSidebarWidth || 300)
        );

        this.gutterMouseDown = () => {
            this.draggingGutter = true;
        };
        const gutterMove = e => {
            if (!this.draggingGutter) {
                return;
            }
            this.sidebarWidth = Math.max(minSizeW, Math.min(getMaxSizeW(), e.clientX));
            localStorage.roomSidebarWidth = this.sidebarWidth;
            this.update();
            var {canvas} = this.refs,
                sizes = this.refs.canvaswrap.getBoundingClientRect();
            if (canvas.width !== sizes.width || canvas.height !== sizes.height) {
                canvas.width = sizes.width;
                canvas.height = sizes.height;
            }
            this.refreshRoomCanvas();
        };
        const gutterUp = () => {
            if (this.draggingGutter) {
                this.draggingGutter = false;
                // updateCanvasSize();
                // document.body.removeChild(catcher);
            }
        };
        document.addEventListener('mousemove', gutterMove);
        document.addEventListener('mouseup', gutterUp);
        this.on('unmount', () => {
            document.removeEventListener('mousemove', gutterMove);
            document.removeEventListener('mouseup', gutterUp);
        });

        this.editingCode = false;
        this.forbidDrawing = false;
        const fs = require('fs-extra');
        const glob = require('./data/node_requires/glob');
        this.namespace = 'roomview';
        this.mixin(window.riotVoc);
        this.mixin(window.riotWired);
        this.mixin(window.roomCopyTools);
        this.mixin(window.roomTileTools);
        this.wireAndRedraw = way => e => {
            this.wire(way)(e);
            this.refreshRoomCanvas();
        };

        this.room = this.opts.room;
        if (!this.room.extends) {
            this.room.extends = {};
        }

        this.mouseX = this.mouseY = 0;
        this.roomx = this.room.width / 2;
        this.roomy = this.room.height / 2;
        this.zoomFactor = 1;
        this.room.gridX = this.room.gridX || this.room.grid || 64;
        this.room.gridY = this.room.gridY || this.room.grid || 64;
        this.dragging = false;
        this.tab = 'roomcopies';

        this.toggleCopyProperties = value => {
            this.showCopyPropertiesModal = value;
            this.update();
            this.refreshRoomCanvas();
        };

        this.updateRoomBackground = (e, color) => {
            this.room.backgroundColor = color;
            this.refreshRoomCanvas();
        };

        var updateCanvasSize = () => {
            // Firstly, check that we don't need to reflow the layout due to window shrinking
            const oldSidebarWidth = this.sidebarWidth;
            this.sidebarWidth = Math.max(minSizeW, Math.min(getMaxSizeW(), this.sidebarWidth));
            if (oldSidebarWidth !== this.sidebarWidth) {
                this.update();
            }
            var {canvas} = this.refs,
                sizes = this.refs.canvaswrap.getBoundingClientRect();
            if (canvas.width !== sizes.width || canvas.height !== sizes.height) {
                canvas.width = sizes.width;
                canvas.height = sizes.height;
            }
            setTimeout(this.refreshRoomCanvas, 10);
        };
        this.on('update', () => {
            if (global.currentProject.rooms.find(room =>
                this.room.name === room.name && this.room !== room)) {
                this.nameTaken = true;
            } else {
                this.nameTaken = false;
            }
        });
        this.on('mount', () => {
            this.room = this.opts.room;
            this.refs.canvas.x = this.refs.canvas.getContext('2d');
            this.gridCanvas = document.createElement('canvas');
            this.gridCanvas.x = this.gridCanvas.getContext('2d');
            this.redrawGrid();
            window.addEventListener('resize', updateCanvasSize);
            updateCanvasSize();
        });
        this.on('unmount', () => {
            window.removeEventListener('resize', updateCanvasSize);
        });

        this.openRoomEvents = () => {
            this.editingCode = true;
        };

        // Навигация по комнате, настройки вида
        this.roomToggleZoom = zoomFactor => () => {
            this.zoomFactor = zoomFactor;
            this.redrawGrid();
            this.refreshRoomCanvas();
        };
        this.roomToCenter = () => {
            this.roomx = this.room.width / 2;
            this.roomy = this.room.height / 2;
            this.refreshRoomCanvas();
        };
        this.redrawGrid = () => {
            this.gridCanvas.width = this.room.gridX;
            this.gridCanvas.height = this.room.gridY;
            this.gridCanvas.x.clearRect(0, 0, this.room.gridX, this.room.gridY);
            this.gridCanvas.x.globalAlpha = 0.3;
            this.gridCanvas.x.strokeStyle = localStorage.UItheme === 'Night' ? '#44dbb5' : '#446adb';
            this.gridCanvas.x.lineWidth = 1 / this.zoomFactor;
            this.gridCanvas.x.strokeRect(
                0.5 / this.zoomFactor, 0.5 / this.zoomFactor,
                this.room.gridX, this.room.gridY
            );
        };
        this.roomToggleGrid = () => {
            if (this.room.gridX === 0) {
                window.alertify
                .confirm(this.voc.gridsize + '<br/><input type="number" value="64" style="width: 6rem;" min=2 id="theGridSizeX"> x <input type="number" value="64" style="width: 6rem;" min=2 id="theGridSizeY">')
                .then(e => {
                    if (e.buttonClicked === 'ok') {
                        this.room.gridX = Number(document.getElementById('theGridSizeX').value);
                        this.room.gridY = Number(document.getElementById('theGridSizeY').value);
                    }
                    this.redrawGrid();
                    this.refreshRoomCanvas();
                    this.update();
                });
            } else {
                this.refreshRoomCanvas();
                this.room.gridX = 0;
                this.room.gridY = 0;
            }
        };

        // Работа с копиями
        this.tab = 'roomcopies';
        this.changeTab = tab => () => {
            this.tab = tab;
            this.selectedCopies = this.selectedTiles = false;
            if (tab === 'roombackgrounds' || tab === 'properties') {
                this.roomUnpickType();
            }
            if (tab !== 'roomcopies') {
                this.toggleCopyProperties(false);
            }
        };
        this.roomUnpickType = () => {
            this.currentType = -1;
        };

        /** Преобразовать x на канвасе в x на комнате */
        this.xToRoom = x => (x - Math.floor(this.refs.canvas.width / 2)) / this.zoomFactor + this.roomx;
        /** Преобразовать y на канвасе в y на комнате */
        this.yToRoom = y => (y - Math.floor(this.refs.canvas.height / 2)) / this.zoomFactor + this.roomy;
        /** Преобразовать x в комнате в x на канвасе */
        this.xToCanvas = x => (x - this.roomx) * this.zoomFactor + Math.floor(this.refs.canvas.width / 2);
        /** Преобразовать y в комнате в y на канвасе */
        this.yToCanvas = y => (y - this.roomy) * this.zoomFactor + Math.floor(this.refs.canvas.height / 2);

        this.onCanvasClick = e => {
            if (this.tab === 'roomcopies') {
                this.onCanvasClickCopies(e);
            } else if (this.tab === 'roomtiles') {
                this.onCanvasClickTiles(e);
            }
        };
        /** При нажатии на канвас, если не выбрана копия, то начинаем перемещение */
        this.onCanvasPress = e => {
            this.mouseDown = true;
            this.startx = e.offsetX;
            this.starty = e.offsetY;

            if (this.tab === 'roomcopies' && this.onCanvasPressCopies(e)) {
                return;
            }
            if ((this.currentType === -1 && !e.shiftKey && this.tab !== 'roomtiles' && e.button === 0 && !e.ctrlKey) ||
                e.button === 1) {
                this.dragging = true;
            }
        };
        /** и безусловно прекращаем перемещение при отпускании мыши */
        this.onCanvasMouseUp = e => {
            this.mouseDown = false;
            this.lastCopyX = null;
            this.lastCopyY = null;
            this.lastTileX = null;
            this.lastTileY = null;
            if (this.dragging) {
                this.dragging = false;
                this.roomx = Math.round(this.roomx);
                this.roomy = Math.round(this.roomy);
                this.refreshRoomCanvas();
            } else if (this.tab === 'roomtiles') {
                this.onCanvasMouseUpTiles(e);
            } else if (this.tab === 'roomcopies') {
                this.onCanvasMouseUpCopies(e);
            }
            setTimeout(() => {
                this.movingStuff = false;
            }, 0);
        };
        this.drawDeleteCircle = e => {
            // Рисовка кружка для удаления копий
            var maxdist = Math.max(this.room.gridX, this.room.gridY) || 32;
            this.refreshRoomCanvas(e);
            var cx = this.refs.canvas.x;
            cx.fillStyle = '#F00';
            cx.strokeStyle = '#000';
            cx.globalAlpha = 0.5;
            cx.beginPath();
            cx.arc(this.xToRoom(e.offsetX), this.yToRoom(e.offsetY), maxdist, 0, 2 * Math.PI);
            cx.fill();
            cx.stroke();
        };

        /**
         * Updating mouse coordinates display at the bottom-left corner
         */
        this.updateMouseCoords = function updateMouseCoords(e) {
            var dx = Math.floor(this.xToRoom(e.offsetX)),
                dy = Math.floor(this.yToRoom(e.offsetY));
            if (this.room.gridX === 0 || e.altKey) {
                this.mouseX = dx;
                this.mouseY = dy;
            } else {
                this.mouseX = Math.round(dx / this.room.gridX) * this.room.gridX;
                this.mouseY = Math.round(dy / this.room.gridY) * this.room.gridY;
            }
            this.refs.mousecoords.innerHTML = `(${this.mouseX}:${this.mouseY})`;
        };

        /** Start moving or show a placement preview **/
        this.onCanvasMove = e => {
            e.preventUpdate = true;
            if (this.dragging && !this.movingStuff) {
                // Drag the viewport
                this.roomx -= e.movementX / this.zoomFactor;
                this.roomy -= e.movementY / this.zoomFactor;
                this.refreshRoomCanvas(e);
            } else if ( // Make more tiles or copies if Shift key is down
                e.shiftKey && this.mouseDown &&
                (
                    (this.tab === 'roomcopies' && this.currentType !== -1) ||
                    this.tab === 'roomtiles'
                )
            ) {
                this.onCanvasClick(e);
            } else if (this.tab === 'roomcopies') {
                this.onCanvasMoveCopies(e);
            } else if (this.tab === 'roomtiles') {
                this.onCanvasMoveTiles(e);
            }
            this.updateMouseCoords(e);
        };

        /** Change zoom on mouse wheel */
        this.onCanvasWheel = e => {
            if (e.wheelDelta > 0) {
                this.refs.zoomslider.zoomIn();
            } else {
                this.refs.zoomslider.zoomOut();
            }
        };
        this.setZoom = zoom => {
            this.zoomFactor = zoom;
            this.update();
            this.redrawGrid();
            this.refreshRoomCanvas();
        };

        this.onCanvasContextMenu = e => {
            this.dragging = false;
            this.mouseDown = false;
            if (this.tab === 'roomcopies') {
                if (this.selectedCopies && this.selectedCopies.length) {
                    this.onCanvasContextMenuMultipleCopies(e);
                } else {
                    this.onCanvasContextMenuCopies(e);
                }
            } else if (this.tab === 'roomtiles') {
                if (this.selectedTiles && this.selectedTiles.length) {
                    this.onCanvasContextMenuMultipleTiles(e);
                } else {
                    this.onCanvasContextMenuTiles(e);
                }
            }
            e.preventDefault();
            return true;
        };

        // Shifts all the copies in a room at once.
        this.roomShift = () => {
            window.alertify.confirm(`
                ${window.languageJSON.roomview.shifttext}
                <label class="block">X:
                    <input id="roomshiftx" type="number" value="${this.room.gridX}" />
                </label>
                <label class="block">Y:
                    <input id="roomshifty" type="number" value="${this.room.gridY}" />
                </label>
            `)
            .then(e => {
                if (e.buttonClicked === 'ok') {
                    var dx = Number(document.getElementById('roomshiftx').value) || 0,
                        dy = Number(document.getElementById('roomshifty').value) || 0;
                    for (const copy of this.room.copies) {
                        copy.x += dx;
                        copy.y += dy;
                    }
                    for (const tileLayer of this.room.tiles) {
                        for (const tile of tileLayer.tiles) {
                            tile.x += dx;
                            tile.y += dy;
                        }
                    }
                    this.refreshRoomCanvas();
                }
            });
        };

        /** Saves a room (in fact, just marks a project as an unsaved, and closes the room editor) */
        this.roomSave = () => {
            if (this.nameTaken) {
                // animate the error notice
                require('./data/node_requires/jellify')(this.refs.errorNotice);
                if (localStorage.disableSounds !== 'on') {
                    window.soundbox.play('Failure');
                }
                return false;
            }
            this.room.lastmod = Number(new Date());
            this.roomGenSplash()
            .then(() => {
                glob.modified = true;
                this.parent.editing = false;
                this.parent.update();
            })
            .catch(err => {
                console.error(err);
                glob.modified = true;
                this.parent.editing = false;
                this.parent.update();
            });
            return true;
        };

        this.sortHorizontally = () => {
            if (this.tab === 'roomcopies') {
                this.room.copies.sort((a, b) => a.x - b.x);
            } else {
                // tiles
                this.currentTileLayer.tiles.sort((a, b) => a.x - b.x);
            }
            this.resortRoom();
            this.refreshRoomCanvas();
        };
        this.sortVertically = () => {
            if (this.tab === 'roomcopies') {
                this.room.copies.sort((a, b) => a.y - b.y);
            } else {
                // tiles
                this.currentTileLayer.tiles.sort((a, b) => a.y - b.y);
            }
            this.resortRoom();
            this.refreshRoomCanvas();
        };

        this.resortRoom = () => {
            // Make an array of all the backgrounds, tile layers and copies, and then sort it.
            this.stack = this.room.copies.concat(this.room.backgrounds).concat(this.room.tiles);
            const projTypes = global.currentProject.types;
            this.stack.sort((a, b) => {
                const depthA = a.depth !== void 0 ? a.depth : projTypes[glob.typemap[a.uid]].depth,
                      depthB = b.depth !== void 0 ? b.depth : projTypes[glob.typemap[b.uid]].depth;
                return depthA - depthB;
            });
        };
        this.resortRoom();
        var typesChanged = () => {
            this.currentType = -1;
            this.resortRoom();
        };
        window.signals.on('typesChanged', typesChanged);
        this.on('unmount', () => {
            window.signals.off('typesChanged', typesChanged);
        });
        /** Canvas redrawing, with all the backgrounds, tiles and copies */
        // eslint-disable-next-line max-lines-per-function, complexity
        this.refreshRoomCanvas = () => {
            if (this.forbidDrawing) {
                return;
            }
            const {canvas} = this.refs,
                  sizes = this.refs.canvaswrap.getBoundingClientRect();
            // Make sure the canvas size is of correct width
            if (Number(canvas.width) !== sizes.width || Number(canvas.height) !== sizes.height) {
                canvas.width = sizes.width;
                canvas.height = sizes.height;
            }

            // Reset drawing transforms
            canvas.x.setTransform(1, 0, 0, 1, 0, 0);
            canvas.x.globalAlpha = 1;
            // Clear the canvas
            canvas.x.clearRect(0, 0, canvas.width, canvas.height);
            // Fill it with a background color
            canvas.x.fillStyle = this.room.backgroundColor || '#000000';
            canvas.x.fillRect(0, 0, canvas.width, canvas.height);

            // Apply camera movement + zoom
            canvas.x.translate(Math.floor(canvas.width / 2), Math.floor(canvas.height / 2));
            canvas.x.scale(this.zoomFactor, this.zoomFactor);
            canvas.x.translate(-this.roomx, -this.roomy);

            // Disable pixel interpolation, if needed
            canvas.x.imageSmoothingEnabled = !global.currentProject.settings.rendering.pixelatedrender;

            for (let i = 0, li = this.stack.length; i < li; i++) {
                if (this.stack[i].tiles) { // a tile layer
                    const layer = this.stack[i];
                    if (!layer.hidden) {
                        for (const tile of layer.tiles) {
                            const img = glob.texturemap[tile.texture],
                                  tex = img.g;
                            const x = tex.offx + (tex.width + tex.marginx) * tile.grid[0] - tex.marginx,
                                  y = tex.offy + (tex.height + tex.marginy) * tile.grid[1] - tex.marginy,
                                  w = (tex.width + tex.marginx) * tile.grid[2] - tex.marginx,
                                  h = (tex.height + tex.marginy) * tile.grid[3] - tex.marginy;
                            canvas.x.drawImage(
                                img,
                                x, y, w, h,
                                tile.x, tile.y, w, h
                            );
                        }
                    }
                } else if (this.stack[i].texture) { // a background layer
                    if (this.stack[i].texture !== -1) {
                        if (!('extends' in this.stack[i])) {
                            this.stack[i].extends = {};
                        }
                        const scx = this.stack[i].extends.scaleX || 1,
                              scy = this.stack[i].extends.scaleY || 1,
                              shx = this.stack[i].extends.shiftX || 0,
                              shy = this.stack[i].extends.shiftY || 0;
                        canvas.x.save();
                        canvas.x.fillStyle = canvas.x.createPattern(glob.texturemap[this.stack[i].texture], this.stack[i].extends.repeat || 'repeat');
                        canvas.x.translate(shx, shy);
                        canvas.x.scale(scx, scy);
                        canvas.x.fillRect(
                            (this.xToRoom(0) - shx) / scx, (this.yToRoom(0) - shy) / scy,
                            canvas.width / scx / this.zoomFactor,
                            canvas.height / scy / this.zoomFactor
                        );
                        canvas.x.restore();
                    }
                } else { // A copy
                    const copy = this.stack[i],
                          type = global.currentProject.types[glob.typemap[copy.uid]];
                    let texture, gra, w, h, ox, oy,
                        grax, gray; // texture's drawing center
                    if (type.texture !== -1) {
                        texture = glob.texturemap[type.texture];
                        gra = glob.texturemap[type.texture].g;
                        w = gra.width;
                        h = gra.height;
                        ox = gra.offx;
                        oy = gra.offy;
                        [grax, gray] = gra.axis;
                    } else {
                        texture = glob.texturemap[-1];
                        w = h = 32;
                        grax = gray = 16;
                        ox = oy = 0;
                    }
                    if (copy.tx || copy.ty || copy.tr) {
                        canvas.x.save();
                        canvas.x.translate(copy.x, copy.y);
                        canvas.x.rotate((copy.tr || 0) * Math.PI / -180);
                        canvas.x.scale(copy.tx || 1, copy.ty || 1);
                        canvas.x.drawImage(
                            texture,
                            ox, oy, w, h,
                            -grax, -gray, w, h
                        );
                        canvas.x.restore();
                    } else {
                        const tex = glob.texturemap[type.texture].g;
                        canvas.x.drawImage(
                            texture,
                            tex.offx, tex.offy, w, h,
                            copy.x - grax, copy.y - gray, w, h
                        );
                    }
                }
            }

            // Grid drawing
            if (this.room.gridX > 1) {
                canvas.x.globalCompositeOperation = 'exclusion';
                canvas.x.fillStyle = canvas.x.createPattern(this.gridCanvas, 'repeat');
                canvas.x.fillRect(
                    this.xToRoom(0), this.yToRoom(0),
                    canvas.width / this.zoomFactor, canvas.height / this.zoomFactor
                );
                canvas.x.globalCompositeOperation = 'source-over';
            }

            // Outline selected tiles
            if (this.tab === 'roomtiles' && this.selectedTiles && this.selectedTiles.length) {
                for (const tile of this.selectedTiles) {
                    const {g} = glob.texturemap[tile.texture];
                    this.drawSelection(
                        tile.x,
                        tile.y,
                        tile.x + g.width * tile.grid[2],
                        tile.y + g.height * tile.grid[3]
                    );
                }
            }
            // Outline selected copies
            if (this.tab === 'roomcopies' && this.selectedCopies && this.selectedCopies.length) {
                for (const copy of this.selectedCopies) {
                    this.drawSelection(copy);
                }
            }

            // Outline the starting viewport frame
            this.drawSelection(-1.5, -1.5, this.room.width + 1.5, this.room.height + 1.5);

            // Outline room's limits
            if (this.room.restrictCamera) {
                this.drawSelection(
                    (this.room.restrictMinX || 0) - 1.5,
                    (this.room.restrictMinY || 0) - 1.5,
                    (this.room.restrictMaxX === void 0 ? this.room.width : this.room.restrictMaxX) + 1.5,
                    (this.room.restrictMaxY === void 0 ? this.room.height : this.room.restrictMaxY) + 1.5
                );
            }
        };

        this.drawSelection = (x1, y1, x2, y2) => {
            const cx = this.refs.canvas.x;
            cx.lineJoin = 'round';
            cx.lineCap = 'round';
            if (typeof x1 !== 'number') {
                const copy = x1,
                      type = global.currentProject.types[glob.typemap[copy.uid]],
                      texture = glob.texturemap[type.texture].g;
                var left, top, height, width;
                if (copy.tr) {
                    cx.strokeStyle = localStorage.UItheme === 'Night' ? '#44dbb5' : '#446adb';
                    cx.lineWidth = 3;
                    cx.beginPath();
                    cx.moveTo(copy.x - 32, copy.y);
                    cx.lineTo(copy.x + 32, copy.y);
                    cx.moveTo(copy.x, copy.y - 32);
                    cx.lineTo(copy.x, copy.y + 32);
                    cx.stroke();
                    cx.strokeStyle = localStorage.UItheme === 'Night' ? '#1C2B42' : '#fff';
                    cx.lineWidth = 1;
                    cx.moveTo(copy.x - 32, copy.y);
                    cx.lineTo(copy.x + 32, copy.y);
                    cx.moveTo(copy.x, copy.y - 32);
                    cx.lineTo(copy.x, copy.y + 32);
                    cx.stroke();
                    return;
                }
                if (type.texture !== -1) {
                    left = copy.x - texture.axis[0] * (copy.tx || 1) - 1.5;
                    top = copy.y - texture.axis[1] * (copy.ty || 1) - 1.5;
                    width = texture.width * (copy.tx || 1) + 3;
                    height = texture.height * (copy.ty || 1) + 3;
                } else {
                    left = copy.x - 16 - 1.5;
                    top = copy.y - 16 - 1.5;
                    height = 32 + 3;
                    width = 32 + 3;
                }
                x1 = left;
                y1 = top;
                x2 = left + width;
                y2 = top + height;
            }
            cx.strokeStyle = localStorage.UItheme === 'Night' ? '#44dbb5' : '#446adb';
            cx.lineWidth = 3;
            cx.strokeRect(x1, y1, x2 - x1, y2 - y1);
            cx.strokeStyle = localStorage.UItheme === 'Night' ? '#1C2B42' : '#fff';
            cx.lineWidth = 1;
            cx.strokeRect(x1, y1, x2 - x1, y2 - y1);
        };

        /**
         * Генерирует миниатюру комнаты
         */
        this.roomGenSplash = function roomGenSplash() {
            const {imageCover, toBuffer} = require('./data/node_requires/imageUtils');
            return new Promise((accept, decline) => {
                const c = imageCover(this.refs.canvas, 340, 256);
                const buf = toBuffer(c);
                const roomSplashName = global.projdir + '/img/r' + this.room.thumbnail + '.png';
                fs.writeFile(roomSplashName, buf, err => {
                    if (err) {
                        decline(err);
                    } else {
                        accept(roomSplashName);
                    }
                });
                const projSplashName = global.projdir + '/img/splash.png';
                fs.writeFile(projSplashName, buf, err => {
                    if (err) {
                        decline(err);
                    }
                });
            });
        };
