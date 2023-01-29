# RESOLVED.CH

## Run it locally

```
yarn install
yarn build
http-server -c0 ./dist/
```

## To get a date

```
date --iso-8601=seconds
```

## Fonts generated

```
❯ cd static/public/
❯ cat ../../content/**/* >  glyphs.txt
❯ pyftsubset \
        iosevka-term-slab-{regular,bold,italic,bolditalic}.woff2 \
        --name-IDs+=0,4,6 \
        --text-file=./glyphs.txt \
        --flavor=woff2
...
```