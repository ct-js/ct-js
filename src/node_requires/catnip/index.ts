import fs from 'fs-extra';
import {join} from 'path';

import {getModulePathByName} from '../resources/modules';
import {convertFromDtsToBlocks} from './blockUtils';
import {parseFile} from './declarationExtractor';

import logicBlocks from './stdLib/logic';


const builtinBlockLibrary: blockMenu[] = [{
    name: 'Logic',
    items: logicBlocks,
    i18nKey: 'coreLibs.logic',
    opened: true
}];
/** An array of categories of blocks to be used in UI */
export const blocksLibrary: blockMenu[] = [];
/** A flat map of all the currently known blocks' declarations */
export const blocksRegistry: Map<string, blockDeclaration> = new Map();

const addBlockToRegistry = (block: blockDeclaration): void => {
    blocksRegistry.set(`${block.lib}@@${block.code}`, block);
};
const removeBlockFromRegistry = (block: blockDeclaration): void => {
    blocksRegistry.set(`${block.lib}@@${block.code}`, block);
};
export const getDeclaration = (lib: string, code: string): blockDeclaration =>
    blocksRegistry.get(`${lib}@@${code}`);
const loadBuiltinBlocks = (): void => {
    blocksLibrary.push(...builtinBlockLibrary);
    for (const category of builtinBlockLibrary) {
        category.items.forEach(addBlockToRegistry);
    }
};

/**
 * Used for cleanup during disabling catmods; maps module names to their category of blocks.
 */
const loadedCategories: Map<string, blockMenu> = new Map();

export const loadModdedBlocks = async (modName: string) => {
    const path = join(getModulePathByName(modName), 'types.d.ts');
    try {
        fs.access(path, fs.constants.R_OK);
        const usefuls = await parseFile(path);
        const blocks = convertFromDtsToBlocks(usefuls, modName);
        const category: blockMenu = {
            name: modName,
            items: blocks,
            opened: false,
            i18nKey: modName
        };
        blocks.forEach(addBlockToRegistry);
        loadedCategories.set(modName, category);
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.debug(`[catnip] Skipping the catmod ${modName} as it doesn't have a types.d.ts file.`);
        } else {
            console.error(err);
        }
    }
};

export const unloadModdedBlocks = (modName: string) => {
    if (loadedCategories.has(modName)) {
        const cat = loadedCategories.get(modName);
        blocksLibrary.splice(blocksLibrary.indexOf(cat), 1);
        cat.items.forEach(removeBlockFromRegistry);
    }
};
/**
 * Resets the list of modded blocks and loads all the blocks from the enabled modules.
 */
export const loadAllModdedBlocks = async (project: IProject) => {
    blocksLibrary.length = 0;
    loadedCategories.clear();
    blocksRegistry.clear();
    loadBuiltinBlocks();
    await Promise.all(Object.keys(project.libs).map(loadModdedBlocks));
};
