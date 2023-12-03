import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { writeFileSync } from 'fs';

export class SitemapCreator {

    constructor(url) {
        this.entries = [];
        this.hostname = url.href;
    }

    addEntry(page){
        if(!page.noindex) {
            this.entries.push({
                url: page.url.href,
                changefreq: page.changefreq,
                priority: page.priority || 0.5,
            });
        }
    }

    async writeSitemap(file) {
        const stream = new SitemapStream({ hostname: this.hostname })
        let sitemapContent = await streamToPromise(Readable.from(this.entries).pipe(stream)).then((data) =>
            data.toString()
        );
        await writeFileSync(file, sitemapContent);
    }
}
