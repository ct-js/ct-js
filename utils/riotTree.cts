/* bun utils/riotTree.cts */

/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path';

const riotTagsDir = './src/riotTags';

// Regex to match Riot.js tag includes
const includeMatch = /\b(?<!\.)([a-z]+(-[a-z]+)+|raw)\b/g;

interface TagTree {
    [tagName: string]: string[];
}

const getTagNames = async (dir: string): Promise<string[]> => {
    const names: string[] = [];
    const entries = await fs.readdir(dir);

    // First pass is getting tag names only (based on filenames)
    await Promise.all(entries.map(async entry => {
        const entryPath = path.join(dir, entry);
        const stat = await fs.stat(entryPath);

        if (stat.isDirectory()) {
            names.push(...await getTagNames(entryPath));
        } else if (stat.isFile() && entry.endsWith('.tag')) {
            const tagName = entry.replace('.tag', '');
            names.push(tagName);
        }
    }));
    return names;
};

const buildTagTree = async (dir: string, tagNames: string[]): Promise<TagTree> => {
    const tree: TagTree = {};
    const entries = await fs.readdir(dir);
    // Second pass is forming a 1-level tree
    await Promise.all(entries.map(async entry => {
        const entryPath = path.join(dir, entry);
        const stat = await fs.stat(entryPath);
        if (stat.isDirectory()) {
            Object.assign(tree, await buildTagTree(entryPath, tagNames));
        } else if (stat.isFile() && entry.endsWith('.tag')) {
            const tagName = entry.replace('.tag', '');
            const content = await fs.readFile(entryPath, 'utf8');
            try {
                const [pug] = content.split(tagName)
                    .slice(1)
                    .join(tagName)
                    .split('script.');
                tree[tagName] = [...new Set(Array
                    .from(pug.matchAll(includeMatch), m => m[1])
                    .filter(name => tagNames.includes(name)))];
            } catch (e) {
                // eslint-disable-next-line no-console
                console.error(content.split(tagName));
                // eslint-disable-next-line no-console
                console.error(tagName);
                throw e;
            }
        }
    }));

    return tree;
};

const printTree = (tree: TagTree, maxDepth = 7): void => {
    // Recursive function to print a node and its subtree
    const printNode = (
        tagName: string,
        prefix: string,
        isLast: boolean,
        depth: number,
        alreadyNoted: string[]
    ) => {
        // Print current node line with the appropriate connector
        console.log(prefix + (isLast ? '╰─' : '├─') + tagName);

        // Stop if we've seen this tag before in the current path (cycle)
        if (alreadyNoted.includes(tagName)) {
            return;
        }

        // If depth limit reached and there are children, show a "(too deep)" placeholder
        if (depth <= 0) {
            const children = tree[tagName] || [];
            if (children.length > 0) {
                console.log(prefix + (isLast ? '    ' : '│   ') + '╰─(too deep)');
            }
            return;
        }

        const children = tree[tagName] || [];
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const childIsLast = i === children.length - 1;

            if (child === tagName) {
                // Self‑reference: print a special line instead of recursing
                console.log(prefix + (isLast ? '    ' : '│   ') + (childIsLast ? '╰─' : '├─') + '(self)');
            } else {
                // Recurse with the updated prefix and depth
                printNode(
                    child,
                    prefix + (isLast ? '    ' : '│   '),
                    childIsLast,
                    depth - 1,
                    [...alreadyNoted, tagName]
                );
            }
        }
    };

    // Find root tags (those not appearing as children of any other tag)
    const allTags = Object.keys(tree);
    const rootTags = allTags.filter(tagName =>
        !allTags.some(parent => tree[parent]?.includes(tagName) && parent !== tagName));

    for (const rootTag of rootTags) {
        // Print the root tag without any connector
        console.log(rootTag);

        const children = tree[rootTag] || [];
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const isLast = i === children.length - 1;
            printNode(child, '', isLast, maxDepth - 1, [rootTag]);
        }
    }
};

const main = async () => {
    const tagNames = await getTagNames(riotTagsDir);
    const tagTree = await buildTagTree(riotTagsDir, tagNames);
    // eslint-disable-next-line no-console
    printTree(tagTree);
};

main();
