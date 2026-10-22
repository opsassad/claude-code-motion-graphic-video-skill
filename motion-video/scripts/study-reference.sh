#!/usr/bin/env bash
# Study a reference video frame by frame: pulls frames at N per second and tiles them into
# contact sheets of 30 (5 x 6), in time order, so the whole sequence can be read at a glance.
#   bash study-reference.sh reference.mp4 outDir [framesPerSecond=2]
# Then look at every sheet and write down, per section: camera distance and angle, what text is on
# screen and how big, colour and what it means, how shots join, and the tempo.
set -euo pipefail
src=$1; out=$2; fps=${3:-2}
mkdir -p "$out"
ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate -of compact=p=0 "$src"
ffmpeg -loglevel error -y -i "$src" -vf "fps=${fps},scale=480:-2" "$out/f-%04d.jpg"
n=$(ls "$out"/f-*.jpg | wc -l | tr -d ' ')
sheet=0
for ((start = 1; start <= n; start += 30)); do
  sheet=$((sheet + 1))
  ffmpeg -loglevel error -y -start_number "$start" -i "$out/f-%04d.jpg" \
    -vf "pad=iw+8:ih+8:4:4:white,tile=5x6:color=white" -frames:v 1 -q:v 3 "$out/sheet-$sheet.jpg"
done
echo "$n frames at $fps/s -> $sheet sheet(s) in $out (each sheet = $((30 / fps)) s, left to right, top to bottom)"
