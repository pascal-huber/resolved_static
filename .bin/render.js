// gray-matter if needed
import Mustache from 'mustache';
import * as path from 'path';
import matter from 'gray-matter';
import { readFileSync, readdirSync, mkdirSync, writeFileSync, fstat, existsSync, access } from 'fs';
import { readdir, mkdir } from 'fs/promises';
import showdown from 'showdown';
import showdownHighlight from 'showdown-highlight';
import { resolve } from 'path';
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';

const distPath = process.cwd() + "/dist";
const contentPath = process.cwd() + "/content";
const index_template = readFileSync("./.mustache/index.mustache", { encoding: 'utf8', flag: 'r' });
const page_template = readFileSync("./.mustache/site.mustache", { encoding: 'utf8', flag: 'r' });
const domain = "resolved.ch"
const globalMeta = {
    author: "Pascal Huber",
    pageTitle: domain,
}

const markdownConverter = new showdown.Converter({
    extensions: [showdownHighlight({
        pre: true
        , auto_detection: true
    })]
});

let md2html = async function (mdFilePath) {
    const markdown = readFileSync(contentPath + mdFilePath, { encoding: 'utf8', flag: 'r' });
    let { content, data } = await matter(markdown);
    return {
        meta: data,
        content: markdownConverter.makeHtml(content)
    };
}

async function getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return Array.prototype.concat(...files);
}

async function htmlDirPath(mdFilePath) {
    mdFilePath = mdFilePath.slice(1, mdFilePath.length);
    return distPath + "/" + mdFilePath.substring(0, mdFilePath.lastIndexOf('/'));
}

function getDirectoriesToCreate(htmlDirAbs) {
    let relative = htmlDirAbs.substring(distPath.length, htmlDirAbs.length);
    let folders = relative.split('/').filter((x) => x)
    let dirs = new Map();
    let prevPath = "";
    let parents = [];
    for (var i = 0; i < folders.length; i++) {
        let newPath = prevPath + "/" + folders[i];
        let entry = {
            full: newPath,
            name: folders[i],
        };
        parents.push(entry);
        entry = { ...entry };
        entry['parents'] = [...parents];
        dirs.set(newPath, entry);
        prevPath = newPath;
    }
    // console.log("---------#####");
    // console.log(htmlDirAbs);
    // console.log(dirs);
    return dirs;
}

function subfoldersOf(dir) {
    let absDir = process.cwd() + "/dist" + dir;
    return readdirSync(absDir, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((item) => { return { path: dir + "/" + item.name, name: item.name } });
}

// let siteMapEntries = [{ url: '/page-1/',  changefreq: 'daily', priority: 0.3  }]
let siteMapEntries = []

// READ PAGES
var files = await getFiles(contentPath);
files = files.map((file) => file.substring(contentPath.length, file.length));
var allDirectories = new Set();
var pagesOfDir = new Map();
for (var i = 0; i < files.length; i++) {
    const mdFileName = files[i].substring(files[i].lastIndexOf('/'), files[i].length);
    const htmlDirAbs = await htmlDirPath(files[i]);
    const htmlDirRel = htmlDirAbs.substring(distPath.length, htmlDirAbs.length);
    const htmlFileName = mdFileName.replace('.md', '.html');
    const htmlFileAbs = htmlDirAbs + htmlFileName;
    const htmlFileRel = htmlFileAbs.substring(distPath.length, htmlFileAbs.length);
    let directories = getDirectoriesToCreate(htmlDirAbs);
    directories.forEach((x) => allDirectories.add(JSON.stringify(x)));
    let { meta, content } = await md2html(files[i]);
    meta = {
        ...meta,
        ...globalMeta,
        created: new Date(meta.created).toLocaleDateString('de-CH'),
        content: content,
        parentDirectories: directories.get(htmlDirRel)?.parents,
    }
    let page = {
        htmlFileAbs: htmlFileAbs, // needed to render template into it
        htmlFileRel: htmlFileRel, // needed to create link in index page
        htmlDirAbs: htmlDirAbs, // needed to create directory structure
        meta: meta,
    };
    let siteMapEntry = {
        url: htmlFileRel,
        changefreq: 'monthly',
        priority: meta.siteMapPriority || 0.5,
    };
    // TODO: add modified date to sitemap
    siteMapEntries.push(siteMapEntry);
    if (pagesOfDir.has(htmlDirAbs)) {
        let pages = pagesOfDir.get(htmlDirAbs);
        pages.push(page)
        pagesOfDir.set(htmlDirAbs, pages);
    } else {
        pagesOfDir.set(htmlDirAbs, [page]);
    }
}

// create html files
const pages_it = pagesOfDir[Symbol.iterator]();
for (const pages of pages_it) {
    for (var i = 0; i < pages[1].length; i++) {
        await mkdirSync(pages[1][i].htmlDirAbs, { recursive: true });
        const htmlSite = await Mustache.render(page_template, pages[1][i].meta);
        await writeFileSync(pages[1][i].htmlFileAbs, htmlSite);
    }
}


// create missing index files
const dir_it = allDirectories[Symbol.iterator]();
for (const dirJSON of dir_it) {
    const dir = JSON.parse(dirJSON);
    const indexPathRel = dir.full + "/index.html";
    const indexPathAbs = distPath + indexPathRel;
    if (!existsSync(indexPathAbs)) {
        let parentDirectoriesRel = dir.parents;
        let dirAbs = indexPathAbs.substring(0, indexPathAbs.lastIndexOf('/'));
        let filesOfDir = pagesOfDir.get(dirAbs);
        let subfolders = subfoldersOf(dir.full);
        const data = {
            parentDirectories: parentDirectoriesRel,
            subfolders: subfolders,
            filesOfDir: filesOfDir,
            title: dir.name,
            created: new Date(Date.now()).toLocaleDateString('de-CH'),
            ...globalMeta,
        };
        let siteMapEntry = {
            url: indexPathRel,
            changefreq: 'daily',
            priority: 0.5,
        };
        // TODO: add modified date to sitemap
        siteMapEntries.push(siteMapEntry);
        const htmlSite = await Mustache.render(index_template, data);
        await writeFileSync(indexPathAbs, htmlSite);
    }
}

// generate sitemap
const stream = new SitemapStream({ hostname: 'https://' + domain })
let sitemapContent = await streamToPromise(Readable.from(siteMapEntries).pipe(stream)).then((data) =>
    data.toString()
);
await writeFileSync(distPath + "/sitemap.xml", sitemapContent);