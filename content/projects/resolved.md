---
title: 'resolved.ch'
uuid: '8f0d2036-5eaf-46cc-9732-b3d84cc3311d'
created: '2023-01-24T13:04:00+01:00'
updated: '2023-01-28T15:24:35+01:00'
tags: ['dev']
---
# NAME

resolved.ch - the domain and its website you are looking at right now.

# TAGS

<!--##tag_list##-->

# DESCRIPTION

Creating a new and less minimalistic webpage has been on my mind for a long time. This is my attempt of writing a small yet powerful static site generator.

# FEATURES

 - Generate a static page for all markdown files in `./content/`
 - Generate `index.html` files for directories which don't have a `index.md`
 - Add tags to pages and provide overview
 - Generate sitemap.xml
 - Generate atom.xml

# EXAMPLE

The markdown file of this page (`./content/projects/resolved.md`) looks as
follows. The `uuid` is genereted with `uuidgen` from `util-linux` [[1]].

```yaml
---
title: 'resolved.ch'
uuid: '8f0d2036-5eaf-46cc-9732-b3d84cc3311d'
created: '2023-01-24T13:04:00+01:00'
updated: '2023-01-28T15:24:35+01:00'
tags: ['dev']
---
# NAME

resolved.ch - the domain ...

```

# TODOS

 - [ ] improve favicon/icon, see https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs
 - [ ] handle 404
 - [ ] css/html: check mobile-friendlyness
 - [ ] css: fix indenation for lists
 - [ ] css: decide if I need a light theme
 - [ ] markdown: target=_blank for external links?
 - [ ] markdown: check out other markdown variants
 - [ ] check SEO options
 - [ ] fonts: generate fonts with all required glyphs
 - [ ] feed: decide if I want rss2.0 and/or json feeds




[1]: https://mirrors.edge.kernel.org/pub/linux/utils/util-linux/ 