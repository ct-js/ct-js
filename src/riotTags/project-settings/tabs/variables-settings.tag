//-
    @attribute [noheading] (atomic)
        Hides the heading of the component.
variables-settings(class="{opts.class}")
    h1(if="{!opts.noheading}") {voc.heading}

    .aTableWrap
        table.aNiceTable
            thead
                tr
                    th {voc.variableName}
                    th {voc.variableType}
                    th {voc.defaultValue}
                    th
            tbody
                tr(each="{variable, index in currentProject.globalVars}")
                    td
                        input(type="text" value="{variable.name}" onchange="{renameVariable(index)}")
                        .error(if="{!vars.validateVariableName(variable.name)}")
                            svg.feather
                                use(xlink:href="#alert-triangle")
                            |
                            |
                            | {voc.invalidName}
                        .error(if="{vars.isReservedName(variable.name)}")
                            svg.feather
                                use(xlink:href="#alert-triangle")
                            |
                            |
                            | {voc.reservedName}
                    td
                        select(value="{variable.type}" onchange="{changeVariableType(index)}")
                            option(value="string") {voc.string}
                            option(value="number") {voc.number}
                            option(value="boolean") {voc.boolean}
                            option(value="raw") {voc.raw}
                    td
                        // Values are always stored as strings — constant values are like
                        // the result of JSON.stringify(value), while raw values will be
                        // templated as is, as direct JS code.
                        input(
                            if="{variable.type === 'number' || variable.type === 'string'}"
                            type="{variable.type === 'number' ? 'number' : 'text'}"
                            class="{monospace: variable.type === 'raw'}"
                            value="{vars.getCleanVariableValue(variable)}"
                            onchange="{updateVariableValue(index)}"
                        )
                        textarea.monospace.wide(
                            if="{variable.type === 'raw'}"
                            value="{vars.getCleanVariableValue(variable)}"
                            onchange="{updateVariableValue(index)}"
                        )
                        label.block.checkbox
                            input(
                                if="{variable.type === 'boolean'}"
                                type="checkbox"
                                checked="{variable.value === 'true'}"
                                onchange="{updateVariableValue(index)}"
                            )
                            span.monospace(if="{variable.type === 'boolean'}") {variable.value}
                    td
                        .anActionableIcon(onclick="{removeVariable(index)}")
                            svg.feather.red
                                use(xlink:href="#delete")
                tr(if="{!currentProject.globalVars.length}")
                    td(colspan="4") {voc.noVariablesYet}
                tr
                    td(colspan="4")
                        button.success.toright(onclick="{vars.addNewVariable}")
                            svg.feather
                                use(xlink:href="#plus")
                            |
                            |
                            span {voc.addVariable}

    p {voc.variablesHint}

    script.
        this.namespace = 'settings.variables';
        this.mixin(require('src/node_requires/riotMixins/voc').default);
        this.mixin(require('src/node_requires/riotMixins/wire').default);

        this.currentProject = window.currentProject;
        this.currentProject.globalVars = this.currentProject.globalVars || [];

        this.vars = require('src/node_requires/resources/projects/variables');

        this.renameVariable = index => e => this.vars.renameVariable(index, e.target.value);
        this.changeVariableType = index => e => this.vars.changeVariableType(index, e.target.value);
        this.updateVariableValue = (index) => e => {
            const variable = this.currentProject.globalVars[index];
            if (variable.type === 'boolean') {
                variable.value = e.target.checked.toString();
            } else if (variable.type === 'number') {
                variable.value = e.target.value;
            } else if (variable.type === 'raw') {
                variable.value = e.target.value;
            } else {
                variable.value = JSON.stringify(e.target.value);
            }
        };
        this.removeVariable = index => () => this.vars.removeVariable(index);
