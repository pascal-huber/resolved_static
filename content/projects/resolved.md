---
title: 'Yet another SSG'
description: 'My simple yet powerful static site generator using markdown.'
created: '2023-01-28T12:00:00+01:00'
updated: '2023-01-28T12:00:00+01:00'
tags: ['dev']
---
# NAME

resolved.ch - built with a simple yet powerful static site generator.

# TAGS

<!--##tag_list##-->

# DESCRIPTION

 - Creates pages for all markdown files in the `./content/` folder
 - Creates index files for all directories 
 - Lets you add tags to pages and creates tag lists and index pages for them
 - Generates sitemap.xml
 - Generates atom.xml

# EXAMPLE

The markdown file of this page (`./content/projects/resolved.md`) looks as
follows. 

```yaml
---
title: 'SSG of resolved.ch'
description: 'A simple yet powerful static site generator.'
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

# SEE ALSO

[github.com/pascal-huber/resolved_static](https://github.com/pascal-huber/resolved_static)

[1]: https://mirrors.edge.kernel.org/pub/linux/utils/util-linux/ 