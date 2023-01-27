// gray-matter if needed
import Mustache from 'mustache';
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
const tag_index_template = readFileSync("./.mustache/tag_index.mustache", { encoding: 'utf8', flag: 'r' });
const tag_site_template = readFileSync("./.mustache/tag_site.mustache", { encoding: 'utf8', flag: 'r' });
const tag_list_template = readFileSync("./.mustache/tag_list.mustache", { encoding: 'utf8', flag: 'r' });
const page_template = readFileSync("./.mustache/site.mustache", { encoding: 'utf8', flag: 'r' });
const domain = "resolved.ch"
const globalMeta = {
    author: "Pascal Huber",
    pageTitle: domain,
}

const markdownConverter = new showdown.Converter({
    // backslashEscapesHTMLTags: true,
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
    let path = distPath + "/" + mdFilePath.substring(0, mdFilePath.lastIndexOf('/'));
    // TODO: this is nasty
    if(path[path.length - 1] == "/"){
        path = path.substring(0, path.length - 1);
    }
    return path;
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


// READ PAGES
let siteMapEntries = []
var files = await getFiles(contentPath);
files = files.map((file) => file.substring(contentPath.length, file.length));
var allDirectories = new Set();
var pagesOfDir = new Map();
var tags = new Map();
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
    siteMapEntries.push(siteMapEntry);
    // TODO: this is a bit redundant with pagesOrDir
    if (meta.tags) {
        for (var ii = 0; ii < meta.tags.length; ii++) {
            if (tags.has(meta.tags[ii])) {
                let pages = tags.get(meta.tags[ii]);
                pages.push(page);
                tags.set(meta.tags[ii], pages);
            } else {
                tags.set(meta.tags[ii], [page]);
            }
        }
    }
    if (pagesOfDir.has(htmlDirAbs)) {
        let pages = pagesOfDir.get(htmlDirAbs);
        pages.push(page)
        pagesOfDir.set(htmlDirAbs, pages);
    } else {
        pagesOfDir.set(htmlDirAbs, [page]);
    }
}

// prepare tag_list
const tag_it = tags[Symbol.iterator]();
let tagsCollection = [];
for (const tag of tag_it) {
    tagsCollection.push({
        name: tag[0],
        pages: tag[1],
    });
}
tagsCollection[tagsCollection.length - 1].last = true;
tagsCollection.sort((a, b) => a.name < b.name ? -1 : 1);

// create html files
const pages_it = pagesOfDir[Symbol.iterator]();
for (const pages of pages_it) {
    for (var i = 0; i < pages[1].length; i++) {
        await mkdirSync(pages[1][i].htmlDirAbs, { recursive: true });
        let rendered = await Mustache.render(page_template, pages[1][i].meta);
        let tag_list_all = await Mustache.render(tag_list_template, {
            tags: tagsCollection,
        })
        let tags = pages[1][i].meta.tags?.map((x) => {return {name: x}})
        if(tags){
            tags[tags.length - 1].last = true;
        }
        let tag_list = await Mustache.render(tag_list_template, {
            tags: tags,
        })
        rendered = rendered.replace("<!--##tag_list_all##-->", tag_list_all);
        rendered = rendered.replace("<!--##tag_list##-->", tag_list);
        await writeFileSync(pages[1][i].htmlFileAbs, rendered);
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

// add tag index page
const data = {
    title: "Tags",
    created: new Date(Date.now()).toLocaleDateString('de-CH'),
    tags: tagsCollection,
    ...globalMeta,
};
await mkdirSync(distPath + "/_tags");
let htmlSite = await Mustache.render(tag_index_template, data);
await writeFileSync(distPath + "/_tags/index.html", htmlSite);


// add a page per tag
for (var tag of tagsCollection) {
    await mkdirSync(distPath + "/_tags/" + tag.name);
    const data = {
        title: "#" + tag.name,
        created: new Date(Date.now()).toLocaleDateString('de-CH'),
        parentDirectories: [
            {name: "Tags", full: "/_tags/"},
        ],
        pages: tag.pages,
        ...globalMeta,
    };
    let htmlSite = await Mustache.render(tag_site_template, data);
    await writeFileSync(distPath + "/_tags/" + tag.name + "/index.html", htmlSite);
}

// generate sitemap
const stream = new SitemapStream({ hostname: 'https://' + domain })
let sitemapContent = await streamToPromise(Readable.from(siteMapEntries).pipe(stream)).then((data) =>
    data.toString()
);
await writeFileSync(distPath + "/sitemap.xml", sitemapContent);
