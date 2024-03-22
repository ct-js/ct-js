import {parseFile} from '../declarationExtractor';
import {convertFromDtsToBlocks} from '../blockUtils';

const filterPatchMenu = (
    menus: blockMenu[],
    blocks: (IBlockCommandDeclaration | IBlockComputedDeclaration)[],
    filterPrefix: string,
    icon: string,
    name: string
) => {
    const filtered = blocks.filter(block => block.code.startsWith(filterPrefix));
    filtered.forEach(b => {
        b.icon = icon;
        b.name = b.name.replace(/^index\./, 'replaceValue');
    });
    menus.push({
        name,
        items: filtered,
        opened: false,
        i18nKey: 'core',
        icon
    });
};

export const loadBlocks = async (): Promise<blockMenu[]> => {
    let parsed = await parseFile('./data/typedefs/ct.d.ts');
    parsed = parsed.filter(d => !/pixi/i.test(d.name));
    for (const useful of parsed) {
        useful.name = useful.name.replace(/^src\/ct.release\/(index\.)?/, '');
        useful.name = useful.name.replace(/([a-zA-Z]+).\1Lib/, '$1');
    }
    const allBlocks = convertFromDtsToBlocks(parsed, 'core');

    const menus: blockMenu[] = [];
    filterPatchMenu(menus, allBlocks, 'templates.', 'template', 'Templates');
    filterPatchMenu(menus, allBlocks, 'rooms.', 'room', 'Rooms');
    filterPatchMenu(menus, allBlocks, 'behaviors.', 'behavior', 'Behaviors');
    filterPatchMenu(menus, allBlocks, 'sounds.', 'music', 'Sounds');
    filterPatchMenu(menus, allBlocks, 'styles.', 'droplet', 'Styles');
    filterPatchMenu(menus, allBlocks, 'backgrounds.', 'image', 'Backgrounds');
    filterPatchMenu(menus, allBlocks, 'emitters.', 'sparkles', 'Emitter tandems');
    filterPatchMenu(menus, allBlocks, 'u.', 'tool', 'Utilities');
    filterPatchMenu(menus, allBlocks, 'inputs.', 'airplay', 'Inputs');
    filterPatchMenu(menus, allBlocks, 'settings.', 'settings', 'Settings');

    return menus;
};
