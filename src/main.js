import { FeedCreator } from './models/feed-creator.js'
import { SitemapCreator } from './models/sitemap-creator.js'
import {
    processMarkdownFiles,
    readSiteSettings,
    readTags,
    writePages,
    writeMissingIndexPages,
    writeStyleSheet,
    writeTagPages,
} from './util.js'

const siteSettings = readSiteSettings(process.cwd());
const feedCreator = new FeedCreator(siteSettings);
const sitemapCreator = new SitemapCreator(siteSettings.siteUrl);

// Process content
let allDirectories = new Set();
allDirectories.add(JSON.stringify({full: "tags", name: "tags"}))
let pagesOfDir = new Map();
let pagesOfTag = new Map();
await processMarkdownFiles(
    allDirectories,
    pagesOfDir,
    pagesOfTag,
    feedCreator,
    sitemapCreator,
    siteSettings,
)
const allTags = readTags(pagesOfTag);

// Write output
await writePages(pagesOfDir, allTags, siteSettings.distPath);
await writeTagPages(allTags, pagesOfDir, siteSettings);
await writeMissingIndexPages(
    allDirectories,
    pagesOfDir,
    sitemapCreator,
    siteSettings
);
await sitemapCreator.writeSitemap(siteSettings.sitemapPath)
feedCreator.writeFeed(siteSettings);
writeStyleSheet(siteSettings);
