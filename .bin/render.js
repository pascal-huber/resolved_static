// gray-matter if needed
import Mustache from 'mustache';
import * as path from 'path';
import matter from 'gray-matter';
import { readFileSync, readdirSync, mkdirSync, writeFileSync, fstat, existsSync, access } from 'fs';
import { readdir, mkdir } from 'fs/promises';
import showdown from 'showdown';
import showdownHighlight from 'showdown-highlight';
import { resolve } from 'path';

const distPath = process.cwd() + "/dist";
const contentPath = process.cwd() + "/content";

const converter = new showdown.Converter({
    extensions: [showdownHighlight({
        pre: true
        , auto_detection: true
    })]
});

let md2html = async function (file) {
    const markdown = readFileSync(file, { encoding: 'utf8', flag: 'r' });
    let { content, data } = await matter(markdown);
    return {
        meta: data,
        content: converter.makeHtml(content)
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
    mdFilePath = mdFilePath.slice(contentPath.length + 1, mdFilePath.length);
    return distPath + "/" + mdFilePath.substring(0, mdFilePath.lastIndexOf('/'));
}

function getDirectoriesBetween(base, dir) {
    let relative = dir.substring(base.length, dir.length);
    let folders = relative.split('/').filter((x) => x)
    let prev = ""
    var folderItems = [];
    for (var i = 0; i < folders.length; i++) {
        let path = prev + "/" + folders[i];
        let curr = {
            full: path,
            name: folders[i],
            path: JSON.stringify(folderItems)
        };
        folderItems.push(curr);
        prev = path;
    }
    return folderItems;
}

function subfoldersOf(dir) {
    let absDir = process.cwd() + "/dist" + dir;
    return readdirSync(absDir, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((item) => { return {path: dir + "/" + item.name, name: item.name}});
}

// READ PAGES
const files = await getFiles("./content/");
// get pages and directories
var allDirectories = new Set(); // TODO: this should be a Set()
var pagesOfDir = new Map();
var pages = [];
for (var i = 0; i < files.length; i++) {
    const htmlDirAbs = await htmlDirPath(files[i]);
    console.log("### " + htmlDirAbs);
    const fileName = files[i].substring(files[i].lastIndexOf('/'), files[i].length);
    const newFile = htmlDirAbs + fileName.replace('.md', '.html');
    let directories = getDirectoriesBetween(process.cwd() + "/dist", htmlDirAbs.substring(0, htmlDirAbs.length));
    let { meta, content } = await md2html(files[i]);
    meta['created'] = new Date(meta.created).toLocaleDateString('de-CH');
    meta['content'] = content;
    meta['author'] = "Pascal Huber";
    meta['pageTitle'] = "resolved.ch"
    meta['path'] = directories;
    directories.forEach((x) => allDirectories.add(JSON.stringify(x)));
    // TODO: clean this mess up
    let page = {
        originalFile: files[i],
        htmlDirAbs: htmlDirAbs,
        htmlDirAbsRelative: htmlDirAbs.substring(distPath.length, htmlDirAbs.length) + fileName.replace('.md', '.html'),
        fileName: fileName,
        newFile: newFile,
        meta: meta,
        content: content,
    };
    if (pagesOfDir.has(htmlDirAbs)) {
        let pages = pagesOfDir.get(htmlDirAbs);
        pages.push(page)
        console.log("pushing " + pages);
        pagesOfDir.set(htmlDirAbs, pages);
    } else {
        pagesOfDir.set(htmlDirAbs, [page]);
    }
    pages.push(page)
}

// create html files
for (var i = 0; i < pages.length; i++) {
    await mkdirSync(pages[i].htmlDirAbs, { recursive: true });
    const template = readFileSync("./.mustache/site.mustache", { encoding: 'utf8', flag: 'r' });
    const htmlSite = await Mustache.render(template, pages[i].meta);
    await writeFileSync(pages[i].newFile, htmlSite);
}

// create missing index files
// allDirectories = allDirectories.values()
allDirectories = Array.from(allDirectories);
allDirectories = allDirectories.map((x) => JSON.parse(x));
for (var i = 0; i < allDirectories.length; i++) {
    const indexFile = process.cwd() + "/dist" + allDirectories[i].full + "/index.html";
    console.log("checking: " + indexFile);
    // if(!existsSync(indexFile)){
    const template = readFileSync("./.mustache/index.mustache", { encoding: 'utf8', flag: 'r' });
    // console.log(allDirectories[i].path);
    let path = JSON.parse(allDirectories[i].path);
    let searchPath = indexFile.substring(0, indexFile.lastIndexOf('/'));
    // let absPath = process.cwd() + "/dist" + searchPath;
    let files = pagesOfDir.get(searchPath);
    let subfolders = subfoldersOf(allDirectories[i].full);
    console.log("files: " + files);
    const data = { // path: [{name: "asfde", full: "/a'sdf"}]
        path: path,
        subfolders: subfolders,
        files: files,
        title: allDirectories[i].name,
        pageTitle: "resolved.ch",
        created: new Date(Date.now()).toLocaleDateString('de-CH'),
        author: "Pascal Huber",
    };
    const htmlSite = await Mustache.render(template, data);
    await writeFileSync(indexFile, htmlSite);
    // }
}



// // remark().use(html).process(markdown)
// import { unified } from 'unified'
// import remarkParse from 'remark-parse'
// import remarkHtml from 'remark-html'
// let md2html = async function (markdown) {
//     return await unified()
//         .use(remarkParse)
//         .use(remarkHtml, {sanitize: false})
//         .process(markdown);
// }

// //https://github.com/remarkjs/remark-math
// import { unified } from 'unified'
// import remarkParse from 'remark-parse'
// import remarkMath from 'remark-math'
// import remarkRehype from 'remark-rehype'
// import rehypeKatex from 'rehype-katex'
// import rehypeStringify from 'rehype-stringify'
// let md2html = async function (markdown) {
//     return await unified()
//         // .use(remarkParse)
//         // .use(remarkHtml, {sanitize: false})
//         .use(remarkParse)
//         .use(remarkMath)
//         .use(remarkRehype)
//         .use(rehypeKatex)
//         .use(rehypeStringify)
//         .process(markdown);
// }


// const markdown = "Hello **you** <strong>hahah</strong> end. Lift($L$)";
// let h = await md2html(markdown);
// const data = {
//     content: h,
// };
// const template = "{{{content}}}";
// const output = Mustache.render(template, data);

// console.log(output);





// remark example with nested html
// https://unifiedjs.com/learn/recipe/remark-html/
// import {unified} from 'unified'
// import remarkParse from 'remark-parse'
// import remarkRehype from 'remark-rehype'
// import rehypeRaw from 'rehype-raw'
// import rehypeStringify from 'rehype-stringify'

// unified()
//   .use(remarkParse)
//   .use(remarkRehype, {allowDangerousHtml: true})
//   .use(rehypeRaw) // *Parse* the raw HTML strings embedded in the tree
//   .use(rehypeStringify)
//   .process('*emphasis* and <strong>strong</strong>')
//   .then((file) => console.log(String(file)))
//   .catch((error) => {
//     throw error
//   })


