import {getByPath} from '../../i18n';
import {assetTypes, exists, getById, getOfType} from '..';
import {getTypescriptEnumName} from '../enums';

const capitalize = (str: string): string => str.slice(0, 1).toUpperCase() + str.slice(1);

export const getFieldsExtends = (): IExtensionField[] => {
    const enums = getOfType('enum');
    const fieldTypeOptions = ['text', 'textfield', 'code', '', 'number', 'sliderAndNumber', 'point2D', '', ...assetTypes, '', 'checkbox', 'color'].map(type => ({
        // eslint-disable-next-line no-nested-ternary
        name: type === '' ?
            '' :
            (assetTypes.includes(type as resourceType) ?
                capitalize(getByPath(`common.assetTypes.${type}.0`) as string) :
                getByPath('common.fieldTypes.' + type)
            ),
        value: type
    }));
    fieldTypeOptions.push(...enums.map(enumAsset => ({
        name: enumAsset.name,
        value: `enum@${enumAsset.uid}`
    })));
    const options: IExtensionField[] = [{
        name: getByPath('settings.content.typeSpecification') as string,
        type: 'table',
        key: 'specification',
        fields: [{
            name: getByPath('settings.content.fieldName'),
            type: 'text',
            key: 'name',
            help: getByPath('settings.content.fieldNameHint')
        }, {
            name: getByPath('settings.content.fieldReadableName'),
            type: 'text',
            key: 'readableName',
            help: getByPath('settings.content.fieldReadableNameHint')
        }, {
            name: getByPath('settings.content.fieldType'),
            type: 'select',
            key: 'type',
            options: fieldTypeOptions,
            default: 'text'
        }, {
            name: getByPath('common.required'),
            type: 'checkbox',
            key: 'required',
            default: false
        }, {
            name: getByPath('settings.content.array'),
            type: 'checkbox',
            key: 'array',
            default: false
        }, {
            name: getByPath('settings.content.fixedLength'),
            type: 'number',
            key: 'fixedLength',
            if: 'array'
        }] as IExtensionField[]
    }];
    return options;
};

export const getExtends = (): IExtensionField[] => [{
    name: getByPath('settings.content.typeName') as string,
    type: 'text',
    key: 'name',
    help: getByPath('settings.content.typeNameHint') as string,
    required: true
}, {
    name: getByPath('settings.content.typeReadableName') as string,
    type: 'text',
    key: 'readableName',
    help: getByPath('settings.content.typeReadableNameHint') as string
}, {
    name: getByPath('settings.content.icon') as string,
    type: 'icon',
    key: 'icon',
    default: 'copy'
}, ...getFieldsExtends()];

export const fieldTypeToTsType: Record<IFieldSchema['type'], string> = {
    checkbox: 'boolean',
    code: 'string',
    color: 'string',
    number: 'number',
    point2D: '[number, number]',
    sliderAndNumber: 'number',
    icon: 'string',
    text: 'string',
    room: 'string',
    sound: 'string',
    tandem: 'string',
    template: 'string',
    texture: 'string',
    textfield: 'string',
    behavior: 'string',
    typeface: 'string',
    script: 'string',
    style: 'string',
    enum: 'string'
};

const getFieldsTsType = (field: IFieldSchema): string => {
    if (!field.type.startsWith('enum@')) {
        return fieldTypeToTsType[field.type];
    }
    return getTypescriptEnumName(getById('enum', field.type.split('@')[1]));
};
const getTsType = (content: IContentType): string => {
    const fields = content.specification
        .map(f => `        /**${f.readableName || f.name}*/
        '${f.name}': ${getFieldsTsType(f)}${f.array ? '[]' : ''};`)
        .join('\n');
    return `
    var ${content.name}: {
${fields}
    }[];`;
};
const getTsTypings = (project: IProject): string =>
    `declare namespace content {
    ${project.contentTypes.map(getTsType).join('\n')}
}`;

let dsHandle: false | [IDisposable, IDisposable] = false;
export const updateContentTypedefs = (project: IProject) => {
    if (dsHandle) {
        dsHandle[0].dispose();
        dsHandle[1].dispose();
        dsHandle = false;
    }
    const ts = monaco.languages.typescript;
    const typedefs = getTsTypings(project);
    dsHandle = [
        ts.javascriptDefaults.addExtraLib(typedefs),
        ts.typescriptDefaults.addExtraLib(typedefs)
    ];
};

