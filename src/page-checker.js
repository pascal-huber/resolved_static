export class PageChecker {
    constructor() {
        this.uniqueTimestampsCreated = new Set();
        this.uniqueTimestampsUpdated = new Set();
    }

    #checkTimestamp(set, date) {
        if (!(date instanceof Date) || isNaN(date)) {
            throw Error("invalid date");
        }
        let dateStr = date.toISOString();
        if (set.has(dateStr)) {
            throw Error("Timestamps must be unique");
        } else {
            set.add(dateStr);
        }
    }

    #checkIsOlder(created, updated) {
        if (created > updated) {
            throw Error("created date can't be greater than updated date");
        }
    }

    check(page) {
        try {
            this.#checkTimestamp(this.uniqueTimestampsCreated, page.meta.created);
            this.#checkTimestamp(this.uniqueTimestampsUpdated, page.meta.updated);
            this.#checkIsOlder(page.meta.created, page.meta.updated);
        } catch (error) {
            console.error("failed to validate page " + page.paths.mdFileAbs);
            console.error(error);
            throw Error(error);
        }
    }
}