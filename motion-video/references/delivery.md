# Delivery

## Export per channel
| Channel | File | Notes |
|---|---|---|
| LinkedIn | H.264 + AAC mp4, 1080x1080 or 1920x1080, 60 fps | Upload a custom thumbnail. Add the .srt if you have captions. |
| X / Twitter | same, under 2:20 | |
| Reels / Shorts / TikTok | 1080x1920, 60 fps | Keep text inside the middle 80% (the platform UI covers the edges). |
| WhatsApp | 1920x1080, 30 fps, CRF about 23 | Large files get recompressed hard when sent as a video. Send the master as a *document* to keep quality, plus a small copy for quick viewing. |
| YouTube / web | 1920x1080 or 3840x2160 | Keep the 4K master (`--keep-scale`). |

Make a smaller copy with: `ffmpeg -i master.mp4 -vf scale=1920:-2 -r 30 -c:v libx264 -crf 23 -preset slow -c:a aac -b:a 128k -movflags +faststart small.mp4`

**Check every delivered file:** its duration, loudness (`ffmpeg -i f.mp4 -af ebur128 -f null -` should read about -14 LUFS), and three frames pulled from the file itself.

## Thumbnail
Render it from the page itself (a still at the strongest frame), or build a dedicated thumbnail scene in the same style: one face or product, one short line of 3 to 6 words, the mark. It must read at phone size. Match the video's aspect ratio.

## The post that goes with it
- **First line:** the hook, the same idea as the video's first line, said differently.
- **3 to 6 short lines:** the before, the after, one real number, and who it helped.
- **One link or one action.** At most 3 hashtags, at the end.
- Write in the person's own voice: plain words, first person, no hype ("thrilled to announce" reads as filler).

## What not to publish
- Internal numbers (revenue, volumes, conversion) unless the person confirms they're public.
- Real customer or staff names, phone numbers, emails or photos: replace them with stand-ins.
- Client and employer logos only where the person has the right to show them.
- Screens of unreleased features without approval.

When in doubt, ask. A video is easy to share and impossible to unshare.
