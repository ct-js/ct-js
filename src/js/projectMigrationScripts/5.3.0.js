window.migrationProcess = window.migrationProcess || [];

window.migrationProcess.push({
    version: '5.3.0',
    process: project => new Promise(resolve => {
        // Global variables are now available in all project languages and have type information.
        project.globalVars = (project.globalVars ?? []).map(varName => ({
            name: varName,
            type: 'raw',
            value: 'undefined'
        }));

        // Catnip scripts will need to be patched to use the new, typed global variable blocks.
        const {walkOverScript} = require('src/node_requires/catnip/index.ts');
        const patcher = block => {
            if (block.lib === 'core.hidden' && block.code === 'global variable') {
                block.code = 'global variable raw';
            }
        };
        const assetWalker = collection => {
            for (const item of collection) {
                if (project.language === 'catnip' &&
                    (item.type === 'behavior' || item.type === 'template' || item.type === 'room')
                ) {
                    for (const event of item.events) {
                        walkOverScript(event.code, patcher);
                    }
                } else if (item.type === 'script' && item.language === 'catnip') {
                    walkOverScript(item.code, patcher);
                } else if (item.type === 'folder') {
                    assetWalker(item.entries);
                }
            }
        };

        assetWalker(project.assets);

        resolve();
    })
});
