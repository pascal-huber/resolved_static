import matter from 'gray-matter';
import { readFileSync, readdirSync } from 'fs';
import showdown from 'showdown';
import showdownHighlight from 'showdown-highlight';
import { readdir } from 'fs/promises';
import { resolve, join, dirname, relative } from 'path';

const markdownConverter = new showdown.Converter({
    strikethrough: true,
    tables: true,
    tasklists: true,
    extensions: [showdownHighlight({
        pre: true
        , auto_detection: true
    })]
});

function filename(path) {
    return path.replace(/^.*[\\\/]/, '');
}

export async function md2html(mdFileAbs) {
    const markdown = readFileSync(mdFileAbs, { encoding: 'utf8', flag: 'r' });
    let { content, data } = await matter(markdown);
    return {
        meta: data,
        content: markdownConverter.makeHtml(content)
    };
}

export async function getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return Array.prototype.concat(...files);
}

export function getDirectoriesToCreate(htmlDirRel) {
    let folders = htmlDirRel.split('/').filter((x) => x)
    let dirs = new Map();
    let prevPath = "";
    let parents = [];
    for (var i = 0; i < folders.length; i++) {
        let newPath = join(prevPath, folders[i]);
        let entry = {
            full: newPath,
            name: folders[i],
        };
        entry = { ...entry };
        parents.push(entry);
        entry['parents'] = JSON.parse(JSON.stringify(parents));
        dirs.set(newPath, entry);
        prevPath = newPath;
    }
    return dirs;
}

export function subfoldersOf(dir) {
    let absDir = join(process.cwd(), "dist", dir);
    return readdirSync(absDir, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((item) => { return { path: join(dir, item.name), name: item.name } });
}

export function getAllPaths(contentPath, distPath, mdFileAbs) {
    let paths = {};
    paths['mdFileAbs'] = mdFileAbs;
    paths['mdFileRel'] = relative(contentPath, mdFileAbs);
    paths['mdFileName'] = filename(mdFileAbs);
    paths['htmlFileName'] = paths['mdFileName'].replace('.md', '.html');
    paths['mdDirAbs'] = dirname(mdFileAbs);
    paths['mdDirRel'] = relative(contentPath, paths['mdDirAbs']);
    paths['htmlDirRel'] = paths['mdDirRel'];
    paths['htmlDirAbs'] = join(distPath, paths['htmlDirRel']);
    paths['htmlFileAbs'] = join(paths['htmlDirAbs'], paths['htmlFileName']);
    paths['htmlFileRel'] = join(paths['htmlDirRel'], paths['htmlFileName']);
    return paths;
}

export function addToMapCollection(map, value, keys) {
    if (!keys || !value) { return; }
    for (var i = 0; i < keys.length; i++) {
        if (map.has(keys[i])) {
            var value_tmp = map.get(keys[i]);
            value_tmp.push(value);
            map.set(keys[i], value_tmp);
        } else {
            map.set(keys[i], [value]);
        }
    }
}