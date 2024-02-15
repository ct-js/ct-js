/* eslint-disable no-use-before-define */
import ts from 'typescript';
import fs from 'fs-extra';
import path from 'path';

const paramConstTypeMap: Partial<Record<ts.SyntaxKind, blockArgumentType>> = {
    [ts.SyntaxKind.AnyKeyword]: 'any',
    [ts.SyntaxKind.BooleanKeyword]: 'boolean',
    [ts.SyntaxKind.NumberKeyword]: 'number',
    [ts.SyntaxKind.StringKeyword]: 'string',
    [ts.SyntaxKind.Unknown]: 'any'
};

const usefulMap = {
    [ts.SyntaxKind.FunctionDeclaration]: 'command' as const,
    [ts.SyntaxKind.PropertySignature]: 'computed' as const
};

type usableDeclaration = {
    kind: 'computed' | 'command';
    name: string;
    returnType?: string;
    description?: string;
    jsDoc?: ts.JSDoc[];
    node: ts.Node;
}

const simplifyJsDoc = (jsDoc: ts.JSDoc[] | void): string | void => {
    if (!jsDoc) {
        return void 0;
    }
    return jsDoc.map<string>(doc => (Array.isArray(doc.comment) ?
        (doc.comment as ts.NodeArray<ts.JSDocComment>)
            .map(comment => comment)
            .join('\n') :
        doc.comment as string))
    .join('\n\n');
};

const visit = (
    node: ts.Node,
    topLevelPath: string,
    onUseful: ((useful: usableDeclaration) => void)
) => {
    switch (node.kind) {
    case ts.SyntaxKind.ModuleDeclaration: {
        console.log(node.kind, ts.SyntaxKind[node.kind], node);
        const moduleName = (node as ts.ModuleDeclaration).name.text;
        ts.forEachChild(node, child => visit(child, `${topLevelPath}.${moduleName}`, onUseful));
    } break;
    case ts.SyntaxKind.ModuleBlock:
        ts.forEachChild(node, child => visit(child, `${topLevelPath}`, onUseful));
        break;
    case ts.SyntaxKind.FirstStatement: {
        const first = node as ts.VariableStatement;
        if (first.declarationList && first.declarationList.declarations.length) {
            for (const declaration of first.declarationList.declarations) {
                const {name} = declaration;
                onUseful({
                    name: `${topLevelPath}.${(name as any).escapedText}`,
                    kind: 'computed',
                    returnType: paramConstTypeMap[
                        declaration.type.kind as keyof typeof paramConstTypeMap
                    ] ?? (declaration.type as any).escapedText ?? 'any',
                    description: (first as any).jsDoc?.[0].comment,
                    jsDoc: (first as any).jsDoc,
                    node
                });
            }
        }
    } break;
    case ts.SyntaxKind.PropertySignature:
    case ts.SyntaxKind.FunctionDeclaration: {
        const {name, type, jsDoc} = (node as (
                ts.PropertySignature |
                ts.FunctionDeclaration
            ) & {jsDoc: ts.JSDoc[]});
        let args;
        if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
            args = (node as ts.FunctionDeclaration).parameters.map(param => {
                let tsType = (param.type as any)?.typeName?.escapedText ?? 'any';
                if (ts.isToken(param.type)) {
                    tsType = paramConstTypeMap[
                        param.type.kind as keyof typeof paramConstTypeMap
                    ] ?? 'any';
                }
                return {
                    name: (param.name as any).escapedText,
                    type: tsType
                };
            });
        }
        const useful: usableDeclaration = {
            name: `${topLevelPath}.${(name as any).escapedText}`,
            kind: usefulMap[node.kind],
            returnType: type,
            args,
            jsDoc,
            node
        };
        const description = simplifyJsDoc(jsDoc);
        if (description) {
            useful.description = description;
        }
        onUseful(useful);
    } break;
    default:
        console.log('skipping', node.kind, ts.SyntaxKind[node.kind], node);
    }
};

export const parseFile = async (filename: string) => {
    const txt = await fs.readFile(filename, 'utf-8');
    const program = ts.createProgram([filename], {}, {
        readFile: () => txt,
        // eslint-disable-next-line id-length
        useCaseSensitiveFileNames: () => true,
        fileExists: () => true,
        getDefaultLibFileName: () => 'browser',
        getCurrentDirectory: () => path.dirname(filename),
        getCanonicalFileName: () => path.basename(filename),
        getSourceFile: (src: string) => ts.createSourceFile(
            path.basename(src),
            txt,
            ts.ScriptTarget.ES2020
        ),
        writeFile: () => {
            void 'noop';
        },
        getNewLine: () => 'LF'
    });
    // const checker = program.getTypeChecker();
    const [sourceFile] = program.getSourceFiles();
    ts.forEachChild(sourceFile, node => visit(node, 'root', useful => console.log(useful)));
};
