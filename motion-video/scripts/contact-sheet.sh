#!/usr/bin/env bash
# Combine the stills from `record.mjs --stills` into one review image, in time order.
#   bash contact-sheet.sh stillsDir sheet.jpg [columns=4] [tileWidth=640]
set -euo pipefail
dir=$1; out=$2; cols=${3:-4}; tw=${4:-640}
n=$(ls "$dir"/still-*.png | wc -l | tr -d ' ')
rows=$(( (n + cols - 1) / cols ))
ffmpeg -y -loglevel error -pattern_type glob -i "$dir/still-*.png" \
  -vf "scale=${tw}:-2,pad=iw+12:ih+12:6:6:white,tile=${cols}x${rows}:color=white" -frames:v 1 -q:v 3 "$out"
echo "$n stills -> $out (in time order, left to right)"
