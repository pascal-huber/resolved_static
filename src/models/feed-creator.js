import { Feed } from "feed";
import { writeFileSync } from 'fs';

// TODO: feed: add published field to posts?
// TODO: feed: add copyright field, maybe?

export class FeedCreator {
    constructor(siteSettings) {
        this.items = [];
        this.author = {
            name: siteSettings.author,
            email: siteSettings.authorEmail,
            link: siteSettings.siteUrl.href,
        }
    }
    addPostToFeed(page) {
        if(!page.nofeed){
            this.items.push({
                title: page.title,
                id: page.url.href,
                link: page.url.href,
                date: page.updated, // NOTE: <updated> in atom
                description: page.description, // NOTE: summary in atom
                content: page.content,
                author: [this.author],
            });
        }
    }
    async writeFeed(siteSettings) {
        this.feed = new Feed({
            id: siteSettings.siteUrl.href,
            title: siteSettings.pageTitle,
            description: siteSettings.pageDescription,
            link: siteSettings.siteUrl.href,
            favicon: siteSettings.faviconURL.href,
            updated: siteSettings.lastUpdated, 
            feedLinks: {
                atom: siteSettings.atomURL.href,
            },
            author: this.author,
        });
        for(var i = 0; i < this.items.length; i++){
            this.feed.addItem(this.items[i]);
        }
        await writeFileSync(siteSettings.atomPath, this.feed.atom1());
    }
}
