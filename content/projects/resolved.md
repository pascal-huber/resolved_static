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

Built with Node.js[[1]] it creates pages for all markdown files in the
`./content/` folder before it generates index pages for all directories. It lets
you add tags to pages and automatically creates tag lists and index pages for
them. Furthermore, it creates sitemap.xml and atom.xml.

The markdown files contain a yaml header with the information necessary for
rendering. For example, the one for this page (`./content/projects/resolved.md`)
looks as follows.

```yaml
---
title: 'Yet another SSG'
description: 'My simple yet powerful static site generator using markdown.'
created: '2023-01-28T12:00:00+01:00'
updated: '2023-01-28T12:00:00+01:00'
tags: ['dev']
---
# NAME

resolved.ch - the domain ...

# TAGS

<!--##tag_list##-->

...
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

[1]: https://nodejs.org/en/