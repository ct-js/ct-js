window.migrationProcess = window.migrationProcess || [];

window.migrationProcess.push({
    version: '5.0.0',
    process: project => new Promise(resolve => {
        const walker = collection => {
            for (const item of collection) {
                if (item.type === 'font') {
                    if (item.typefaces) {
                        continue;
                    }
                    item.typefaces = [{
                        weight: item.weight,
                        italic: item.italic,
                        uid: item.uid
                    }];
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
