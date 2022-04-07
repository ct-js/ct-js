root-tag
    app-view(if="{projectOpened}")
    notepad-panel(if="{projectOpened}")
    dnd-processor(if="{projectOpened}")
    project-selector(if="{!projectOpened}")
    writable-folder-prompt(if="{showWritableFolderPrompt}" onsuccess="{onWritableSelected}")
    script.
        this.projectOpened = false;
        window.signals.on('resetAll', () => {
            global.currentProject = false;
            require('./data/node_requires/glob').modified = false;
            this.projectOpened = false;
            riot.update();
        });
        window.signals.on('projectLoaded', () => {
            require('./data/node_requires/glob').modified = false;
            this.projectOpened = true;
            this.update();
        });

        require('./data/node_requires/platformUtils')
        .getWritableDir()
        .catch(e => {
            console.error(e);
            this.showWritableFolderPrompt = true;
            this.update();
        });

        this.onWritableSelected = () => {
            this.showWritableFolderPrompt = false;
            this.update();
        };

        const stylesheet = document.createElement('style');
        document.head.appendChild(stylesheet);
        const updateStylesheet = () => {
            stylesheet.innerHTML = `
                code, pre {
                    font-family: ${localStorage.fontFamily || 'Iosevka, monospace'};
                    font-variant-ligatures: ${localStorage.codeLigatures === 'off' ? 'none' : 'normal'};
                }
                .monaco-editor .aView-lines.aView-lines {
                    line-height: ${localStorage.codeDense === 'on' ? 1.5 : 1.75};
                }
            `;
        };
        updateStylesheet();
        window.signals.on('codeFontUpdated', updateStylesheet);
