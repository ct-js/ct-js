//
    Shows a table of a copy's extensions object that is modifiable

    @attribute closestcopy (object)
        The copy to show its extensions object

    @attribute showme (function)
        A function that changes whether this modal is shown

copy-custom-properties-modal
    .panel(ref="widget" style='overflow: auto; max-height: 600px')
        h2 {voc.customProperties}
        button(onclick="{addCustomProperty}") {voc.addProperty}
        table()
            tr
                th {voc.property}
                th {voc.value}
                th
            tr(each="{val, prop in opts.closestcopy.exts}")
                td
                    input(name="copyCustomProp" value='{prop}' onchange="{onTableChange}")
                td
                    input(name="copyCustomValue" value='{val}' onchange="{onTableChange}")
                td
                    button(onclick="{deleteCustomProperty.bind(null, prop)}") {voc.delete}
        button(onclick="{finished}") {voc.ok}
                    
    script.
        /* global net */
        this.namespace = 'copyCustomProperties';
        this.mixin(window.riotVoc);
        if (!this.opts.closestcopy.exts) {
            this.opts.closestcopy.exts = {};
        }
        // an ID to use as newly created property names
        this.currentId = 1;

        this.onTableChange = (e) => {
            // read all properties from the table
            var propElements = document.getElementsByName("copyCustomProp");
            var props = [];
            for (prop of propElements) {
                props.push(prop.value);
            }

            // read all values from the table
            var valueElements = document.getElementsByName("copyCustomValue");
            var values = [];

            for (value of valueElements) {
                // attempt to parse the value
                // only strings will be unparsable with the JSON.parse method
                var trueValue;
                try {
                    trueValue = JSON.parse(value.value); // JSON, number, boolean
                } catch {
                    trueValue = value.value; // string
                }
                values.push(trueValue);
            }
            
            var newExts = {};

            props.forEach((prop, index) => {
                newExts[prop] = values[index];
            });

            this.opts.closestcopy.exts = newExts;
        }

        this.addCustomProperty = (e) => {
            this.opts.closestcopy.exts['' + this.currentId] = '';
            this.currentId++;
        }

        this.deleteCustomProperty = (prop) => {
            delete this.opts.closestcopy.exts[prop];
        }

        this.finished = () => {
            this.opts.showme(false);
        }
