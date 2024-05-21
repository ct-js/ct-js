window.migrationProcess = window.migrationProcess || [];

window.migrationProcess.push({
    version: '5.0.0',
    process: project => new Promise(resolve => {
        const bundleSettings = project.settings.export.bundleAssetTypes;
        if (!('typefaces' in bundleSettings)) {
            bundleSettings.typefaces = bundleSettings.fonts;
            delete bundleSettings.fonts;
        }
        const walker = collection => {
            for (const item of collection) {
                if (item.type === 'font') {
                    item.type = 'typeface';
                    item.fonts = [{
                        weight: item.weight,
                        italic: item.italic,
                        uid: item.uid,
                        origname: item.origname
                    }];
                    item.name = item.typefaceName;
                    delete item.typefaceName;
                    delete item.weight;
                    delete item.italic;
                } else if (item.type === 'folder') {
                    walker(item.entries);
                }
            }
        };
        walker(project.assets);
        resolve();
    })
});
