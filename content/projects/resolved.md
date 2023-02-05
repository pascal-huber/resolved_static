---
title: 'Yet another Static Site Generator'
description: 'My simple yet powerful static site generator using markdown.'
created: '2023-01-28T12:00:00+01:00'
updated: '2023-01-29T23:00:00+01:00'
tags: ['dev']
keywords: ['static site generator', 'SSG', 'resolved.ch', 'Node.js', 'markdown']
---

Creating a homepage which contains more than just my name and e-mail address has
been on my todo list for years. There are many neat frameworks out there to
build static websites and I have tried out some of them but always felt either
limited or totally knocked out by the complexity of the frameworks. I therefore
decided to build a static site generator from scratch to read markdown files and
create a static website from them.

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
title: 'Yet another Static Site Generator'
description: 'My simple yet powerful static site generator using markdown.'
created: '2023-01-28T12:00:00+01:00'
updated: '2023-01-28T12:00:00+01:00'
tags: ['dev']
---

Creating a homepage...

...

# TAGS

<!--##tag_list##-->

```

# TODOS

 - [ ] handle 404
 - [ ] markdown: target=_blank for external links
 - [ ] markdown: check out other markdown variants
 - [ ] fonts: generate fonts with all required glyphs
 - [ ] feed: decide if I want rss2.0 and/or json feeds

# SOURCE CODE

[github.com/pascal-huber/resolved_static](https://github.com/pascal-huber/resolved_static)

# TAGS

<!--##tag_list##-->

[1]: https://nodejs.org/en/