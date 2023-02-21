import Mustache from 'mustache';
import { readFileSync, mkdirSync, writeFileSync, existsSync, fstat } from 'fs';
import { join, dirname } from 'path';
import sass from 'node-sass'
import { FeedCreator } from './feed.js'
import { SitemapCreator } from './sitemap.js'
import { PageChecker } from './page-checker.js';
import {
    md2html,
    getCannonicalURL,
    getFiles,
    getDirectoriesToCreate,
    getAllPaths,
    addToMapCollection,
    subfoldersOf,
} from './util.js'

const distPath = join(process.cwd(), "dist");
const contentPath = join(process.cwd(), "/content");

const base_template = readFileSync("./src/templates/base.mustache", { encoding: 'utf8', flag: 'r' });
const index_template = readFileSync("./src/templates/index.mustache", { encoding: 'utf8', flag: 'r' });
const tag_index_template = readFileSync("./src/templates/tag_index.mustache", { encoding: 'utf8', flag: 'r' });
const tag_site_template = readFileSync("./src/templates/tag_page.mustache", { encoding: 'utf8', flag: 'r' });
const tag_list_template = readFileSync("./src/templates/tag_list.mustache", { encoding: 'utf8', flag: 'r' });
const domain = "resolved.ch"
const globalMeta = {
    author: "Pascal Huber",
    authorEmail: "pascal.huber@resolved.ch",
    pageTitle: domain,
    url: new URL("https://" + domain),
    locale: 'de-CH',
    pageDescription: "This is my personal feed!",
    generationDate: new Date(Date.now()).toLocaleDateString('de-CH'),
    lastUpdated: new Date(0),
};
globalMeta['faviconURL'] = getCannonicalURL(globalMeta.url, "", "favicon.ico");
globalMeta['atomURL'] = getCannonicalURL(globalMeta.url, "", "atom.xml");

const feedCreator = new FeedCreator(globalMeta);
const sitemapCreator = new SitemapCreator(globalMeta.url);
const pageChecker = new PageChecker();

// Read markdown files and store info
var files = await getFiles(contentPath);
var allDirectories = new Set();
allDirectories.add(JSON.stringify({
    full: "",
    name: "",
    parents: [],
}));
var pagesOfDir = new Map();
var pagesOfTag = new Map();
for (var i = 0; i < files.length; i++) {
    let paths = getAllPaths(contentPath, distPath, files[i]);
    let directories = getDirectoriesToCreate(paths.htmlDirRel);
    let parents = directories.get(paths.htmlDirRel)?.parents;
    directories.forEach((x) => allDirectories.add(JSON.stringify(x)));
    let { meta, content } = await md2html(paths.mdFileAbs);
    meta = {
        ...globalMeta, // NOTE: may be overwritten
        ...meta, // NOTE: is  overwritten
        created: new Date(meta.created),
        createdStr: new Date(meta.created).toLocaleDateString(globalMeta.locale),
        updated: new Date(meta.updated),
        updatedStr: new Date(meta.updated).toLocaleDateString(globalMeta.locale),
        content: content,
        parentDirectories: parents,
        url: getCannonicalURL(globalMeta.url, paths.htmlDirRel, paths.htmlFileName),
    }
    if (meta.updated > globalMeta.lastUpdated) {
        globalMeta.lastUpdated = meta.updated;
    }
    let page = {
        paths: paths,
        meta: meta,
    };
    pageChecker.check(page);
    if (!meta.nofeed) {
        feedCreator.addPostToFeed(page);
    }
    if (!meta.noindex) {
        sitemapCreator.addEntry(
            meta.url,
            meta.changefreq || 'monthly',
            meta.siteMapPriority || 0.5,
        )
    }
    addToMapCollection(pagesOfTag, page, meta.tags);
    addToMapCollection(pagesOfDir, page, [paths.htmlDirAbs]);
}

// Prepare tags for rendering
const tag_it = pagesOfTag[Symbol.iterator]();
let tagsCollection = [];
for (const tag of tag_it) {
    tagsCollection.push({
        name: tag[0],
        pages: tag[1],
    });
}
tagsCollection.sort((a, b) => a.name < b.name ? -1 : 1);
tagsCollection[tagsCollection.length - 1].last = true;

