import Mustache from 'mustache';
import matter from 'gray-matter';
import { PageChecker } from './page-checker.js';
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
    markdownConverter,
    getCannonicalURL,
    getDateString,
    subfoldersOf,
} from '../util.js'

const templates = {
    tag_list: readFileSync("./src/templates/tag_list.mustache", { encoding: 'utf8', flag: 'r' }),
    file_list: readFileSync("./src/templates/file_list.mustache", { encoding: 'utf8', flag: 'r' }),
    index: readFileSync("./src/templates/index.mustache", { encoding: 'utf8', flag: 'r' }),
    tag_page: readFileSync("./src/templates/tag_page.mustache", { encoding: 'utf8', flag: 'r' }),
    base: readFileSync("./src/templates/base.mustache", { encoding: 'utf8', flag: 'r' }),
}
const pageChecker = new PageChecker();

export class Page {
    
    constructor(defaults){
        this.author = defaults.author;
        this.locale = defaults.locale;
        this.siteUrl = defaults.siteUrl;
    }

    async write(distPath, pagesOfDir, tagsCollection = []) {
        this.html = await Mustache.render(templates.base, this);
        this.#replace_tag_list_all(tagsCollection);
        this.#replace_files_of(distPath, pagesOfDir);
        this.#replace_tag_list();
        mkdirSync(this.paths.htmlDirAbs, { recursive: true });
        writeFileSync(this.paths.htmlFileAbs, this.html);
    }

    async createFromMdFile(paths, parentDirectories){
        const markdown = readFileSync(paths.mdFileAbs, { encoding: 'utf8', flag: 'r' });
        let { content, data } = matter(markdown);
        this.title = data.title;
        this.tags = data.tags;
        this.created = new Date(data.created);
        this.updated = new Date(data.updated);
        this.parentDirectories = parentDirectories;
        this.changefreq = data.changefreq || 'monthly';
        this.paths = paths;
        this.url = getCannonicalURL(this.siteUrl, paths.htmlDirRel, paths.htmlFileName);
        this.#computeDerivedFields();
        this.content = markdownConverter.makeHtml(content);
        pageChecker.check(this);
    }
    
    async createFromDir(dir, filesOfDir, distPath){
        let parentDirectoriesRel = dir.parents;
        let subfolders = subfoldersOf(dir.full);
        let url = getCannonicalURL(this.siteUrl, dir.full, "index.html");
        this.parentDirectories = parentDirectoriesRel;
        this.changefreq = 'daily';
        this.subfolders = subfolders;
        this.filesOfDir = filesOfDir;
        this.title = dir.name + ' index';
        // TODO: use the paths method in utils, refactorign with others.
        this.paths = {
            htmlDirAbs: join(distPath, dir.full),
            htmlFileAbs: join(distPath, dir.full, "index.html"),
            htmlFileName: 'index.html',
            htmlFileRel: url.pathname?.substring(1),
        };
        this.url = url;
        this.#computeDerivedFields();
        this.content = await Mustache.render(templates.index, this);
    }
    
    async createFromTag(tag, paths) {
        this.title = "#" + tag.name;
        this.parentDirectories = [
            { name: "tags", full: "tags/" },
        ];
        this.pages = tag.pages;
        this.paths = paths;
        this.changefreq = 'daily';
        this.url = getCannonicalURL(this.siteUrl, "tags/", tag.name + ".html");
        this.#computeDerivedFields();
        this.content = await Mustache.render(templates.tag_page, this);
    }
    
    #computeDerivedFields() {
        this.createdStr = this.created ? getDateString(this.created, this.locale) : undefined;   
        this.updatedStr = this.updated ? getDateString(this.updated, this.locale) : undefined;   
    }
    
    #replace_tag_list(){
        let tags = this.tags?.map((x) => { return { name: x } })
        tags?.sort((a, b) => a.name < b.name ? -1 : 1);
        if (tags) {
            tags[tags.length - 1].last = true;
        }
        this.html = this.html.replace(
            "<!--##tag_list##-->",
             Mustache.render(templates.tag_list, {tags: tags}),
        );
    }

    #replace_tag_list_all(tagsCollection){
        this.html = this.html.replace(
            "<!--##tag_list_all##-->",
             Mustache.render(templates.tag_list, {tags: tagsCollection}),
        );
    }
    
    #replace_files_of(distPath, pagesOfDir){
        this.html = this.html.replace(/<!--##files_of\((.*)\)##-->/, (...args) => {
            let pages = pagesOfDir.get(distPath + "/" + args[1]);
            return Mustache.render(
                templates.file_list, 
                pages.sort((a, b) => a.created < b.created ? 1 : -1)
            );
        });
    }

}
