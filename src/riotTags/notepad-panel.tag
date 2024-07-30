notepad-panel#notepad.aPanel.dockright(class="{opened: opened}")
    ul.aNav.tabs.nogrow.nb(ref="tabs")
        li(onclick="{changeTab('notepadlocal')}" class="{active: tab === 'notepadlocal'}")
            svg.feather
                use(xlink:href="#edit")
            span {voc.local}
        li(onclick="{changeTab('notepadglobal')}" class="{active: tab === 'notepadglobal'}")
            svg.feather
                use(xlink:href="#clipboard")
            span {voc.global}
        li(onclick="{changeTab('helppages')}" class="{active: tab === 'helppages'}")
            svg.feather
                use(xlink:href="#life-buoy")
            span {voc.helpPages}
        li(onclick="{changeTab('modulespages')}" class="{active: tab === 'modulespages'}" ref="modulesTab")
            svg.feather
                use(xlink:href="#ctmod")
            span {voc.modulesPages}
    div
        div(show="{tab === 'notepadlocal'}")
            .aCodeEditor(ref="notepadlocal")
        div(show="{tab === 'notepadglobal'}")
            .aCodeEditor(ref="notepadglobal")
        div(show="{tab === 'helppages'}")
            iframe(src="https://docs.ctjs.rocks/{getIfDarkTheme()? '?darkTheme=yep' : ''}" ref="helpIframe")
            button.aHomeButton(title="{voc.backToHome}" onclick="{backToHome}")
                svg.feather
                    use(xlink:href="#home")
        div(show="{tab === 'modulespages'}")
            docs-panel

    button.vertical.dockleft.forcebackground(onclick="{notepadToggle}" ref="toggleButton")
        svg.feather
            use(xlink:href="#{opened? 'chevron-right' : 'chevron-left'}")
        span {voc.docsAndNotes}
    script.
        const glob = require('src/node_requires/glob');
        const updateEditor = () => {
            if (this.notepadglobal.getPureValue() !== localStorage.notes) {
                this.notepadglobal.setValue(localStorage.notes);
            }
        };

        this.opened = false;
        this.namespace = 'notepad';
        this.mixin(require('src/node_requires/riotMixins/voc').default);
        this.notepadToggle = function notepadToggle() {
            this.opened = !this.opened;
            if (this.tab === 'notepadglobal') {
                updateEditor();
            }
        };

        const openHelp = () => {
            this.opened = true;
            this.tab = 'helppages';
            this.update();
        };
        window.hotkeys.on('F1', openHelp);
        this.on('unmount', () => {
            window.hotkeys.off('F1', openHelp);
        });

        this.tab = 'notepadlocal';
        this.changeTab = tab => () => {
            if (tab === 'notepadglobal') {
                updateEditor();
            }
            this.tab = tab;
        };
        this.on('update', () => {
            setTimeout(() => {
                if (this.tab && this.refs[this.tab] && this.refs[this.tab].codeEditor) {
                    this.refs[this.tab].codeEditor.layout();
                    if (this.opened) {
                        this.refs[this.tab].codeEditor.focus();
                    }
                }
            }, 0);
        });
        const updateEditorSize = () => {
            if (this.tab && this.refs[this.tab]) {
                this.refs[this.tab].codeEditor.layout();
            }
        };
        window.addEventListener('resize', updateEditorSize);
        window.addEventListener('focus', updateEditor);
        this.on('unmount', () => {
            window.removeEventListener('resize', updateEditorSize);
            window.removeEventListener('focus', updateEditor);
        });

        this.getIfDarkTheme = () =>
            localStorage.UItheme === 'Night' || localStorage.UItheme === 'Horizon';

        const notepadProps = {
            language: 'javascript',
            quickSuggestions: false,
            hover: {
                enabled: false
            },
            lightbulb: {
                enabled: false
            },
            // eslint-disable-next-line id-length
            renderValidationDecorations: 'off',
            fixedOverflowWidgets: false
        };

        this.on('mount', () => {
            setTimeout(() => {
                this.notepadlocal = window.setupCodeEditor(this.refs.notepadlocal, notepadProps);
                this.notepadglobal = window.setupCodeEditor(this.refs.notepadglobal, notepadProps);

                this.notepadglobal.setValue(localStorage.notes);
                this.notepadlocal.setValue(window.currentProject.notes || '');
                this.notepadlocal.onDidChangeModelContent(() => {
                    window.currentProject.notes = this.notepadlocal.getValue();
                    glob.modified = true;
                });
                this.notepadglobal.onDidChangeModelContent(() => {
                    localStorage.notes = this.notepadglobal.getValue();
                });
            }, 0);
        });
        this.on('unmount', () => {
            // Manually destroy the editors to free up the memory
            this.notepadlocal.dispose();
            this.notepadglobal.dispose();
            if (this.server) {
                this.server.close();
                this.server.closeAllConnections();
            }
        });

        var openDocs = e => {
            this.changeTab('helppages')();
            this.opened = true;
            this.update();
        };

        this.backToHome = () => {
            this.refs.helpIframe.contentWindow.location = 'https://docs.ctjs.rocks';
        };

        window.signals.on('openDocs', openDocs);
        this.on('unmount', () => {
            window.signals.off('openDocs', openDocs);
        });
