# Body Atlas — Interactive English Body Parts Lab

An English-only, responsive anatomy vocabulary laboratory, built as a small static website.

## Run it

Open **index.html** in a modern desktop or mobile browser. No setup, accounts, dependencies, network connection, or build tooling required.

If GitHub Pages is enabled for the repository with the **main** branch at the root, the expected published URL is:

https://duvancalderon.github.io/Demos/English/Body-Parts-Lab/

## What you can do

**Explore**: click or tap any of 17 interactive body markers, learn the name and definition, hear browser-generated English pronunciation, read a natural sentence, switch schematic female/male silhouettes, and optionally display all map labels.

**Label Lab**: drag a word chip onto an anatomy marker, or click/tap a word then a marker. A wrong placement increments the error count without placing the word or awarding points. Toggle beginner (numbered markers), intermediate, or expert (subtle markers). Request a hint or reveal the target (neither completes the task). Correct placement awards 10 XP, or 5 XP after a hint. You can reset the lab independently.

**Missions**: complete 8 practical everyday scenarios by locating a body area. Incorrect selections leave the scenario active. Hints/reveals reduce reward but do not complete a mission. Correct selection earns 15 XP or 8 XP after a hint.

**Progress**: all discovered words, placed labels, score, and mission progress are saved in browser localStorage. Use Reset progress to erase the saved data.

## Vocabulary

Head, neck, chest, breast, nipple, abdomen, waist, navel, hip, forearm, groin, genitals, thigh, knee, leg, shin, foot.

This lab uses the attached bilingual body-parts illustration from the lesson request as its **content reference**. The entire interface and all learning content are in English. Both displayed silhouettes are schematic 2D illustrations; anatomical target locations are approximations for vocabulary teaching. They are **not diagnostic medical diagrams, scientifically validated simulations, or 3D anatomy models**. Some terms are broad or overlapping in reality (such as chest/breast, groin/genitals, leg/shin).

## Files

- `index.html` — page structure and original SVG silhouettes
- `styles.css` — responsive styling and marker interaction feedback
- `app.js` — vocabulary dataset, activity rules, pointer-event drag and drop, localStorage, and browser speech synthesis

## Interaction & accessibility

- Mouse: click markers; drag chips to markers.
- Touchscreen: tap markers and chips, or hold and drag a chip.
- Keyboard: tab to a word chip, press Enter/Space, then tab to an interactive marker and press Enter/Space.
- Audio uses browser speech synthesis. Available voices depend on device/browser settings; no audio files are downloaded.
- No WebGL or CDN needed. All visuals are local SVG shapes.

## Testing status

Automated checks executed against the actual `app.js` fetched from the GitHub repository (in a mocked DOM/V8 environment):

1. Seventeen unique valid part IDs and rendered target definitions.
2. Eight missions map to valid anatomy terms.
3. Exploration scores a newly discovered word only once.
4. Male/female model state alters silhouette torso geometry.
5. Incorrect label placement does not count; correct placement does.
6. A label cannot be scored twice; revealed locations do not auto-place labels.
7. Hint-reduced XP applies.
8. Hit testing accepts an exact marker position and rejects a distant point.
9. All 17 labels can be placed.
10. Lab reset preserves overall earned XP.
11. Incorrect mission choices do not advance; mission reveal does not auto-complete.
12. Eight correct mission choices complete the round.
13. Replay, localStorage persistence, and full reset behave as expected.

**Limitation:** full live browser visual layout, pointer-device testing, and mobile touchscreen testing were not executed in the available environment. Do not treat the mocked checks as proof of those behaviors. Test them in a browser before relying on a public demonstration.

### Suggested browser smoke test

1. Open the live page; ensure all 17 markers and model switch are visible.
2. Switch both silhouettes, click three anatomy markers, then reload. Their discovery progress should remain.
3. Label Lab: click `shin`, then click `knee`. It must report an error, not a correct placement. Click `shin`: it must count.
4. Drag `foot` from the word bank to the foot marker using mouse, and separately on a touch device.
5. Use Hint and Reveal location; they must not change the correct placement total.
6. Change the difficulty to Expert and return to Beginner without losing correct placements.
7. Missions: select a wrong spot, then the correct spot; only the second advances.
8. Reload during a mission and check persistence. Replay missions, then Reset progress and confirm all counters return to zero.
9. With a keyboard, tab through the word chips and map targets and activate both using Enter.
10. On a phone, make sure the diagram and controls fit without horizontal page overflow.

## License and references

- The anatomy vocabulary and approximate location mapping are adapted from the image supplied by the user in the original request.
- All SVG illustrations and front-end code are original, and there are no external media assets or libraries.
