import { Feed } from "feed";
import { writeFileSync } from 'fs';

// TODO: feed: add published field to posts?
// TODO: feed: add copyright field, maybe?

export class FeedCreator {
    constructor(globalMeta) {
        this.items = [];
        this.author = {
            name: globalMeta.author,
            email: globalMeta.authorEmail,
            link: globalMeta.url.href,
        }
    }
    addPostToFeed(page) {
        this.items.push({
            title: page.meta.title,
            id: page.meta.url.href,
            link: page.meta.url.href,
            date: page.meta.updated, // NOTE: <updated> in atom
            description: page.meta.description, // NOTE: summary in atom
            content: page.meta.content,
            author: [this.author],
        });
    }
    async writeFeed(globalMeta, file) {
        this.feed = new Feed({
            id: globalMeta.url.href,
            title: globalMeta.pageTitle,
            description: globalMeta.pageDescription,
            link: globalMeta.url.href,
            favicon: globalMeta.faviconURL.href,
            updated: globalMeta.lastUpdated, 
            feedLinks: {
                atom: globalMeta.atomURL.href,
            },
            author: this.author,
        });
        for(var i = 0; i < this.items.length; i++){
            this.feed.addItem(this.items[i]);
        }
        await writeFileSync(file, this.feed.atom1());
    }
}