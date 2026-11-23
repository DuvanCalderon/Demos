# Face Features Lab — Interactive 2D English Vocabulary

**Open the lab:** https://duvancalderon.github.io/Demos/English/Face-Features-Lab/

**Browse all demos:** https://duvancalderon.github.io/Demos/

## Real photographic face

This version **does not contain or load any 3D models, GLB files, WebGL, Three.js, model imports or camera controls**. It uses a clear real-world portrait photograph for the interactive face display, rather than a 3D reconstruction or an annotated facial illustration.

**Photograph:** “One dimple” — Michelle Kathleen Fraser (2010). **CC0 1.0 Universal / Public Domain Dedication**. Wikimedia Commons source: https://commons.wikimedia.org/wiki/File:One_dimple.JPG. The image is loaded from Wikimedia Commons at runtime; an Internet connection is required to display it. No other external scripts or 3D services are required.

The image is not digitally altered. Freckles, wrinkles, pores and additional dimples are **separate transparent Canvas illustrations** superimposed above the photograph, not medical or anatomical simulations. Some features such as the ears are partially hidden by the hairstyle; all markers represent approximate educational locations.

## How to use

1. **Explore:** select any of the 20 markers on the real photo for its name, English explanation and example sentence. Use Pronounce to hear it if the browser supports speech.
2. **Label challenge:** click a vocabulary label, then click the matching marker; or drag the label to the marker. Incorrect choices do not count.
3. **Skin studio:** use sliders to overlay illustrative freckles, wrinkles, pores and dimples. Clear and Compare presets are available.
4. **Missions:** complete five tasks verified against live state. Hints do not count as completed challenges.

The app also includes a searchable-by-eye vocabulary atlas, word discovery tracking, English pronunciation and localStorage progress. It supports mouse, touch and keyboard via button alternatives.

## Files

- `index.html`: responsive page, portrait, controls, educational notice and attribution.
- `app.js`: 20 words, 2D markers, vocabulary interactions, transparent Canvas effects, missions and saved progress.

The obsolete 3D assets are removed from the lab's folder. The real photo is externally hosted (CC0), not a local model asset.

## Validation

Verified statically: JavaScript syntax, all IDs referenced by the JavaScript exist in the HTML, all 20 vocabulary entries and all four active learning modes are retained, and there are no 3D imports or controls. Actual interactive browser rendering and the remote image loading were not visually verified in this environment.
