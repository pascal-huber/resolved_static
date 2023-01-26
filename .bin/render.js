// gray-matter if needed
import Mustache from 'mustache';
import * as path from 'path';
import matter from 'gray-matter';

// showdown
// https://github.com/showdownjs/showdown
import { readFileSync, mkdirSync, writeFileSync, fstat } from 'fs';
import { readdir, mkdir } from 'fs/promises';
import showdown from 'showdown'
import { resolve } from 'path';
const converter = new showdown.Converter();
let md2html = async function (file) {
    const markdown = readFileSync(file, { encoding: 'utf8', flag: 'r' });
    let {content, data} = await matter(markdown);
    return {
        data: data,
        content: converter.makeHtml(content)
    };
}

// READ FILES
async function getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    const files = await Promise.all(dirents.map((dirent) => {
        const res = resolve(dir, dirent.name);
        return dirent.isDirectory() ? getFiles(res) : res;
    }));
    return Array.prototype.concat(...files);
}
const files = await getFiles("./content/");

async function getNewDir(p){
    const to_remove = process.cwd() + "/content";
    p = p.slice(to_remove.length + 1, p.length);
    let dir = "./dist/" + p.substring(0, p.lastIndexOf('/'));
    let file = p.substring(p.lastIndexOf('/'), p.length);
    let p2 = await path.join(process.cwd(), dir);
    return p2;
}

// process files
for (var i = 0; i < files.length; i++){
    console.log("----- processing file" + files[i]);
    const newDir = await getNewDir(files[i]);
    await mkdirSync(newDir, {recursive: true});
    const fileName = files[i].substring(files[i].lastIndexOf('/'), files[i].length);
    const newPath = newDir + fileName.replace('.md', '.html');
    // TODO: do something with "meta"
    let {meta, content} = await md2html(files[i]);
    const data = {
        content: content,
    };
    const template = readFileSync("./.mustache/site.mustache", { encoding: 'utf8', flag: 'r' });
    const htmlSite = await Mustache.render(template, data);
    await writeFileSync(newPath, htmlSite);
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


