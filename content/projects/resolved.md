---
title: 'resolved.ch'
description: 'A simple yet powerful static site generator'
created: '2023-01-28T12:00:00+01:00'
updated: '2023-01-28T12:00:00+01:00'
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
follows. 

```yaml
---
title: 'resolved.ch'
description: 'A simple yet powerful static site generator'
created: '2023-01-28T12:00:00+01:00'
updated: '2023-01-28T12:00:00+01:00'
tags: ['dev']
---
# NAME

resolved.ch - the domain ...

```

# TODOS

 - [ ] handle 404
 - [ ] css/html: check mobile-friendlyness
 - [ ] css: decide if I need a light theme
 - [ ] markdown: target=_blank for external links?
 - [ ] markdown: check out other markdown variants
 - [ ] fonts: generate fonts with all required glyphs
 - [ ] feed: decide if I want rss2.0 and/or json feeds




[1]: https://mirrors.edge.kernel.org/pub/linux/utils/util-linux/ 