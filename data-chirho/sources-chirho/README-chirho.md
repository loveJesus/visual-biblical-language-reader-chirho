<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Pinned sources

These are exact upstream bytes for the Proverbs 26:1 lesson, pinned to commits and checked by sha256. `acquisition-manifest-chirho.json` lists every file with its commit, size, hash, license and attribution. `.gitattributes` stops git from converting their line endings, and prettier skips them. The import and its checks are described in `scripts-chirho/import-chirho/README-chirho.md`.

| Folder                   | Upstream                                        | Pinned commit                                                   |
| ------------------------ | ----------------------------------------------- | --------------------------------------------------------------- |
| `morphhb-chirho/`        | https://github.com/openscriptures/morphhb       | `3d15126fb1ef74867fc1434be1942e837932691f` (master, 2024-08-27) |
| `hebrew-lexicon-chirho/` | https://github.com/openscriptures/HebrewLexicon | `21c9add13bc727d3a951361778e97e3ff7afd1ce` (master, 2019-09-02) |

`extracts-chirho/` holds generated evidence for the lesson: the verse's word and punctuation records, the per-segment morphology, the lexicon entries it cites and the comparison with the handoff's pasted verse.

## Licenses and attribution

- The WLC text is public domain. OSHB lemmas and morphology are CC BY 4.0, with the required attribution "Original work of the Open Scriptures Hebrew Bible available at https://github.com/openscriptures/morphhb". See `morphhb-chirho/LICENSE.md`.
- The OSHB Hebrew Lexicon files are CC BY 4.0, and the Brown-Driver-Briggs and Strong's text they carry is public domain. Credit the Open Scriptures Hebrew Bible Project. See `hebrew-lexicon-chirho/readme.md`.
- The lesson states each adaptation and implies no endorsement.

## Findings recorded on 2026-10-26

- `wlc/Prov.xml` has the sha256 the handoff records (`964f99c0…abb161`). The newest tagged release, v.2.2, has different bytes, so the pin is a commit rather than a release.
- The handoff's pasted verse is the NFC form of the source: the same 86 code points with the marks in a different order. The lesson keeps the source's order.
- HebrewStrong.xml and LexicalIndex.xml both point the rain noun (H4306) with patah under the tet, while the verse has qamats and Strong's pronunciation reads maw-tawr'. The spelling is kept as the source gives it, and the lesson notes it.
