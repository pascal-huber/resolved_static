import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { writeFileSync } from 'fs';

export class SitemapCreator {

    constructor(hostname) {
        this.entries = [];
        this.hostname = hostname;
    }

    addEntry(
        url,
        changefreq = 'monthly',
        priority = 0.5,
    ) {
        this.entries.push({
            url: url,
            priority: priority,
            changefreq: changefreq,
        });
    }

    async writeSitemap(file) {
        const stream = new SitemapStream({ hostname: this.hostname })
        let sitemapContent = await streamToPromise(Readable.from(this.entries).pipe(stream)).then((data) =>
            data.toString()
        );
        await writeFileSync(file, sitemapContent);
    }
}
