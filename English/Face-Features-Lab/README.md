# Face Features Lab — Interactive 2D English Vocabulary

**Live demo:** https://duvancalderon.github.io/Demos/English/Face-Features-Lab/

**GitHub catalog:** https://duvancalderon.github.io/Demos/

## User-supplied portrait

This edition uses the **new photograph provided in the conversation** as the only face reference. The photograph is cropped to emphasize the face, hair, eyes, ears and jaw, and encoded as an efficient WebP image for display on GitHub Pages.

- `face-photo.webp` — the user's supplied portrait, cropped to 196 × 229 px, stored **locally in the repository** (no external image service).
- `index.html` — responsive face stage and user interface.
- `app.js` — all 20 markers, four learning modes, Canvas skin overlays and progress tracking.

The former Wikimedia Commons photo is no longer used. The supplied photo's external provenance and publication permissions have not been independently verified; the user should ensure they have rights to publish it.

The game remains fully **2D**, with no Three.js, WebGL, camera controls or 3D models.

## Learning modes

- **Explore:** click facial markers to learn 20 English words with definitions, examples and optional browser speech.
- **Label Challenge:** choose a label and select the matching marker, or drag it onto the image.
- **Skin Studio:** move sliders to overlay educational examples of freckles, wrinkles, pores and dimples. These drawings do not modify actual facial anatomy.
- **Missions:** five activities whose success checks depend on actions taken, not on hints.

All 20 markers were recalibrated to the new portrait and remain responsive to stage resizing because they use proportional image coordinates. Characteristics that are not actually visible (such as a clearly defined mole or freckles) are **illustrated examples at approximate facial locations**, not assertions about the photographed person.

Progress is stored in `localStorage`. Press `Reset all progress` to clear it. The photo itself displays without Internet after the page and assets have loaded, and the 2D lab requires no CDN scripts.

## Technical verification

The WebP asset's Git blob hash was verified against the locally generated source file before publication. JavaScript syntax, marker count, linked UI IDs, asset paths and catalog-card presence can be checked statically. End-to-end mouse/touch browser testing has not been confirmed in this editing session.
