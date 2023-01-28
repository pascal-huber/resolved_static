import { Feed } from "feed";
import { writeFileSync } from 'fs';

// TODO: feed: decide if I want json and rss2.0 feeds
// TODO: feed: add published field to posts?
// TODO: feed: add copyright field, maybe?
// FIXME: set updated field of feed to newest post, maybe?

export class FeedCreator {
    constructor(globalMeta) {
        this.author = {
            name: globalMeta.author,
            email: globalMeta.authorEmail,
            link: globalMeta.url + "/", // TODO: fix slashes
        }
        this.feed = new Feed({
            id: "feed_id", // FIXME: what is this?
            title: globalMeta.pageTitle,
            description: globalMeta.pageDescription,
            link: globalMeta.url,
            favicon: globalMeta.url + "favicon.ico",
            updated: new Date(Date.now()), 
            feedLinks: {
                atom: "https://resolved.ch/atom", // TODO: is this okay
            },
            author: this.author,
        });
    }
    addPostToFeed(page) {
        this.feed.addItem({
            title: page.meta.title,
            id: page.meta.uuid,
            link: page.meta.url + page.htmlFileName, // TODO: fix slashes  
            date: new Date(page.meta.updated), // NOTE: <updated> in atom
            description: page.meta.description, // NOTE: summar in atom
            author: [this.author],
        });

    }
    async writeFeed(file) {
        // console.log(feed.rss2());
        // console.log(feed.json1());
        await writeFileSync(file, this.feed.atom1());
    }
}


// feed.addItem({
//     title: "Post title",
//     id: "post_id",
//     link: "post url",
//     date: new Date(Date.now()), // NOTE: <updated> in atom
//     description: "post description", // NOTE: summar in atom
//     author: [
//         {
//             name: "Pascal Smith",
//             email: "joesmith@example.com",
//             link: "https://example.com/joesmith"
//         }
//     ],
//     // image: post.image // TODO: ????
// });

// feed.addCategory("Technologie");

// feed.addContributor({
//     name: "Pascal Cruyff",
//     email: "johancruyff@example.com",
//     link: "https://example.com/johancruyff"
// });





