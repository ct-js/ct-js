import {outputCanvasToFile} from '../../utils/imageUtils';
import {styleToTextStyle} from '../../styleUtils';

import * as PIXI from 'pixi.js';

export class StylePreviewer {
    static get(style: IStyle, fileSys?: boolean | 'last'): string {
        if (fileSys) {
            if (fileSys === 'last') {
                return `s${style.uid}.png`;
            }
            const path = require('path');
            return path.join(window.projdir, 'prev', `s${style.uid}.png`);
        }
        return `${window.projdir.replace(/\\/g, '/')}/prev/s${
            style.uid
        }.png`;
    }

    static getClassic(style: IStyle, _x2: boolean, fileSys: boolean): string {
        return StylePreviewer.get(style, fileSys);
    }

    static retain(): string[] {
        return [];
    }

    static retainPreview(styles: IStyle[]): string[] {
        return styles.map((style) => StylePreviewer.get(style, 'last'));
    }

    static create(style: IStyle): Promise<HTMLCanvasElement> {
        const w = 128,
              h = 128;
        const pixiApp = new PIXI.Application({
            width: w,
            height: h
        });
        const pixiStyle = new PIXI.TextStyle(styleToTextStyle(style, true));
        const fontSize = parseInt(`${pixiStyle.fontSize}`, 10);
        pixiStyle.lineHeight = 0;
        if (fontSize > 82) {
            pixiStyle.fontSize = '82px';
        } else if (fontSize < 12) {
            pixiStyle.fontSize = '12px';
        }
        const labelThumbnail = new PIXI.Text('Gg', pixiStyle);
        labelThumbnail.anchor.x = 0.5;
        labelThumbnail.anchor.y = 0.5;
        labelThumbnail.x = w / 2;
        labelThumbnail.y = h / 2;
        labelThumbnail.visible = true;
        const darkColor = (x: string, min = 'D') =>
            x !== (void 0) && (x[0] !== '#' || x[1] <= min || x[3] <= min || x[5] <= min);
        const darkFill = style.fill === (void 0) ||
            (Number(style.fill.type) === 0 && darkColor(style.fill.color)) ||
            (Number(style.fill.type) === 1 && (darkColor(style.fill.color1, 'B') || darkColor(style.fill.color2, 'B')));
        const darkStroke = style.stroke &&
            style.stroke.weight >= 1 &&
            darkColor(style.stroke.color);
        const lightColor = !darkFill && !darkStroke;
        const graphics = new PIXI.Graphics();
        graphics.beginFill(lightColor ? 0x000000 : 0xffffff);
        graphics.drawRect(0, 0, w, h);
        graphics.endFill();
        graphics.alpha = lightColor ? 1.0 : 0.0;
        pixiApp.stage.addChild(graphics);
        pixiApp.stage.addChild(labelThumbnail);
        const result = pixiApp.renderer.extract.canvas(pixiApp.stage) as HTMLCanvasElement;
        pixiApp.destroy(false, {
            children: true
        });
        return Promise.resolve(result);
    }

    static async save(style: IStyle): Promise<string> {
        try {
            const destPath = StylePreviewer.get(style, true);
            const canvas = await StylePreviewer.create(style);
            await outputCanvasToFile(canvas, destPath);
            return destPath;
        } catch (e) {
            console.error(e);
            return '';
        }
    }
}
