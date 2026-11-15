# Body Atlas — English Body Parts Laboratory (2D + 3D)

**Live demo:** https://duvancalderon.github.io/Demos/English/Body-Parts-Lab/

A responsive, interactive **English-only** vocabulary learning application for 17 human body areas, now with **both an interactive SVG diagram and an orbitable Three.js 3D model**. The model and diagram are alternate representations of the *same learning state*, not separate quizzes.

## Features

| Feature | 2D SVG | 3D Three.js |
| --- | --- | --- |
| Explore 17 anatomical markers | Yes | Yes |
| Label Lab: select a word, then select its target | Yes | Yes |
| Drag word chips onto valid markers | Yes | Yes |
| Contextual missions with correct/wrong validation | Yes | Yes |
| Shared XP, progress, hints, missions, localStorage | Yes | Yes |
| Male / female educational silhouettes | Yes | Yes |
| English pronunciation (browser text-to-speech) | Yes | Yes |
| Marker names in Explore mode | Yes | Yes |
| 360° camera rotation, zoom and pan | Not applicable | Yes |

The three primary learning modes are **Explore**, **Label Lab**, and **Missions**.

### 3D controls

- Choose **3D interactive** at the top of the anatomy stage. You can switch back to **2D diagram** at any time with no loss of progress.
- Drag the 3D model with the mouse or one finger to orbit (360° around the vertical axis).
- Scroll or pinch to zoom. Use right-drag (or two-finger drag) to pan.
- Use the camera buttons for **45° left/right**, **zoom in/out**, and **reset camera**.
- Click or tap the circular anatomical markers on the **front** of the 3D body. Markers are hidden when the camera faces its back, because they identify front-view anatomy.
- In **Label Lab**, drag a word chip to the visible 3D anatomical marker, or click/tap a chip and then a marker. Both methods use the same validation logic.
- **Show 3D names** is available in Explore mode; labels are suppressed during challenges to avoid revealing the answers. Hints can still reveal one target without completing it.
- **Female / Male** switches two simplified procedural body variations in both views.

### 2D controls

- Click/tap the SVG hotspots; you may also keyboard-tab to the SVG markers and press Enter/Space.
- In Label Lab, drag or tap a chip to match a target.
- Toggle map labels in Explore mode.

### Learning rules

- A discovery awards **2 XP once** for each of the 17 body parts.
- Correct label placements award **10 XP**, or **5 XP after a hint**.
- Correct mission answers award **15 XP**, or **8 XP after a hint**.
- Wrong selections never advance a mission or count as correct labels.
- A hint or highlighted location never completes a step automatically.
- Progress is saved in browser localStorage and shared between both views.
- **Reset progress** clears discoveries, correct placements, missions and XP.

## Files

- `index.html` — UI, SVG illustration, 2D/3D control panels, and the pinned import map.
- `styles.css` — responsive page styling and 3D viewport layout.
- `app.js` — shared vocabulary dataset, both learning modes' validation logic, drag and drop, progress, hints, voice output.
- `model3d.js` — Three.js procedural mannequin, 3D markers, OrbitControls, camera controls, Raycaster-based selection.
- `README.md` — user guide and technical notes.

## Technology, installation and connection

The **2D app works offline** in a local browser, without installing anything.

The **3D view needs internet access** to download the following matched-version ES modules from a CDN:

- `three` at `https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js`
- `three/addons/controls/OrbitControls.js` at `https://cdn.jsdelivr.net/npm/three@0.161.0/examples/jsm/controls/OrbitControls.js`

These are referenced through a native HTML import map. Use a modern browser with WebGL and import-map support. The project is ready to deploy as static files to GitHub Pages; no build step or npm installation is required. For local 3D testing, serve the directory over HTTP using a simple static server if the browser restricts ES modules on `file://` URLs.

If WebGL fails or the CDN is blocked, the **2D lab remains usable**. The 3D pane contains a failure/help notice.

## Accuracy and references

All anatomical names and learning themes come from the **body-parts illustration supplied with the original user request**. The SVG and the Three.js character are **original, schematic educational representations**, not anatomically exact, medically validated 3D assets or biomechanical simulations. The model's proportions and marker locations are approximations for understanding vocabulary. The pelvic region is visually covered. Anatomy can vary, and breast tissue is present in all sexes.

Three.js implementation references:
- Installation / import map: https://threejs.org/manual/#en/installation
- OrbitControls: https://threejs.org/docs/#examples/en/controls/OrbitControls
- Raycaster: https://threejs.org/docs/#api/en/core/Raycaster

## Testing record

- The original 2D lab underwent **21 in-memory learning-rule tests** and **14 simulated user-input tests**.
- Both modified JavaScript files passed syntax parsing checks after adding 3D.
- A simulated Three.js runtime was used to exercise 3D scene initialization (not a physical WebGL test).
- Published files can be inspected and GitHub Pages deployment status checked through GitHub Actions.

**Not claimed:** a real device's mouse/touch input, live WebGL rendering, camera frame rate, or cross-browser visual behavior were not validated with a real interactive browser session. Perform a quick browser smoke test before presenting this as a validated software deliverable.

### Recommended live browser smoke test

1. Open the live URL and select **3D interactive**. Confirm that the 3D body is visible.
2. Drag to rotate a full turn; pinch or scroll to zoom and use Reset camera.
3. Tap **head** on the 3D body in Explore mode; its details should appear and award XP only once.
4. Switch to 2D. The head should still be discovered.
5. Open Label Lab, select `shin`, and deliberately select `knee` in 3D: it must reject the choice.
6. Select the correct `shin` marker. Switch to 2D and verify that placement remains.
7. Drag `foot` onto the 3D foot marker using mouse and, separately, a touchscreen.
8. Request a hint and reveal in Label Lab. Neither should increase the correct count.
9. Start Missions. Try a wrong spot, then the right one. Only the right spot should advance.
10. Reload. Verify persistence. Use Reset progress and confirm all counters are cleared.
