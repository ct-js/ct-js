// @see https://github.com/microsoft/monaco-editor-samples/blob/master/nwjs-amd-v2/index.html
(function loadMonaco() {
    var eRequire = require('monaco-editor/min/vs/loader.js');
    // __dirname == root path of you application
    eRequire.config({
        baseUrl: 'file:///' + global.__dirname.replace(/\\/g, '\\\\') + '/node_modules/monaco-editor/min/'
    });
    // workaround monaco-css not understanding the environment
    self.module = void 0;
    // workaround monaco-typescript not understanding the environment
    self.process.browser = true;

    eRequire(['vs/editor/editor.main'], function onMonacoLoad() {
        window.monaco = global.monaco;

        // Extended typescript tokenizer
        const typescriptTokenizer = require('src/node_requires/typescriptTokenizer.js').language;
        // Extended coffeescript tokenizer & suggestions provider
        const coffeescriptTokenizer = require('src/node_requires/coffeescriptTokenizer.js').language;
        const coffeescriptSuggestions = require('src/node_requires/coffeescriptSuggestionProvider.js');

        themeManager.loadBuiltInThemes();
        // To rollback to a default theme if the set one is inaccessible ⤵
        themeManager.loadTheme();

        // I have no guilt of this solution
        // @see https://github.com/microsoft/monaco-editor/issues/884
        monaco.editor.create(document.createElement('textarea'), {
            language: 'typescript',
            value: '(:'
        });
        monaco.editor.create(document.createElement('textarea'), {
            language: 'coffeescript',
            value: ':)'
        });
        setTimeout(() => {
            monaco.languages.setMonarchTokensProvider('typescript', typescriptTokenizer);
            monaco.languages.setMonarchTokensProvider('coffeescript', coffeescriptTokenizer);
            monaco.languages.registerCompletionItemProvider('coffeescript', coffeescriptSuggestions.atCompletions);
        }, 1000);

        window.signals = window.signals || riot.observable({});
        window.orders = window.orders || riot.observable({});
        window.signals.trigger('monacoBooted');
    });
})();