// create html files
const pages_it = pagesOfDir[Symbol.iterator]();
for (const pages of pages_it) {
    for (var i = 0; i < pages[1].length; i++) {
        await mkdirSync(pages[1][i].paths.htmlDirAbs, { recursive: true });
        let html = await Mustache.render(base_template, pages[1][i].meta);
        let tag_list_all = await Mustache.render(tag_list_template, {
            tags: tagsCollection,
        })
        html = html.replace("<!--##tag_list_all##-->", tag_list_all);
        let tags = pages[1][i].meta.tags?.map((x) => { return { name: x } })
        tags?.sort((a, b) => a.name < b.name ? -1 : 1);
        if (tags) {
            tags[tags.length - 1].last = true;
        }
        let tag_list = await Mustache.render(tag_list_template, {
            tags: tags,
        });
        html = html.replace("<!--##tag_list##-->", tag_list);
        await writeFileSync(pages[1][i].paths.htmlFileAbs, html);
    }
}

// Create index files
const dir_it = allDirectories[Symbol.iterator]();
for (const dirJSON of dir_it) {
    const dir = JSON.parse(dirJSON);
    const indexFileRel = join(dir.full, "/index.html");
    const indexFileAbs = join(distPath, indexFileRel);
    // NOTE: if a directory contains an index.md, there will be no 
    //       automatically created index page
    if (!existsSync(indexFileAbs)) {
        let parentDirectoriesRel = dir.parents;
        parentDirectoriesRel[parentDirectoriesRel.length - 1].last = true;
        let filesOfDir = pagesOfDir.get(dirname(indexFileAbs));
        let subfolders = subfoldersOf(dir.full);
        const data = {
            ...globalMeta,
            parentDirectories: parentDirectoriesRel,
            subfolders: subfolders,
            filesOfDir: filesOfDir,
            title: dir.full + ' index',
            created: globalMeta.generationDate,
            url: getCannonicalURL(globalMeta.url, dir.full, "index.html"),
        };
        sitemapCreator.addEntry(
            data.url,
            'daily',
        )
        const body = await Mustache.render(index_template, data);
        const html = await Mustache.render(base_template, {
            ...data,
            content: body,
        });
        await writeFileSync(indexFileAbs, html);
    }
}


// Create a tag overview page
const tagIndexData = {
    title: "tags",
    created: globalMeta.generationDate,
    tags: tagsCollection,
    ...globalMeta,
};
const tagIndexDirAbs = join(distPath, "_tags");
const tagIndexFileAbs = join(tagIndexDirAbs, "index.html");
await mkdirSync(tagIndexDirAbs);
const tagIndexBody = await Mustache.render(tag_index_template, tagIndexData);
const tagIndexContent = await Mustache.render(base_template, {
    ...tagIndexData,
    content: tagIndexBody,
    url: getCannonicalURL(globalMeta.url, "_tags", "index.html"),
});
await writeFileSync(tagIndexFileAbs, tagIndexContent);


// Create a page per tag 
for (var tag of tagsCollection) {
    let dirAbs = join(distPath, "_tags", tag.name);
    let fileAbs = join(dirAbs, "index.html")
    await mkdirSync(dirAbs);
    const data = {
        title: "#" + tag.name,
        created: new Date(Date.now()).toLocaleDateString('de-CH'),
        parentDirectories: [
            { name: "tags", full: "_tags/" },
        ],
        pages: tag.pages,
        ...globalMeta,
    };
    const body = await Mustache.render(tag_site_template, data);
    let url = getCannonicalURL(globalMeta.url, "_tags/" + tag.name, "index.html");
    const html = await Mustache.render(base_template, {
        ...data,
        content: body,
        url: url,
    });
    await writeFileSync(fileAbs, html);
}

// generate sitemap
await sitemapCreator.writeSitemap(join(distPath, "sitemap.xml"))

// generate feed
feedCreator.writeFeed(globalMeta, join(distPath, "atom.xml"));

// create stylesheet
sass.render({
    file: "./src/css/style.scss",
    includePaths: ["node_modules"],
}, (err, result) => {
    if (err) {
        console.error(err);
        throw Error();
    }
    const cssDirAbs = join(distPath, "public");
    const cssFileAbs = join(cssDirAbs, "style.css");
    mkdirSync(cssDirAbs);
    writeFileSync(cssFileAbs, result.css);
});