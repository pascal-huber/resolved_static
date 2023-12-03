import * as yaml from 'js-yaml'
import { Page } from './models/page.js';
import * as sass from 'sass'
import { readFileSync, readdirSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import showdown from 'showdown';
import showdownKatex from 'showdown-katex';
import showdownHighlight from 'showdown-highlight';
import { readdir } from 'fs/promises';
import { resolve, join, dirname, relative, extname } from 'path';

export const markdownConverter = new showdown.Converter({
    strikethrough: true,
    tables: true,
    tasklists: true,
    headerLevelStart: 2,
    extensions: [
        showdownKatex({
            throwOnError: true,
        }),
        showdownHighlight({
            pre: true,
            auto_detection: true,
        }),
    ]
});

function filename(path) {
    return path.replace(/^.*[\\\/]/, '');
}

export function getDateString(date, locale) {
    return date.toLocaleDateString(locale, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
}

export async function getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = resolve(dir, dirent.name);
        if(dirent.isDirectory()){
            return getFiles(res);
        } else if(extname(res) == ".md"){
            return res; 
        } else {
            return [];
        }
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

export function getCannonicalURL(baseURL, htmlDirRel, htmlFileName) {
    if (htmlFileName == "index.html") {
        return new URL(join(htmlDirRel) + "/", baseURL);
    } else {
        return new URL(join(htmlDirRel, htmlFileName), baseURL);
    }
}

export function getPathsOfFile(contentPath, distPath, mdFileAbs) {
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

export async function processMarkdownFiles(
    allDirectories,
    pagesOfDir,
    pagesOfTag,
    feedCreator,
    sitemapCreator,
    siteSettings,
){
    var files = await getFiles(siteSettings.contentPath);
    for (var i = 0; i < files.length; i++) {
        let paths = getPathsOfFile(siteSettings.contentPath, siteSettings.distPath, files[i]);
        let directories = getDirectoriesToCreate(paths.htmlDirRel);
        let parents = directories.get(paths.htmlDirRel)?.parents;
        directories.forEach((dir) => allDirectories.add(JSON.stringify(dir)));
        let page = new Page(siteSettings);
        await page.createFromMdFile(
            paths, 
            parents, 
        );
        feedCreator.addPostToFeed(page);
        sitemapCreator.addEntry(page);
        addToMapCollection(pagesOfTag, page, page.tags);
        addToMapCollection(pagesOfDir, page, [paths.htmlDirAbs]);
    }
}

export function readSiteSettings(projectPath){
    let contentPath = join(projectPath, "content");
    let distPath = join(projectPath, "dist");
    const siteSettingsFile = readFileSync(
        join(contentPath, "site.yml"),
        { encoding: 'utf8', flag: 'r' }
    );
    let siteSettings = yaml.load(siteSettingsFile);
    return {
        ...siteSettings,
        contentPath: contentPath,
        distPath: distPath,
        faviconURL: getCannonicalURL(siteSettings.siteUrl, "", "favicon.ico"),
        atomURL: getCannonicalURL(siteSettings.siteUrl, "", "atom.xml"),
        sitemapPath: join(distPath, "sitemap.xml"),
        atomPath: join(distPath, "atom.xml"),
    };
}

export function readTags(pagesOfTag){
    let tagsCollection = [];
    const tag_it = pagesOfTag[Symbol.iterator]();
    for (const tag of tag_it) {
        tagsCollection.push({
            name: tag[0],
            pages: tag[1],
        });
    }
    if(tagsCollection.length > 0){
        tagsCollection.sort((a, b) => a.name < b.name ? -1 : 1);
        tagsCollection[tagsCollection.length - 1].last = true;
    }
    return tagsCollection;
}

export async function writePages(pagesOfDir, tagsCollection, distPath){
    const pages_it = pagesOfDir[Symbol.iterator]();
    for (const pages of pages_it) {
        for (var i = 0; i < pages[1].length; i++) {
            await pages[1][i].write(
                distPath,
                pagesOfDir,
                tagsCollection,
            );
        }
    }
}

export async function writeTagPages(tagsCollection, pagesOfDir, siteSettings){
    for (var tag of tagsCollection) {
        let fileAbsMd = join(siteSettings.contentPath, "tags", tag.name + ".md")
        let page = new Page(siteSettings);
        let paths = getPathsOfFile(siteSettings.contentPath, siteSettings.distPath, fileAbsMd);
        await page.createFromTag(tag, paths, siteSettings);
        await page.write(siteSettings.distPath, pagesOfDir, tagsCollection);
        addToMapCollection(pagesOfDir, page, [page.paths.htmlDirAbs]);
    }
}

export async function writeMissingIndexPages(allDirectories, pagesOfDir, sitemapCreator, siteSettings){
    const dir_it = allDirectories[Symbol.iterator]();
    for (const dirJSON of dir_it) {
        const dir = JSON.parse(dirJSON);
        const indexFileRel = join(dir.full, "/index.html");
        const indexFileAbs = join(siteSettings.distPath, indexFileRel);
        if (!existsSync(indexFileAbs)) {
            let filesOfDir = pagesOfDir.get(dirname(indexFileAbs));
            let page = new Page(siteSettings);
            await page.createFromDir(dir, filesOfDir, siteSettings.distPath);
            await page.write(siteSettings.distPath, pagesOfDir);
            sitemapCreator.addEntry(page);
        }
    }
}

export function writeStyleSheet(siteSettings){
    let sassResult = sass.compile("./src/css/style.scss") ;
    const cssDirAbs = join(siteSettings.distPath, "public");
    mkdirSync(cssDirAbs);
    const cssFileAbs = join(cssDirAbs, "style.css");
    writeFileSync(cssFileAbs, sassResult.css);
}
