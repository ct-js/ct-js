import {RoomEditor} from '..';
import {RoomEditorPreview} from '../previewer';
import {getById} from '../../resources';
import {getPixiTexture} from '../../resources/templates';
import {getTexturePivot} from '../../resources/textures';
import {styleToTextStyle} from '../../styleUtils';


import * as PIXI from 'node_modules/pixi.js';
import 'node_modules/@pixi/events';

/**
 * @extends PIXI.Container
 * @notice This class automatically adds and removes itself from editor's copy list
 */
class Copy extends PIXI.Container {
    templateId: string;
    copyExts: Record<string, unknown>;
    copyCustomProps: Record<string, unknown>;
    cachedTemplate: ITemplate;
    isGhost: boolean;
    editor: RoomEditor | RoomEditorPreview;

    sprite?: PIXI.AnimatedSprite;
    text?: PIXI.Text;
    nineSlicePlane?: PIXI.NineSlicePlane & {
        initialWidth: number;
        initialHeight: number;
    };

    customTextSettings?: {
        fontSize?: string,
        wordWrapWidth?: string,
        anchor?: {
            x: number,
            y: number
        }
    };

    constructor(copyInfo: IRoomCopy, editor: RoomEditor | RoomEditorPreview, isGhost?: boolean) {
        super();
        this.editor = editor;
        this.templateId = copyInfo.uid;
        const t = getById('template', this.templateId as string);
        this.cachedTemplate = t;
        switch (this.cachedTemplate.baseClass) {
        case 'AnimatedSprite':
            this.sprite = new PIXI.AnimatedSprite(getPixiTexture(copyInfo.uid));
            this.sprite.autoUpdate = false;
            this.addChild(this.sprite);
            break;
        case 'NineSlicePlane':
            this.nineSlicePlane =
                new PIXI.NineSlicePlane(getPixiTexture(copyInfo.uid)[0]) as Copy['nineSlicePlane'];
            this.nineSlicePlane.initialWidth = this.nineSlicePlane.width;
            this.nineSlicePlane.initialHeight = this.nineSlicePlane.height;
            this.addChild(this.nineSlicePlane);
            break;
        case 'Text':
            this.customTextSettings = {};
            this.text = new PIXI.Text(copyInfo.customText || this.cachedTemplate.defaultText || '');
            this.addChild(this.text);
            break;

        default:
            throw new Error(`Unknown base class ${this.cachedTemplate.baseClass}. Did you forget to call applyMigrationScript('4.0.0-next-3')?`);
        }
        this.deserialize(copyInfo);
        this.isGhost = Boolean(isGhost);
        if (this.editor instanceof RoomEditor) {
            this.eventMode = this.isGhost ? 'none' : 'static';
            if (this.eventMode === 'static') {
                this.on('pointerover', () => {
                    (this.editor as RoomEditor).updateMouseoverHint(t.name, this);
                });
                this.on('pointerout', () => {
                    (this.editor as RoomEditor).mouseoverOut(this);
                });
            }
        }
        if (!this.isGhost) {
            editor.copies.add(this);
        }
    }
    destroy(): void {
        if (!this.isGhost) {
            this.editor.copies.delete(this);
        }
        super.destroy();
    }
    detach(): this {
        this.editor.copies.delete(this);
        this.editor.room.removeChild(this);
        return this;
    }
    restore(): this {
        this.editor.copies.add(this);
        this.editor.room.addChild(this);
        return this;
    }

    get animated(): boolean {
        return getById('template', this.templateId as string).playAnimationOnStart;
    }

    /**
     * Resizes the 9-slice plane to undo the scaling of the container
     * and redraw the plane to fill its frame.
     */
    updateNinePatch(): void {
        if (!this.nineSlicePlane) {
            return;
        }
        const n9 = this.nineSlicePlane;
        n9.scale.set(
            1 / this.scale.x,
            1 / this.scale.y
        );
        n9.width = n9.initialWidth * this.scale.x;
        n9.height = n9.initialHeight * this.scale.y;
    }

