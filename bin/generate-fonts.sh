#!/bin/sh

# Set font variants and paths
project_dir="$(dirname "$(readlink -f "$0")")/../"
font_source_dir="${project_dir}/resources/"
font_target_dir="${project_dir}/static/public/fonts/"
font_prefix="iosevka-term-slab"
font_variants="regular bold italic bolditalic"

# collect glphs from markdown files and mustache templates
glyphs=$(mktemp)
cat content/**/* 2>/dev/null > $glyphs
cat src/templates/* >> $glyphs

# Generate fonts
for variant in $font_variants; do
    font_in="${font_prefix}-${variant}.woff2"
    font_out="${font_prefix}-${variant}.subset.woff2"
    echo "generating ${font_out}..."
    pyftsubset \
        "${font_source_dir}${font_in}" \
        --name-IDs+=0,4,6 \
        --text-file=${glyphs} \
        --flavor=woff2 \
        --output-file="${font_target_dir}/${font_out}"
done