export const schemaToExtensions = (schema: IFieldSchema[]): IExtensionField[] => schema
    .map((spec: IFieldSchema) => {
        const field: IExtensionField = {
            key: spec.name || spec.readableName,
            name: spec.readableName || spec.name,
            type: spec.array ? 'array' : (spec.type || 'text'),
            required: spec.required
        };
        if (field.type === 'array') {
            field.arrayType = spec.type || 'text';
            if (spec.fixedLength) {
                field.arrayLength = spec.fixedLength;
            }
            field.default = () => [] as unknown[];
        } else if (field.type === 'sliderAndNumber') {
            field.min = 0;
            field.max = 100;
            field.step = 1;
            field.default = 0;
        } else if (['texture', 'template', 'room', 'sound', 'tandem'].includes(field.type)) {
            field.default = -1;
        } else if (field.type === 'number') {
            field.default = 0;
        }
        return field;
    });


// Checks whether the passed value is a valid reference to an asset or a -1 (empty reference).
const validateRef = (val: unknown): boolean => {
    if (val === -1) {
        return true;
    }
    if (typeof val !== 'string') {
        return false;
    }
    return exists(null, val);
};
// For each field type, map it to a tuple of a validation function and a default value getter.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validationTypeMap: Record<IFieldSchema['type'], [(val: unknown) => boolean, () => any]> = {
    code: [val => typeof val === 'string', () => ''],
    color: [val => typeof val === 'string' && val.startsWith('#'), () => '#ffffff'],
    text: [val => typeof val === 'string', () => ''],
    textfield: [val => typeof val === 'string', () => ''],
    point2D: [val => Array.isArray(val) && val.length === 2 && val.every(elt => typeof elt === 'number'), () => [0, 0]],
    number: [val => typeof val === 'number', () => 0],
    sliderAndNumber: [val => typeof val === 'number', () => 0],
    checkbox: [val => typeof val === 'boolean', () => false],
    icon: [val => typeof val === 'string', () => 'circle'],
    behavior: [validateRef, () => -1],
    typeface: [validateRef, () => -1],
    room: [validateRef, () => -1],
    script: [validateRef, () => -1],
    sound: [validateRef, () => -1],
    style: [validateRef, () => -1],
    tandem: [validateRef, () => -1],
    template: [validateRef, () => -1],
    texture: [validateRef, () => -1],
    enum: [validateRef, () => -1]
};
const enumValidatorTuple: [
    (val: unknown, enumAsset: IEnum) => boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (enumAsset: IEnum) => any
] = [
    (v, enumAsset) => enumAsset.values.includes(v as string),
    enumAsset => enumAsset.values[0]
];
const extendsValidationTypeMap: Record<
    Exclude<IExtensionField['type'], 'h1' | 'h2' | 'h3' | 'h4'>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [(val: unknown) => boolean, () => any]
> = {
    ...validationTypeMap,
    slider: [val => typeof val === 'number', () => 0],
    radio: [val => typeof val === 'string', () => ''],
    group: [val => typeof val === 'object', () => ({})],
    table: [val => Array.isArray(val), () => []],
    select: [val => typeof val === 'string', () => ''],
    array: [val => Array.isArray(val), () => []]
};

/**
 * Checks whether the target object has its values suiting the types of schema's fields
 * and resets values to default ones if they are invalid.
 */
export const fixContentFields = (schema: IFieldSchema[], target: Record<string, unknown>): void => {
    for (const field of schema) {
        let val = target[field.name];
        const ftype = field.type;

        // Get the validation function and the default value getter for this field type.
        let validator, defaultValue, enumAsset: IEnum | undefined;
        if (ftype.startsWith('enum@')) {
            // Enumerations have a special type identifier that contains
            // the id of the used enumeration.
            [validator, defaultValue] = enumValidatorTuple;
            const [, id] = ftype.split('@');
            getById('enum', id);
        } else {
            [validator, defaultValue] = validationTypeMap[ftype];
        }

        if (field.array) {
            if (!Array.isArray(val)) {
                target[field.name] = [];
                val = target[field.name];
            }
            const elts = val as unknown[];
            target[field.name] = elts
                .map(v => (validator(v, enumAsset!) ? v : defaultValue(enumAsset!)));
        } else if (!validator(val, enumAsset!)) {
            target[field.name] = defaultValue(enumAsset!);
        }
    }
};

export const fixExtensionFields = (schema: IExtensionField[], target: Record<string, unknown>): void => {
    for (const field of schema) {
        const {key} = field;
        if (field.type === 'array') {
            target[key] = target[key]
        }
    }
};
