# Face Features Lab — Female Portrait Edition

**Live lab:** https://duvancalderon.github.io/Demos/English/Face-Features-Lab/

**Main catalog:** https://duvancalderon.github.io/Demos/

## What changed

The laboratory now attempts to load a 3D **female avatar with long dark hair, open eyes and a complete rigged head**, chosen as an approximate visual match for the user's [Tripo portrait reference](https://studio.tripo3d.ai/3d-model/a-high-detail-portrait-of-a-woman-with-long-dark-brown-hair-tan-skin-6a2b7cf8-4071-46d4-9c5a-d293d00af1dd).

**Important:** The original Tripo link did not expose a reusable GLB and could not be fully inspected. The currently used model is **not the Tripo model**, nor a precise recreation. It is the licensed *Priya* character from [Avatar Studio](https://github.com/memoriesrohit/avatar-studio), based on Microsoft's MIT-licensed Rocketbox library.

The model is fetched via `https://memoriesrohit.github.io/avatar-studio/models/priya_casual.glb`, with a fallback to the repository's raw GitHub URL. It is **not stored in this repository**. There is no API key, paid Tripo export or account access involved. The browser needs network access and WebGL; the optional 2D view remains functional without them.

[Female model attribution and MIT license](./ROCKETBOX_NOTICE.md)

## Features and learning modes

- **Explore:** identify 20 English terms on the actual 3D face with selectable markers, definitions, examples and browser pronunciation.
- **Label challenge:** select/drag terms onto the corresponding regions. Mistakes do not count.
- **Skin studio:** add visible teaching overlays for freckles, pores and wrinkles; the dimples slider adjusts face smile/cheek blendshape morphs, when provided in the character.
- **Missions:** five verifiable tasks linked to the active lab state, with hints and feedback.
- **Camera:** full orbit rotation, zoom, front/side/back views, center reset, show/hide markers and 2D fallback.
- **Progress:** stored in localStorage, with explicit reset.

## What is real and what is simplified

- The GLB has actual female face, eyes, hair and body geometry and pre-authored materials/morph targets.
- Landmark marker positions are manually estimated and raycast onto the mesh for teaching purposes; exact anatomical positions are not clinically verified.
- Freckles, wrinkles and pores are simplified procedural overlays, not genuine skin aging or medical simulations.
- The original uploaded photo is used only in the **separate 2D reference mode**.
- The old male scan files are left in `assets/` as legacy references but are no longer loaded by the lab.

## Technologies

HTML5, CSS3, JavaScript modules, Three.js r160, GLTFLoader, OrbitControls, raycasting, pointer interactions, Web Speech API, Canvas2D and localStorage.

## Verification

Checked statically: JavaScript parses, HTML element IDs used by the script are present, a model source exists in the public GitHub repository, paths are coherent, current GitHub `main` has the modifications, and all prior vocabulary concepts are still present. **Real browser visual loading of the remote GLB and interactive WebGL behavior could not be verified from this environment.** If a network or CORS failure occurs, the app explicitly shows its functioning 2D mode.

To use the **exact Tripo-generated face**, export the original as GLB from Tripo and replace the remote model URL with the local GLB path, then recalibrate marker positions.
