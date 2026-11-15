# Body Atlas — realistic 3D + 2D English Vocabulary Lab

Live: **https://duvancalderon.github.io/Demos/English/Body-Parts-Lab/**

An English-only virtual lab covering **30 human body parts** from two supplied reference pictures: 17 front-view terms and 13 back-view terms.

## How to learn

1. Choose **2D diagram** or **3D interactive**.
2. Choose **Front** or **Back**, or rotate the 3D body to the desired side.
3. **Explore:** tap a location, hear the English pronunciation using browser speech synthesis, and read an example sentence. In Explore, you may show or hide all names.
4. **Label Lab:** select or drag the matching word to the correct interactive hotspot. Hints are available; they never count as correct placements.
5. **Missions:** complete **19** everyday contextual tasks (eight original front missions, eleven new back missions).
6. Scores, discovered words, correct placements and mission progress are shared across all views via localStorage. Switching views does not reset progress. Use Reset progress to erase saved data.

The 2D diagram works without Internet. The 3D view downloads Three.js modules and an anatomy model from a CDN. You can rotate, zoom, pan, select hotspots with Raycaster and reset the camera. **There is no physical or biomechanical simulation**; this is a visual vocabulary teaching tool.

## Vocabulary

**Front (17):** head, neck, chest, breast, nipple, abdomen, waist, navel, hip, forearm, groin, genitals, thigh, knee, leg, shin, foot.

**Back (13):** nape, shoulder, back, armpit, arm, elbow, small of the back, wrist, buttock, hand, calf, ankle, heel.

The back picture supplied in the request is the source for the rear terms. The names and positions are approximate teaching annotations, not validated clinical coordinates.

## Improved 3D model

The old geometric mannequin is retained as a **backup** only.

The upgraded 3D model attempts to load an anatomically detailed male or female GLB body with a proper surface mesh from the **open-anatomy-3d v0.1.0** model package. The source combines BodyParts3D, HuBMAP and MakeHuman data. It supports front/back orbiting and has GLTFLoader + MeshoptDecoder because the packaged GLBs use EXT_meshopt_compression. Models are 7.6 and 8.1 MB and require an active Internet connection.

GLB URL (male): https://cdn.jsdelivr.net/npm/open-anatomy-3d@0.1.0/models/anatomy-male.glb

GLB URL (female): https://cdn.jsdelivr.net/npm/open-anatomy-3d@0.1.0/models/anatomy-female.glb

3D anatomy marker positions are **approximate annotations** and, where the skin ray meets the external surface, are projected onto it. This improves visual placement but does not make the annotations clinically exact.

If WebGL or the model download fails, use the 2D diagram. A procedural 3D mannequin also serves as a fallback if the realistic model download fails after Three.js has loaded.

## Third-party model attribution and licensing

**Required credit line:**

> Anatomy: BodyParts3D © The Database Center for Life Science (CC BY 4.0); female organs: Human Reference Atlas 3D Reference Organs, HuBMAP (CC BY 4.0); female body: MakeHuman (CC0). Modified by open-anatomy-3d (https://github.com/MervinR07/open-anatomy-3d), CC BY 4.0.

Sources:
- https://github.com/MervinR07/open-anatomy-3d
- https://github.com/MervinR07/open-anatomy-3d/blob/main/ATTRIBUTION.md
- https://github.com/MervinR07/open-anatomy-3d/blob/main/LICENSE-MODELS.md
- https://www.npmjs.com/package/open-anatomy-3d

Original local SVG diagrams and custom teaching logic are authored for this lab. The externally sourced body surface data retains its CC BY 4.0 attribution obligations. This is **for learning English**, not for medical diagnosis.

## Project files

- `index.html`: front and back SVG maps, view selectors, Three.js import map, anatomy credit.
- `styles.css`: responsive styles for both diagrams and the 3D viewport.
- `back-vocabulary.js`: 13 back terms and 11 contextual missions.
- `app.js`: 30-word vocabulary, 19 missions, validation, shared state and drag/drop.
- `model3d.js`: WebGL scene, procedural fallback, anatomical GLB loading, marker projection, camera navigation.
- `README.md`: documentation and license notes.

## Suggested live checks

1. Verify 2D Front shows 17 target positions and 2D Back shows 13.
2. Click the rear `calf` marker; use pronunciation.
3. Open Label Lab, select `wrist`, place it on `elbow`: it must **not** score. Place it correctly.
4. Toggle 2D/3D and Front/Back; progress should remain.
5. In 3D, check that an anatomically detailed model loads (requires network); try both male/female GLB models.
6. Orbit a full turn, zoom, and click both front and back target markers.
7. Request hints and reveal in Label Lab and Missions. They must not complete the current task.
8. Complete all 19 missions; test one incorrect pick per mission.
9. Refresh halfway through a mission; verify progress persists.
10. Test touch and keyboard controls; test Reset progress.

## Validation scope

JavaScript syntax and in-memory simulated application state can be tested using repository source. Neither the 3D GLB rendering, CDN response, performance nor actual mobile gestures should be considered visually verified without a live browser run. GitHub Pages deployment status is checked separately.
