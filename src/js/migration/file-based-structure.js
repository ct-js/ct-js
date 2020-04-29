window.migrationProcess = window.migrationProcess || [];

window.migrationProcess.push({
    version: "1.4.0",
    process: (project) =>
        new Promise((resolve) => {
            const fs = require('fs-extra');
            const path = require('path');
            let dir = global.projdir;
            if (global.projdir.indexOf(path.basename(sessionStorage.projname, '.ict')) === -1) {
                dir = path.join(global.projdir, path.basename(sessionStorage.projname, ".ict"));
                console.debug(
                    `Moving ${path.join(global.projdir, sessionStorage.projname)} to ${path.join(
                        dir,
                        sessionStorage.projname,
                    )}`,
                );
                fs.renameSync(path.join(global.projdir, sessionStorage.projname), path.join(dir, sessionStorage.projname));
                global.projdir = dir;
            }
            resolve();
        }),
});
