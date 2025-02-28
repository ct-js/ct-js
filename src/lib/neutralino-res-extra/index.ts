import neutralino from '@neutralinojs/lib';

const Neutralino = window.Neutralino ?? neutralino;
const res = Neutralino.resources;

let resourcesPromise: Promise<string[]>;

export const pathExists = (filePath: string): Promise<boolean> => {
    if (!resourcesPromise) {
        resourcesPromise = res.getFiles();
    }
    return resourcesPromise.then(files => files.includes(filePath));
};

export const getFolderEntries = async (path: string): Promise<string[]> => {
    if (path.endsWith('/')) {
        path = path.slice(0, -1); // Remove trailing slash if present
    }
    const searchPattern = new RegExp(`^${path}/[^/]+$`, 'i');
    if (!resourcesPromise) {
        resourcesPromise = res.getFiles();
    }
    return (await resourcesPromise).filter(entry => searchPattern.test(entry));
};

export default {
    getFolderEntries,
    pathExists
};
