catnip-library
    virtual(each="{cat in categories}")
        h2 {cat.name}
        catnip-block(each="{block in cat.items}" block="{({lib: block.lib, code: block.code, values: {}})}")
    script.
        const {blocksLibrary} = require('./data/node_requires/catnip');
        this.categories = blocksLibrary;
