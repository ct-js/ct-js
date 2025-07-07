const ctFiles = require('src/node_requires/ct-files')

window.migrationProcess.push({
    version: '5.2.2',
    process: project => new Promise(resolve => {
        ctFiles.upgrade_semantic(project, window.projdir, window.projdir + '/.uid_db').then(() => {
            resolve();
        });
    })
});
