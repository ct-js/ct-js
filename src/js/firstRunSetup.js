(function () {// first-launch setup
    if (!localStorage.fontSize) {
        localStorage.fontSize = 18;
        localStorage.lastProjects = '';
        localStorage.notes = '';
        localStorage.appLanguage = 'English';
        localStorage.editorZooming = require('electron').webFrame.getZoomFactor() || 1;
    }
})();
