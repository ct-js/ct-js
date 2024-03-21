import fs from 'fs-extra';
import {join} from 'path';

import {getModulePathByName} from '../resources/modules';
import {convertFromDtsToBlocks} from './blockUtils';
import {parseFile} from './declarationExtractor';

import logicBlocks from './stdLib/logic';
import mathBlocks from './stdLib/math';
import utilsBlocks from './stdLib/utils';
import miscBlocks from './stdLib/misc';
import hiddenBlocks from './stdLib/hiddenBlocks';
import {loadBlocks} from './stdLib/ctjsApi';

const builtinBlockLibrary: blockMenu[] = [{
    name: 'Logic',
    items: logicBlocks,
    i18nKey: 'coreLibs.logic',
    opened: true,
    icon: 'help-circle'
}, {
    name: 'Math',
    items: mathBlocks,
    i18nKey: 'coreLibs.math',
    opened: true,
    icon: 'sort-numerically'
}, {
    name: 'Utils',
    items: utilsBlocks,
    i18nKey: 'coreLibs.utils',
    opened: true,
    icon: 'tool'
}, {
    name: 'Miscellaneous',
    items: miscBlocks,
    i18nKey: 'coreLibs.misc',
    opened: true
}];
loadBlocks().then(menus => {
    builtinBlockLibrary.unshift(...menus);
});

/** An array of categories of blocks to be used in UI */
export const blocksLibrary: blockMenu[] = [];
/** A flat map of all the currently known blocks' declarations */
export const blocksRegistry: Map<string, blockDeclaration> = new Map();

// Fuzzy search
import {default as Fuse, IFuseOptions, FuseIndex} from 'node_modules/fuse.js';
const fuseOptions: IFuseOptions<blockDeclaration> = {
    keys: [{
        name: 'name',
        weight: 0.7
    }, {
        name: 'lib',
        weight: 0.3
    }],
    findAllMatches: true,
    threshold: 0.3
};
let fuseIndex: FuseIndex<blockDeclaration>,
    fuseCollection: blockDeclaration[];
const recreateFuseIndex = () => {
    fuseCollection = [...blocksRegistry.values()];
    fuseIndex = Fuse.createIndex(fuseOptions.keys, fuseCollection);
};
export const searchBlocks = (query: string): blockDeclaration[] => {
    const fuse = new Fuse(fuseCollection, fuseOptions, fuseIndex);
    return fuse.search(query).map(result => result.item);
};

const addBlockToRegistry = (block: blockDeclaration): void => {
    blocksRegistry.set(`${block.lib}@@${block.code}`, block);
};
const removeBlockFromRegistry = (block: blockDeclaration): void => {
    blocksRegistry.delete(`${block.lib}@@${block.code}`);
};
export const getDeclaration = (lib: string, code: string): blockDeclaration => {
    if (!blocksRegistry.has(`${lib}@@${code}`)) {
        throw new Error(`[catnip] Could not find block declaration for ${lib}@@${code}. Do you have ${lib} catmod enabled?`);
    }
    return blocksRegistry.get(`${lib}@@${code}`);
};

const loadBuiltinBlocks = (): void => {
    blocksLibrary.push(...builtinBlockLibrary);
    for (const category of builtinBlockLibrary) {
        category.items.forEach(addBlockToRegistry);
    }
    hiddenBlocks.forEach(addBlockToRegistry);
};

/**
 * Used for cleanup during disabling catmods; maps module names to their category of blocks.
 */
const loadedCategories: Map<string, blockMenu> = new Map();

export const loadModdedBlocks = async (modName: string, noIndex?: boolean) => {
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
    if (!noIndex) {
        recreateFuseIndex();
    }
};

export const unloadModdedBlocks = (modName: string) => {
    if (loadedCategories.has(modName)) {
        const cat = loadedCategories.get(modName);
        blocksLibrary.splice(blocksLibrary.indexOf(cat), 1);
        cat.items.forEach(removeBlockFromRegistry);
    }
    recreateFuseIndex();
};
/**
 * Resets the list of modded blocks and loads all the blocks from the enabled modules.
 */
export const loadAllBlocks = async (project: IProject) => {
    blocksLibrary.length = 0;
    loadedCategories.clear();
    blocksRegistry.clear();
    loadBuiltinBlocks();
    await Promise.all(Object.keys(project.libs).map(lib => loadModdedBlocks(lib, true)));
    recreateFuseIndex();
};


let transmittedBlocks: IBlock[] = [];
let transmissionSource: (IBlock | 'MARKER')[] | Record<string, IBlock> = [];
let transmissionSourceKey: string;
let cloningMode = false;
let transmissionType: blockDeclaration['type'];
export const getTransmissionType = () => transmissionType;
export const getTransmissionReturnVal = () => {
    const declaration = getDeclaration(
        transmittedBlocks[0].lib,
        transmittedBlocks[0].code
    ) as IBlockComputedDeclaration;
    return declaration.typeHint;
};
/** A block after which a (+) indicator will be placed */
let suggestedTarget: IBlock;
export const getSuggestedTarget = () => suggestedTarget;
export const setSuggestedTarget = (target?: IBlock) => (suggestedTarget = target);

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
};
export const endBlocksTransmit = (
    destination: typeof transmissionSource,
    index: number | string
) => {
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
    suggestedTarget = void 0;
    window.signals.trigger('blockTransmissionEnd');
};
export const blockFromDeclaration = (declaration: blockDeclaration): IBlock => {
    const block: IBlock = {
        lib: declaration.lib,
        code: declaration.code,
        values: {}
    };
    for (const piece of declaration.pieces) {
        if (piece.type === 'blocks') {
            block.values[piece.key] = [] as IBlock[];
        }
    }
    return block;
};
export const insertBlock = (
    dest: BlockScript,
    pos: number,
    declaration: blockDeclaration
): void => {
    dest.splice(pos + 1, 0, blockFromDeclaration(declaration));
};
export const emptyTexture = document.createElement('canvas');
emptyTexture.width = emptyTexture.height = 1;
