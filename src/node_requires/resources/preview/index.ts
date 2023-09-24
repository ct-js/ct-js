import { FontPreviewer } from "./font";
import { RoomPreviewer } from "./room";
import { StylePreviewer } from "./style";
import { TexturePreviewer } from "./texture";
import { SkeletonPreviewer } from "./skeleton";

export async function preparePreviews(
    projectData: IProject,
    trashOrphans: boolean
) {
    const fs = require("fs-extra");
    let trashChecked = false,
        previewGenerated = false;

    if (trashOrphans) {
        const imagesToKeep = [
            ...FontPreviewer.retain(projectData.fonts),
            ...RoomPreviewer.retain(projectData.rooms),
            ...StylePreviewer.retain(projectData.styles),
            ...TexturePreviewer.retain(projectData.textures),
            ...SkeletonPreviewer.retain(projectData.skeletons),
        ];

        const imgFilenames = fs.readdirSync(global.projdir + "/img");
        for (const filename of imgFilenames) {
            if (imagesToKeep.indexOf(filename) === -1) {
                if (!trashChecked) {
                    fs.ensureDir(global.projdir + "/trash");
                }
                fs.moveSync(
                    global.projdir + "/img/" + filename,
                    global.projdir + "/trash/" + filename,
                    { overwrite: true }
                );
            }
        }

        if (fs.existsSync(global.projdir + "/prev")) {
            const previewsToKeep = [
                ...FontPreviewer.retainPreview(projectData.fonts),
                ...RoomPreviewer.retainPreview(projectData.rooms),
                ...StylePreviewer.retainPreview(projectData.styles),
                ...TexturePreviewer.retainPreview(projectData.textures),
                ...SkeletonPreviewer.retainPreview(projectData.skeletons),
            ];

            const previewFilenames = fs.readdirSync(global.projdir + "/prev");
            for (const filename of previewFilenames) {
                if (previewsToKeep.indexOf(filename) === -1) {
                    if (!trashChecked) {
                        fs.ensureDir(global.projdir + "/trash");
                    }
                    fs.moveSync(
                        global.projdir + "/prev/" + filename,
                        global.projdir + "/trash/" + filename,
                        { overwrite: true }
                    );
                }
            }
        }
    }

    fs.ensureDir(global.projdir + "/prev");
    for (const font of projectData.fonts) {
        if (!fs.existsSync(FontPreviewer.get(font, true))) {
            await FontPreviewer.save(font);
            previewGenerated = true;
        }
    }
    for (const room of projectData.rooms) {
        if (!fs.existsSync(RoomPreviewer.get(room, true))) {
            await RoomPreviewer.save(room, room === projectData.rooms[0]);
            previewGenerated = true;
        }
    }
    for (const style of projectData.styles) {
        if (!fs.existsSync(StylePreviewer.get(style, true))) {
            await StylePreviewer.save(style);
            previewGenerated = true;
        }
    }
    for (const texture of projectData.textures) {
        if (!fs.existsSync(TexturePreviewer.get(texture, true))) {
            await TexturePreviewer.save(texture);
            previewGenerated = true;
        }
    }
    for (const skel of projectData.skeletons) {
        if (!fs.existsSync(SkeletonPreviewer.get(skel, true))) {
            await SkeletonPreviewer.save(skel);
            previewGenerated = true;
        }
    }
}
