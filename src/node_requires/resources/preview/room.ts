import { RoomEditorPreview } from "../../roomEditor/previewer";
import { getRoomFromId } from "../rooms";
import { outputCanvasToFile } from "../../utils/imageUtils";

export class RoomPreviewer {
    static get(room: assetRef | IRoom, fileSys?: boolean | "last"): string {
        if (room === -1) {
            return "data/img/notexture.png";
        }
        if (typeof room === "string") {
            room = getRoomFromId(room);
        }
        if (fileSys) {
            if (fileSys === "last") {
                return `r${room.uid}.png`;
            }
            const path = require("path");
            return path.join(global.projdir, "prev", `r${room.uid}.png`);
        }
        return `file://${global.projdir.replace(/\\/g, "/")}/prev/r${
            room.uid
        }.png?cache=${room.lastmod}`;
    }

    static getClassic(
        room: assetRef | IRoom,
        _x2: boolean,
        fileSys: boolean
    ): string {
        const result = RoomPreviewer.get(room, fileSys);
        return result;
    }

    static retain(_rooms: IRoom[]): string[] {
        return ["splash.png"];
    }

    static retainPreview(rooms: IRoom[]): string[] {
        return rooms.map((room) => RoomPreviewer.get(room, "last"));
    }

    static create(room: IRoom): Promise<HTMLCanvasElement> {
        const w = 340,
            h = 256;
        const renderTexture = PIXI.RenderTexture.create({
            width: w,
            height: h,
        });
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const pixelart = Boolean(
            currentProject.settings.rendering.pixelatedrender
        );
        const scale = Math.min(w / room.width, h / room.height);
        const preview = new RoomEditorPreview(
            { view: canvas },
            room,
            pixelart,
            {
                x: (w - room.width * scale) / 2,
                y: (h - room.height * scale) / 2,
                scale,
            }
        );
        preview.renderer.render(preview.stage, renderTexture);
        return Promise.resolve(preview.renderer.extract.canvas(renderTexture));
    }

    static async save(
        room: assetRef | IRoom,
        asSplash: boolean
    ): Promise<string> {
        try {
            if (typeof room === "number") {
                throw new Error("Cannot write a room preview for a room -1");
            }
            if (typeof room === "string") {
                room = getRoomFromId(room);
            }
            const destPath = RoomPreviewer.get(room, true);
            const canvas = await RoomPreviewer.create(room);
            if (asSplash) {
                const path = require("path");
                const splash = path.join(
                    (global as any).projdir,
                    "img",
                    "splash.png"
                );
                return Promise.all([
                    outputCanvasToFile(canvas, destPath),
                    outputCanvasToFile(canvas, splash),
                ]).then(() => destPath);
            }
            await outputCanvasToFile(canvas, destPath);
            return destPath;
        } catch (e) {
            console.error(e);
            return "";
        }
    }
}
