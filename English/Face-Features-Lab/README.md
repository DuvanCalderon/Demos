# Face Features Lab — Interactive English Vocabulary

**Live laboratory:** https://duvancalderon.github.io/Demos/English/Face-Features-Lab/

**Main catalog:** https://duvancalderon.github.io/Demos/

## What you can do

- **Explore:** inspect 20 face and skin words using direct selection on the model. Each word includes an English definition, example, and optional browser speech.
- **Label challenge:** drag a word onto its matching marker or select a word and click its matching marker. Wrong choices never count as correct.
- **Skin studio:** independently control the visibility of freckles, wrinkles, pores, and dimples. The face texture changes in real time; dimples additionally alter the curved mesh geometry.
- **Missions:** complete five tasks that check actual selection, labeling, and slider state. Hints do not earn credit.
- **View controls:** front, side, back, center, orbit rotation, zoom, and a functional 2D alternative.
- **Progress:** saved in the current browser using localStorage, with an explicit reset action.

The entire interface and learning material are in English.

## Files

- `index.html` — interface, responsive styling, Three.js import map.
- `app.js` — vocabulary, label logic, interactions, state, missions, photo-texture rendering, 3D scene and fallback.
- `face-reference.jpg` — optimized frontal photographic texture derived from the image supplied in the chat.

## Architecture and limits

The 3D scene uses Three.js 0.160.1 from jsDelivr. An Internet connection and WebGL are required for its 3D view. The lab's 2D mode is designed to remain usable without either. No installation or build step is required.

The front face is photo-based, projected onto a procedurally curved grid with simplified nose, cheeks and lips. The rest of the head, hair, bun, ears and neck are approximations based on the frontal image — **not an accurate 3D scan of the person**. The skin-detail sliders are illustrative visual tools, not biological, medical, aging or physical simulations. The original example image has callout lines; some may remain in the compressed reference texture.

## Vocabulary

Hair, skin, eyebrow, eyelash, ear, nose, mole, lip, chin, forehead, temple, eye, cheek, nostril, mouth, jaw, wrinkle, freckle, pore, dimple.

## Verification scope

Checked: JavaScript syntax parsing, all JavaScript-referenced HTML element IDs, no duplicate HTML IDs, 20 word entries, and repository paths and files. Live 3D rendering, real-device drag and drop, mobile responsiveness and actual GitHub Pages deployment were **not** confirmed through a browser session. Check those interactively in Chrome or Edge once the Pages deployment updates.

## Credits

Based on a user-provided educational reference photograph. No external 3D assets or third-party images are used. Three.js is distributed through its own CDN and retains its original project license.