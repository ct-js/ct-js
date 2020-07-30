window.migrationProcess = window.migrationProcess || [];

window.migrationProcess.push({
    version: '1.4.0',
    // eslint-disable-next-line no-unused-vars
    process: (project) =>
        new Promise((resolve) => {
            const fs = require('fs-extra');
            const path = require('path');

            let dir = global.projdir;

            if (global.projdir.indexOf(path.basename(sessionStorage.projname, '.ict')) === -1) {
                dir = path.join(global.projdir, path.basename(sessionStorage.projname, '.ict'));

                const newPath = path.join(dir, sessionStorage.projname);
                const oldPath = path.join(global.projdir, sessionStorage.projname);

                // eslint-disable-next-line no-console
                console.debug(`Moving ${oldPath} to ${newPath}`, dir);
                fs.renameSync(oldPath, newPath);
                global.projdir = dir;

                setTimeout(() => {
                    // eslint-disable-next-line no-console
                    console.debug('Saving to complete migration');
                    // eslint-disable-next-line no-underscore-dangle
                    document.querySelector('main-menu')._tag.saveProject();
                }, 2000);

                setTimeout(() => {
                    const lastProjects = localStorage.lastProjects ? localStorage.lastProjects.split(';') : [];
                    // eslint-disable-next-line no-console
                    console.debug(`Changing the last project ${oldPath} to ${newPath}`);
                    lastProjects[lastProjects.indexOf(oldPath)] = newPath;
                    localStorage.lastProjects = lastProjects.join(';');
                }, 1500);
            }

            resolve();
        }),
});
