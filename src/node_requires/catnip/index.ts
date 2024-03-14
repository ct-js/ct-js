import fs from 'fs-extra';
import {join} from 'path';

import {getModulePathByName} from '../resources/modules';
import {convertFromDtsToBlocks} from './blockUtils';
import {parseFile} from './declarationExtractor';

import logicBlocks from './stdLib/logic';
import templatesBlocks from './stdLib/templates';

const builtinBlockLibrary: blockMenu[] = [{
    name: 'Templates',
    items: templatesBlocks,
    i18nKey: 'coreLibs.templates',
    opened: true
}, {
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
        blocksLibrary.push(category);
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
export const loadAllBlocks = async (project: IProject) => {
    blocksLibrary.length = 0;
    loadedCategories.clear();
    blocksRegistry.clear();
    loadBuiltinBlocks();
    await Promise.all(Object.keys(project.libs).map(loadModdedBlocks));
};


let transmittedBlocks: IBlock[] = [];
let transmissionSource: (IBlock | 'MARKER')[] | Record<string, IBlock> = [];
let transmissionSourceKey: string;
let cloningMode = false;
let transmissionType: blockDeclaration['type'];
export const getTransmissionType = () => transmissionType;

export const startBlocksTrasmit = (
    blocks: IBlock[],
    source: typeof transmissionSource,
    key?: string,
    cloning?: boolean
) => {
    transmittedBlocks = blocks;
    transmissionType = getDeclaration(blocks[0].lib, blocks[0].code).type;
    transmissionSource = source;
    transmissionSourceKey = key;
    cloningMode = Boolean(cloning);
    console.log('Starting a block transmission with values', blocks, source, key, cloning);
};
export const endBlocksTransmit = (
    destination: typeof transmissionSource,
    index: number | string
) => {
    console.log('Finishing a block transmission with values', destination, index);
    if (!cloningMode) {
        // Remove from the old object
        if (Array.isArray(transmissionSource)) {
            for (const block of transmittedBlocks) {
                // Remove the source blocks but put a marker in place of it
                // to maintain positions while reordering blocks inside the same container.
                transmissionSource.splice(transmissionSource.indexOf(block), 1, 'MARKER');
            }
        } else {
            delete transmissionSource[transmissionSourceKey];
        }
    } else {
        transmittedBlocks = structuredClone(transmittedBlocks);
    }
    if (Array.isArray(destination)) {
        destination.splice(index as number, 0, ...transmittedBlocks);
    } else {
        [destination[index]] = transmittedBlocks;
    }
    if (!cloningMode && Array.isArray(transmissionSource)) {
        while (transmissionSource.includes('MARKER')) {
            transmissionSource.splice(transmissionSource.indexOf('MARKER'), 1);
        }
    }
};