    serialize(deepCopy = false): IRoomCopy {
        const copy: IRoomCopy = {
            x: this.x,
            y: this.y,
            opacity: this.alpha,
            tint: (this.sprite?.tint || this.text?.tint || this.nineSlicePlane?.tint) as number,
            scale: {
                x: this.scale.x,
                y: this.scale.y
            },
            rotation: this.rotation,
            uid: this.templateId,
            exts: deepCopy ? JSON.parse(JSON.stringify(this.copyExts)) : this.copyExts,
            customProperties: deepCopy ?
                JSON.parse(JSON.stringify(this.copyCustomProps)) :
                this.copyCustomProps
        };
        if (this.text) {
            if (this.customTextSettings.anchor) {
                copy.customAnchor = this.customTextSettings.anchor;
            }
            if (this.customTextSettings.wordWrapWidth) {
                copy.customWordWrap = this.customTextSettings.wordWrapWidth;
            }
            if (this.customTextSettings.fontSize) {
                copy.customSize = this.customTextSettings.fontSize;
            }
        }
        return copy;
    }
    // eslint-disable-next-line complexity
    deserialize(copy: IRoomCopy): void {
        this.x = copy.x;
        this.y = copy.y;
        this.zIndex = this.cachedTemplate.depth;
        this.alpha = copy.opacity ?? 1;
        (this.sprite || this.nineSlicePlane || this.text).tint = copy.tint ?? 0xffffff;
        this.scale.x = copy.scale?.x ?? 1;
        this.scale.y = copy.scale?.y ?? 1;
        this.rotation = copy.rotation ?? 0;
        this.updateNinePatch();
        this.templateId = copy.uid;
        this.copyExts = copy.exts ?? {};
        this.copyCustomProps = copy.customProperties ?? {};
        const t = getById('template', this.templateId as string);
        if (this.nineSlicePlane) {
            this.nineSlicePlane.topHeight = t.nineSliceSettings.top;
            this.nineSlicePlane.bottomHeight = t.nineSliceSettings.bottom;
            this.nineSlicePlane.leftWidth = t.nineSliceSettings.left;
            this.nineSlicePlane.rightWidth = t.nineSliceSettings.right;
        }
        if (this.sprite) {
            this.sprite.animationSpeed = (t.animationFPS ?? 60) / 60;
            this.sprite.loop = t.loopAnimation ?? true;
            if (t.playAnimationOnStart) {
                this.sprite.play();
            }
            if (t.texture !== -1) {
                [this.sprite.anchor.x, this.sprite.anchor.y] = getTexturePivot(t.texture);
            } else {
                this.sprite.anchor.x = this.sprite.anchor.y = 0.5;
            }
        }
        if (this.text) {
            const blends: Partial<PIXI.ITextStyle> = {};
            if (copy.customSize) {
                this.customTextSettings.fontSize = copy.customSize;
                blends.fontSize = Number(this.customTextSettings.fontSize);
            }
            if (copy.customWordWrap) {
                blends.wordWrap = true;
                blends.wordWrapWidth = Number(copy.customWordWrap);
                this.customTextSettings.wordWrapWidth = copy.customWordWrap;
            }
            const style: Partial<PIXI.ITextStyle> | false = t.textStyle && (t.textStyle !== -1) &&
                (Object.assign(
                    {},
                    styleToTextStyle(getById('style', t.textStyle)),
                    blends
                ) as unknown as Partial<PIXI.ITextStyle>);
            if (style) {
                this.text.style = style;
            }
            if (copy.customAnchor) {
                this.customTextSettings.anchor = {
                    ...copy.customAnchor
                };
                this.text.anchor.set(copy.customAnchor.x, copy.customAnchor.y);
            }
        }
    }
    refreshTexture(): void {
        const t = this.cachedTemplate;
        if (this.sprite) {
            this.sprite.textures = getPixiTexture(t);
            if (t.texture !== -1) {
                [this.sprite.anchor.x, this.sprite.anchor.y] = getTexturePivot(t.texture);
            } else {
                this.sprite.anchor.x = this.sprite.anchor.y = 0.5;
            }
        } else if (this.nineSlicePlane) {
            [this.nineSlicePlane.texture] = getPixiTexture(t);
        }
    }
}

export {Copy};
