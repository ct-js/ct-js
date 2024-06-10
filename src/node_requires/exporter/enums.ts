import {transform} from 'sucrase';
import {getAllEnumsTypescript} from '../resources/enums';

export const compileEnums = (): string => transform(getAllEnumsTypescript(), {
    transforms: ['typescript']
}).code;
