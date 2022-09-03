import {getPixiSwatch} from '../../themes';
import {RoomEditor} from '..';
import {snapToRectangularGrid, snapToDiagonalGrid} from '../common';
import {getPixiTexture, getTextureFromId, getTexturePivot} from '../../resources/textures';
import {createTilePatch} from '../interactions/tiles/placeTile';

const unknownTextures = getPixiTexture(-1, void 0, true);

export class SnapTarget extends PIXI.Container {
    editor: RoomEditor;
    circle = new PIXI.Graphics();
    ghost = new PIXI.AnimatedSprite(unknownTextures);
    ghostCompound = new PIXI.Container();
    prevGhostTex: ITexture;
    prevTilePatch: string;
    constructor(editor: RoomEditor) {
        super();
        this.editor = editor;
        this.ghost.visible = false;
        this.ghost.alpha = 0.5;
        [this.ghost.anchor.x, this.ghost.anchor.y] = [0.5, 0.5];
        this.addChild(this.ghost, this.ghostCompound);
        this.circle.beginFill(getPixiSwatch('act'));
        this.circle.drawCircle(0, 0, 4);
        this.addChild(this.circle);
    }
    getPatchString(): string {
        const {tilePatch} = this.editor.riotEditor;
        return `${tilePatch.texture.uid}:${tilePatch.startX}:${tilePatch.startY}:${tilePatch.spanX}:${tilePatch.spanY}`;
    }
    update(): void {
        this.circle.scale.x = this.editor.camera.scale.x;
        this.circle.scale.y = this.editor.camera.scale.y;

        const {riotEditor} = this.editor;
        const {currentTemplate} = riotEditor;
        if (riotEditor.currentTool === 'addCopies' && currentTemplate !== -1) {
            this.ghost.visible = true;
            if (currentTemplate.texture === -1 &&
                this.ghost.textures !== unknownTextures
            ) {
                this.updateGhost(-1);
                this.ghost.textures = unknownTextures;
            }
            if (currentTemplate.texture !== -1 &&
                this.prevGhostTex !== getTextureFromId(currentTemplate.texture)
            ) {
                this.updateGhost(currentTemplate.texture);
                this.prevGhostTex = getTextureFromId(currentTemplate.texture);
            }
        } else {
            this.ghost.visible = false;
        }
        if (riotEditor.currentTool === 'addTiles' && riotEditor.tilePatch?.texture) {
            if (this.prevTilePatch !== this.getPatchString()) {
                this.ghostCompound.removeChildren();
                this.ghostCompound.visible = true;
                this.ghostCompound.addChild(...createTilePatch(riotEditor.tilePatch, {
                    x: 0,
                    y: 0
                }, this.editor, true));
                this.prevTilePatch = this.getPatchString();
            }
        } else {
            this.ghostCompound.visible = false;
            if (this.ghostCompound.children.length) {
                this.ghostCompound.removeChildren();
            }
        }

        const {mouse} = this.editor.renderer.plugins.interaction;
        mouse.getLocalPosition(this.editor.overlays, this.position);
        if (!riotEditor.gridOn || riotEditor.freePlacementMode) {
            return;
        }
        let snappedPos;
        if (this.editor.ctRoom.diagonalGrid) {
            snappedPos = snapToDiagonalGrid({
                x: this.x,
                y: this.y
            }, this.editor.ctRoom.gridX, this.editor.ctRoom.gridY);
        } else {
            snappedPos = snapToRectangularGrid({
                x: this.x,
                y: this.y
            }, this.editor.ctRoom.gridX, this.editor.ctRoom.gridY);
        }
        this.x = snappedPos.x;
        this.y = snappedPos.y;
    }
    updateGhost(texture: assetRef | ITexture): void {
        this.ghost.textures = getPixiTexture(texture, void 0, true);
        [this.ghost.anchor.x, this.ghost.anchor.y] = getTexturePivot(texture);
    }
}
