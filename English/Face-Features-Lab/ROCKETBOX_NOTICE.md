# Female portrait — source, license and reference

The 3D female character used by this lab is **not** exported from Tripo and is not a copy of the private or inaccessible Tripo mesh.

**Reference provided by the user:**
https://studio.tripo3d.ai/3d-model/a-high-detail-portrait-of-a-woman-with-long-dark-brown-hair-tan-skin-6a2b7cf8-4071-46d4-9c5a-d293d00af1dd

This link suggested a female portrait with long dark-brown hair and tan skin, but did not make reusable 3D asset geometry accessible. Accordingly the lab uses a separate, licensed **approximate substitute** with similar general characteristics.

**3D source:** Priya, adapted from the Microsoft Rocketbox Avatar Library, distributed by the open-source Avatar Studio project.

- Original characters: https://github.com/microsoft/Microsoft-Rocketbox
- Reusable GLB and outfit/face-shape adaptations: https://github.com/memoriesrohit/avatar-studio
- Model loaded by the lab: https://memoriesrohit.github.io/avatar-studio/models/priya_casual.glb
- Original README credits: https://github.com/memoriesrohit/avatar-studio/blob/main/THIRD_PARTY_NOTICES.md

### Microsoft Rocketbox Avatar Library — MIT license

Copyright (c) 2020 Microsoft

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Implementation limitations

- The third-party GLB is fetched at runtime, so the 3D view depends on an active Internet connection and an available host.
- A 2D reference mode is included when the 3D model or WebGL cannot load.
- The female character is full-body internally, but the camera focuses on the head to teach facial vocabulary.
- Marker positions are educational approximations and should be visually checked against the loaded geometry.
- The freckles, pores, wrinkles and smile-style dimple controls are illustrations, not medically validated simulations.
