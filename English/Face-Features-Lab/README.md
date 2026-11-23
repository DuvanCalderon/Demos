# Face Features Lab — High-Fidelity 3D English Vocabulary

**Open the live lab:** https://duvancalderon.github.io/Demos/English/Face-Features-Lab/

**Main catalog:** https://duvancalderon.github.io/Demos/

## What's new: Real scanned human head, not a photograph on a plane

The original experimental 3D face used a flattened photograph mapped onto curved procedural geometry. That approach has now been replaced with the **Lee Perry-Smith / Infinite Realities photogrammetry head scan**, a real human-head mesh with three native surface maps:

- `assets/LeePerrySmith.glb`: a proper sculpted head with anatomical facial geometry (9,279 vertices and 17,684 triangles).
- `assets/Map-COL.jpg`: diffuse / skin-color texture.
- `assets/normal-map.jpg`: real skin relief / normal map.
- `assets/Map-SPEC.jpg`: skin specular-response map.
- `assets/LeePerrySmith_License.txt`: original Creative Commons Attribution 3.0 Unported license.

These resources are hosted **inside the Demos repository**. The head scan has bald hair and closed eyes; it is not the person from the uploaded picture. This is a deliberate trade-off in favor of an actual scanned human face instead of a pasted photograph or a plastic-looking procedural character.

### Model attribution and license

**“Infinite, 3D Head Scan” by Lee Perry-Smith / Infinite Realities**, licensed under **Creative Commons Attribution 3.0 Unported (CC BY 3.0)**. Based on a work at www.triplegangers.com. Source: [three.js LeePerrySmith model files, revision r169](https://github.com/mrdoob/three.js/tree/r169/examples/models/gltf/LeePerrySmith).

Source credits and license are also presented in the application UI.

## Interactive learning modes

1. **Explore**: select markers attached to the 3D face and hear English vocabulary words.
2. **Label challenge**: click or drag an English label onto the correct location. Wrong matches do not count.
3. **Skin studio**: change freckles, wrinkles and pore emphasis with separate procedural overlays; the dimple control locally deforms vertices of the **scanned 3D geometry**. Effects are educational and not medical or scientific predictions.
4. **Missions**: five challenges with actual state-based success checks and optional hints.

The lab includes 20 vocabulary terms. Camera controls include 360° orbital rotation, zoom, side/back views, center reset and a 2D mode. The 2D mode uses the original diagram photo **as a reference image only**, not as a 3D texture. Progress persists through browser localStorage.

## Implementation

- `index.html`: responsive HTML/CSS interface and Three.js import map.
- `app.js`: 3D glTF loading, model rigging and markers, raycasting, texture materials, real mesh deformation, procedural skin overlays, exercises and progress logic.
- `face-reference.jpg`: 2D reference only.
- `assets/`: licensed 3D scan and native texture maps.

**Requirements:** WebGL + Internet for Three.js scripts. Model and texture assets are local relative URLs and work with GitHub Pages. A fully functional 2D mode remains available if WebGL or the library fails. No installation or build process is needed.

**Real versus simplified:** head geometry and base skin maps are from a real scan. Facial-feature marker coordinates are manually calibrated educational locations. Adjustable freckles, wrinkles and pores are procedurally drawn cues; dimple deformation is a simplified geometric effect, not a medically or mechanically validated facial simulation.

## Validation notes

Code syntax, model GLB metadata, all relative model asset paths, all 20 vocabulary landmark coordinates, and the catalog entry were checked in this update. Browser-based visual 3D validation and actual mouse/touch/WebGL rendering have not been confirmed by an interactive browser session. The GitHub Pages site may take a short time to update following a commit.

