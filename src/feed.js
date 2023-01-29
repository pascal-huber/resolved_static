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
            link: globalMeta.url,
        }
    }
    addPostToFeed(page) {
        this.items.push({
            title: page.meta.title,
            id: page.meta.uuid,
            link: page.meta.url,
            date: page.meta.updated, // NOTE: <updated> in atom
            description: page.meta.description, // NOTE: summary in atom
            author: [this.author],
        });
    }
    async writeFeed(globalMeta, file) {
        this.feed = new Feed({
            id: globalMeta.url,
            title: globalMeta.pageTitle,
            description: globalMeta.pageDescription,
            link: globalMeta.url,
            favicon: globalMeta.url + "favicon.ico",
            updated: globalMeta.lastUpdated,  // NOTE: will be overwritten
            feedLinks: {
                atom: globalMeta.url + "atom.xml",
            },
            author: this.author,
        });
        for(var i = 0; i < this.items.length; i++){
            this.feed.addItem(this.items[i]);
        }
        await writeFileSync(file, this.feed.atom1());
    }
}