textures-panel.panel.view
    .flexfix.tall
        div
            asset-viewer(
                collection="{currentProject.textures}"
                contextmenu="{showTexturePopup}"
                vocspace="texture"
                namespace="textures"
                click="{openTexture}"
                thumbnails="{thumbnails}"
                ref="textures"
            )
                label.file.flexfix-header
                    input(type="file" multiple
                        accept=".png,.jpg,.jpeg,.bmp,.gif,.json"
                        onchange="{parent.textureImport}")
                    .button
                        svg.feather
                            use(xlink:href="data/icons.svg#download")
                        span {voc.import}
            asset-viewer(
                collection="{currentProject.skeletons}"
                contextmenu="{showSkeletonPopup}"
                vocspace="texture"
                namespace="skeletons"
                thumbnails="{thumbnails}"
                ref="skeletons"
            )
                h2
                    span {voc.skeletons}
                    docs-shortcut(path="/skeletal-animation.html")
                label.file.flexfix-header
                    input(type="file" multiple
                        accept=".json"
                        onchange="{parent.textureImport}")
                    .button
                        svg.feather
                            use(xlink:href="data/icons.svg#download")
                        span {voc.import}

    .aDropzone(if="{dropping}")
        .middleinner
            svg.feather
                use(xlink:href="data/icons.svg#download")
            h2 {languageJSON.common.fastimport}
            input(type="file" multiple
                accept=".png,.jpg,.jpeg,.bmp,.gif,.json"
                onchange="{textureImport}")

    texture-editor(if="{editing}" texture="{currentTexture}")
    context-menu(menu="{textureMenu}" ref="textureMenu")
    script.
        const fs = require('fs-extra'),
              path = require('path');
        const glob = require('./data/node_requires/glob');
        const generateGUID = require('./data/node_requires/generateGUID');
        this.namespace = 'texture';
        this.mixin(window.riotVoc);
        this.editing = false;
        this.dropping = false;

        this.thumbnails = texture => `file://${sessionStorage.projdir}/img/${texture.origname}_prev.png?cache=${texture.lastmod}`;

        this.fillTextureMap = () => {
            glob.texturemap = {};
            window.currentProject.textures.forEach(texture => {
                var img = document.createElement('img');
                glob.texturemap[texture.uid] = img;
                img.g = texture;
                img.src = 'file://' + sessionStorage.projdir + '/img/' + texture.origname + '?' + texture.lastmod;
            });
            var img = document.createElement('img');
            glob.texturemap[-1] = img;
            img.g = {
                width: 32,
                height: 32,
                offx: 0,
                offy: 0,
                grid: [1, 1],
                axis: [16, 16],
                marginx: 0,
                marginy: 0,
                imgWidth: 32,
                imgHeight: 32,
                closedStrip: true
            }
            img.src = 'data/img/unknown.png';
        };

        this.setUpPanel = e => {
            this.fillTextureMap();
            this.refs.textures.updateList();
            this.refs.skeletons.updateList();
            this.searchResults = null;
            this.editing = false;
            this.dropping = false;
            this.currentTexture = null;
            this.update();
        };

        window.signals.on('projectLoaded', this.setUpPanel);
        this.on('mount', this.setUpPanel);
        this.on('unmount', () => {
            window.signals.off('projectLoaded', this.setUpPanel);
        });

        /**
         * An event fired when user attempts to add files from a file manager (by clicking an "Import" button)
         */
        this.textureImport = e => { // input[type="file"]
            const files = [...e.target.files].map(file => file.path);
            for (let i = 0; i < files.length; i++) {
                if (/\.(jpg|gif|png|jpeg)/gi.test(files[i])) {
                    let id = generateGUID();
                    this.loadImg(
                        id,
                        files[i],
                        sessionStorage.projdir + '/img/i' + id + path.extname(files[i]),
                        true
                    );
                } else if (/_ske\.json/i.test(files[i])) {
                    let id = generateGUID();
                    this.loadSkeleton(
                        id,
                        files[i],
                        sessionStorage.projdir + '/img/skdb' + id + '_ske.json'
                    )
                }
            }
            e.srcElement.value = '';
            this.dropping = false;
            e.preventDefault();
        };
        /**
         * Tries to load an image, then adds it to the projects and creates a thumbnail
         * @param {Number} uid Counter/identifier. Should be unique for all loaded images
         * @param {String} filename A path to the source image
         * @param {String} dest A path to a folder in which to put the image and its thumbnails
         * @param {Boolean} imprt If set to true, creates a texture object in the current project; otherwise updates the existing texture.
         */
        this.loadImg = (uid, filename, dest, imprt) => {
            fs.copy(filename, dest, e => {
                if (e) throw e;
                var image = document.createElement('img');
                image.onload = () => {
                    setTimeout(() => {
                        var obj = {
                            name: path.basename(filename).replace(/\.(jpg|gif|png|jpeg)/gi, '').replace(/\s/g, '_'),
                            untill: 0,
                            grid: [1, 1],
                            axis: [0, 0],
                            marginx: 0,
                            marginy: 0,
                            imgWidth: image.width,
                            imgHeight: image.height,
                            width: image.width,
                            height: image.height,
                            offx: 0,
                            offy: 0,
                            origname: path.basename(dest),
                            source: filename,
                            shape: 'rect',
                            left: 0,
                            right: image.width,
                            top: 0,
                            bottom: image.height,
                            uid: uid
                        };
                        window.currentProject.textures.push(obj);
                        this.imgGenPreview(dest, dest + '_prev.png', 64)
                        .then(dataUrl => {
                            this.refs.textures.updateList();
                            this.refs.skeletons.updateList();
                            this.update();
                        });
                        this.imgGenPreview(dest, dest + '_prev@2.png', 128);
                        this.fillTextureMap();
                    }, 0);
                }
                image.onerror = e => {
                    alertify.error(e);
                }
                image.src = 'file://' + dest + '?' + Math.random();
            });
        };
        this.loadSkeleton = (uid, filename, dest) => {
            fs.copy(filename, dest)
            .then(() => fs.copy(filename.replace('_ske.json', '_tex.json'), dest.replace('_ske.json', '_tex.json')))
            .then(() => fs.copy(filename.replace('_ske.json', '_tex.png'), dest.replace('_ske.json', '_tex.png')))
            .then(() => {
                currentProject.skeletons.push({
                    name: path.basename(filename).replace('_ske.json', ''),
                    origname: path.basename(dest),
                    from: 'dragonbones',
                    uid: uid
                })
                this.skelGenPreview(dest, dest + '_prev.png', [64, 128])
                .then(dataUrl => {
                    this.refs.textures.updateList();
                    this.refs.skeletons.updateList();
                    this.update();
                });
            });
        };
        /**
         * Generates a square preview for a given skeleton
         * @param {String} source Path to the image
         * @param {String} destFile Path to the destinating image
         * @param {Number} size Size of the square thumbnail, in pixels
         * @returns {Promise} Resolves after creating a thumbnail. On success, passes data-url of the created thumbnail.
         */
        this.imgGenPreview = (source, destFile, size) => {
            var thumbnail = document.createElement('img');
            return new Promise((accept, reject) => {
                thumbnail.onload = () => {
                    var c = document.createElement('canvas'),
                    w, h, k;
                    c.x = c.getContext('2d');
                    c.width = c.height = size;
                    c.x.clearRect(0, 0, size, size);
                    w = thumbnail.width;
                    h = thumbnail.height;
                    if (w > h) {
                        k = size / w;
                    } else {
                        k = size / h;
                    }
                    if (k > 1) k = 1;
                    c.x.drawImage(
                        thumbnail,
                        (size - thumbnail.width*k)/2,
                        (size - thumbnail.height*k)/2,
                        thumbnail.width*k,
                        thumbnail.height*k
                    );
                    // strip off the data:image url prefix to get just the base64-encoded bytes
                    var dataURL = c.toDataURL();
                    var data = dataURL.replace(/^data:image\/\w+;base64,/, '');
                    var buf = new Buffer(data, 'base64');
                    var stream = fs.createWriteStream(destFile);
                    stream.on('finish', () => {
                        setTimeout(() => { // WHY THE HECK I EVER NEED THIS?!
                            accept(destFile);
                        }, 100);
                    });
                    stream.on('error', err => {
                        reject(err);
                    });
                    stream.end(buf);
                }
                thumbnail.src = 'file://' + source;
            });
        };
        /**
         *  Generates a square preview for a given skeleton
         * @param {String} source Path to the source _ske.json file
         * @param {String} destFile Path to the destinating image
         * @param {Number} size Size of the square thumbnail, in pixels
         * @returns {Promise} Resolves after creating a thumbnail. On success, passes data-url of the created thumbnail.
         */
        this.skelGenPreview = (source, destFile, sizes) => {
            const loader = new PIXI.loaders.Loader(),
                  dbf = dragonBones.PixiFactory.factory;
            const slice = 'file://' + source.replace('_ske.json', '');
            return new Promise((resolve, reject) => {
                loader.add(`${slice}_ske.json`, `${slice}_ske.json`)
                    .add(`${slice}_tex.json`, `${slice}_tex.json`)
                    .add(`${slice}_tex.png`, `${slice}_tex.png`);
                loader.load(() => {
                    dbf.parseDragonBonesData(loader.resources[`${slice}_ske.json`].data);
                    dbf.parseTextureAtlasData(loader.resources[`${slice}_tex.json`].data, loader.resources[`${slice}_tex.png`].texture);
                    const skel = dbf.buildArmatureDisplay('Armature', loader.resources[`${slice}_ske.json`].data.name);
                    const promises = sizes.map(size => new Promise((resolve, reject) => {
                        const app = new PIXI.Application();
                        const base64 = app.renderer.plugins.extract.base64(skel)
                        const data = base64.replace(/^data:image\/\w+;base64,/, '');;
                        const buf = new Buffer(data, 'base64');
                        const stream = fs.createWriteStream(destFile);
                        stream.on('finish', () => {
                            setTimeout(() => { // WHY THE HECK I EVER NEED THIS?!
                                resolve(destFile);
                            }, 100);
                        });
                        stream.on('error', err => {
                            reject(err);
                        });
                        stream.end(buf);
                    }));
                    Promise.all(promises)
                    .then(() => {
                        delete dbf._dragonBonesDataMap[loader.resources[`${slice}_ske.json`].data.name];
                        delete dbf._textureAtlasDataMap[loader.resources[`${slice}_ske.json`].data.name];
                    })
                    .then(resolve)
                    .catch(reject);
                });
            });
        };

        // Creates a context menu that will appear on RMB click on texture cards
        this.textureMenu = {
            opened: false,
            items: [{
                label: languageJSON.common.open,
                click: e => {
                    if (this.currentTextureType === 'skeleton') {
                        this.openSkeleton(this.currentTexture)();
                    } else {
                        this.openTexture(this.currentTexture)();
                    }
                    this.update();
                }
            }, {
                label: languageJSON.common.copyName,
                click: e => {
                    const {clipboard} = require('electron');
                    clipboard.writeText(this.currentTexture.name);
                }
            }, {
                label: window.languageJSON.common.rename,
                click: e => {
                    alertify
                    .defaultValue(this.currentTexture.name)
                    .prompt(window.languageJSON.common.newname)
                    .then(e => {
                        if (e.inputValue && e.inputValue != '' && e.buttonClicked !== 'cancel') {
                            this.currentTexture.name = e.inputValue;
                            this.update();
                        }
                    });
                }
            }, {
                type: 'separator'
            }, {
                label: window.languageJSON.common.delete,
                click: e => {
                    alertify
                    .okBtn(window.languageJSON.common.delete)
                    .cancelBtn(window.languageJSON.common.cancel)
                    .confirm(window.languageJSON.common.confirmDelete.replace('{0}', this.currentTexture.name))
                    .then(e => {
                        if (e.buttonClicked === 'ok') {
                            if (this.currentTextureType === 'skeleton') {
                                window.currentProject.skeletons.splice(this.currentTextureId, 1);
                            } else {
                                for (const type of window.currentProject.types) {
                                    if (type.texture === this.currentTexture.uid) {
                                        type.texture = -1;
                                    }
                                }
                                for (const room of window.currentProject.rooms) {
                                    if ('tiles' in room) {
                                        for (const layer of room.tiles) {
                                            let i = 0;
                                            while (i < layer.tiles.length) {
                                                if (layer.tiles[i].texture === this.currentTexture.uid) {
                                                    layer.tiles.splice(i, 1);
                                                } else {
                                                    i++;
                                                }
                                            }
                                        }
                                    }
                                    if ('backgrounds' in room) {
                                        let i = 0;
                                        while (i < room.backgrounds.length) {
                                            if (room.backgrounds[i].texture === this.currentTexture.uid) {
                                                room.backgrounds.splice(i, 1);
                                            } else {
                                                i++;
                                            }
                                        }
                                    }
                                }
                                window.currentProject.textures.splice(this.currentTextureId, 1);
                            }
                            this.refs.textures.updateList();
                            this.refs.skeletons.updateList();
                            this.update();
                            alertify
                                .okBtn(window.languageJSON.common.ok)
                                .cancelBtn(window.languageJSON.common.cancel);
                        }
                    });
                }
            }]
        };
        /**
         * Shows the context menu created above
         */
        this.showTexturePopup = (texture, isSkeleton) => e => {
            this.currentTextureType = isSkeleton? 'skeleton' : 'texture';
            if (isSkeleton) {
                this.currentTextureId = currentProject.skeletons.indexOf(texture);
            } else {
                this.currentTextureId = currentProject.textures.indexOf(texture);
            }
            this.currentTexture = texture;
            this.refs.textureMenu.popup(e.clientX, e.clientY);
            e.preventDefault();
        };
        this.showSkeletonPopup = skel => e => {
            this.showTexturePopup(skel, true)(e);
        };

        /**
         * Opens an editor for the given texture
         */
        this.openTexture = texture => e => {
            this.currentTexture = texture;
            this.currentTextureId = window.currentProject.textures.indexOf(texture);
            this.editing = true;
        };
        this.openSkeleton = skel => e => {

        };

        /*
         * drag-n-drop handling
         */
        var dragTimer;
        this.onDragOver = e => {
            var dt = e.dataTransfer;
            if (dt.types && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.contains('Files'))) {
                this.dropping = true;
                this.update();
                window.clearTimeout(dragTimer);
            }
            e.preventDefault();
            e.stopPropagation();
        };
        this.onDrop = e => {
             e.stopPropagation();
        };
        this.onDragLeave = e => {
            dragTimer = window.setTimeout(() => {
                this.dropping = false;
                this.update()
            }, 25);
            e.preventDefault();
            e.stopPropagation();
        };
        this.on('mount', () => {
            document.addEventListener('dragover', this.onDragOver);
            document.addEventListener('dragleave', this.onDragLeave);
            document.addEventListener('drop', this.onDrop);
        });
        this.on('unmount', () => {
            document.removeEventListener('dragover', this.onDragOver);
            document.removeEventListener('dragleave', this.onDragLeave);
            document.removeEventListener('drop', this.onDrop);
        });