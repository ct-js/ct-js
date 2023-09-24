import { imageContain, toBuffer } from "../../utils/imageUtils";
import { getDOMImage } from "../textures";

/*
 * Dragon bones is like my hockey team whenever I play - no support whatsoever.
 */

interface ISkeleton extends IAsset {
    origname: string;
    from: "dragonbones" | string;
    name: string;
}

export class SkeletonPreviewer {
    static get(skel: ISkeleton, fileSys?: boolean | "last"): string {
        if (fileSys) {
            if (fileSys === "last") {
                return `d${skel.uid}.png`;
            }
            const path = require("path");
            return path.join(global.projdir, "prev", `d${skel.uid}.png`);
        }
        return `file://${global.projdir.replace(/\\/g, "/")}/prev/d${
            skel.uid
        }.png?cache=${skel.lastmod}`;
    }

    static getClassic(skel: ISkeleton, _x2: boolean, fileSys: boolean): string {
        return SkeletonPreviewer.get(skel, fileSys);
    }

    static retain(skels: ISkeleton[]): string[] {
        return skels.flatMap((skel) => [
            skel.origname,
            `${skel.origname.replace("_ske.json", "")}_tex.json`,
            `${skel.origname.replace("_ske.json", "")}_tex.png`,
        ]);
    }

    static retainPreview(skels: ISkeleton[]): string[] {
        return skels.map((skel) => SkeletonPreviewer.get(skel, "last"));
    }

    static create(skel: ISkeleton): Promise<HTMLImageElement> {
        return getDOMImage(skel);
    }

    static async save(skel: ISkeleton): Promise<string> {
        try {
            const destPath = SkeletonPreviewer.get(skel, true);
            const source = await getDOMImage(skel);
            const c = imageContain(source, 128, 128);
            const buf = toBuffer(c);
            const fs = require("fs-extra");
            await fs.writeFile(destPath, buf);
            return destPath;
        } catch (e) {
            console.error(e);
            return "";
        }
    }
}
