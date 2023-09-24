import { outputCanvasToFile } from "../../utils/imageUtils";
import { styleToTextStyle } from "../../styleUtils";

export class StylePreviewer {
    static get(font: IStyle, fileSys?: boolean | "last"): string {
        if (fileSys) {
            if (fileSys === "last") {
                return `s${font.uid}.png`;
            }
            const path = require("path");
            return path.join(global.projdir, "prev", `s${font.uid}.png`);
        }
        return `file://${global.projdir.replace(/\\/g, "/")}/prev/s${
            font.uid
        }.png?cache=${font.lastmod}`;
    }

    static getClassic(style: IStyle, _x2: boolean, fileSys: boolean): string {
        return StylePreviewer.get(style, fileSys);
    }

    static retain(_styles: IStyle[]): string[] {
        return [];
    }

    static retainPreview(styles: IStyle[]): string[] {
        return styles.map((style) => StylePreviewer.get(style, "last"));
    }

    static create(style: IStyle): Promise<HTMLCanvasElement> {
        const pixiApp = new PIXI.Application({
            width: 128,
            height: 128,
            transparent: true,
        });
        const pixiStyle = new PIXI.TextStyle(styleToTextStyle(style));
        const fontSize = parseInt(`${pixiStyle.fontSize}`, 10);
        if (fontSize > 96) {
            pixiStyle.fontSize = "96px";
            pixiStyle.lineHeight = 96;
        } else if (fontSize < 12) {
            pixiStyle.fontSize = "12px";
            pixiStyle.lineHeight = 12;
        }
        const labelThumbnail = new PIXI.Text("Aa", pixiStyle);
        labelThumbnail.anchor.x = 0.5;
        labelThumbnail.anchor.y = 0.5;
        labelThumbnail.x = 64;
        labelThumbnail.y = 64;
        labelThumbnail.visible = true;
        const graphics = new PIXI.Graphics();
        graphics.beginFill(0xffffff); // Set fill color to red
        graphics.drawRect(0, 0, 128, 128); // Draw a 100x100 rectangle
        graphics.endFill();
        graphics.alpha = 0.0;
        pixiApp.stage.addChild(graphics);
        pixiApp.stage.addChild(labelThumbnail);
        return Promise.resolve(pixiApp.renderer.extract.canvas(pixiApp.stage));
    }

    static async save(style: IStyle): Promise<string> {
        try {
            const destPath = StylePreviewer.get(style, true);
            const canvas = await StylePreviewer.create(style);
            await outputCanvasToFile(canvas, destPath);
            return destPath;
        } catch (e) {
            console.error(e);
            return "";
        }
    }
}
