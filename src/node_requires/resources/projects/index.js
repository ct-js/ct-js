const defaultProject = require('./defaultProject');
const gitignore = require('./gitignore');

const getDefaultProjectDir = function () {
    const path = require('path');
    return path.join(nw.App.startPath, 'projects');
};

module.exports = {
    defaultProject,
    gitignore,
    getDefaultProjectDir
};
