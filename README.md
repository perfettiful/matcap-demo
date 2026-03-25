# Matcap Material Demo

Live demo: [https://perfettiful.github.io/matcap-demo/](https://perfettiful.github.io/matcap-demo/)

This project is an interactive Three.js demo for exploring matcap materials in a fast, visual way. It compares matcap shading against standard PBR shading, lets you swap materials, geometry, and environments, and includes a compact control system built for quick inspection.

## What a matcap is

A matcap, short for material capture, stores the look of a lit material inside a single texture. Instead of evaluating scene lighting for every pixel, the shader uses the surface normal to sample that texture.

In practice, that means:

* The material can look polished and expressive with very little setup.
* It is excellent for previews, stylized rendering, and quick iteration.
* It does not react to scene lights the same way a true PBR material does.

This demo makes that tradeoff obvious by showing matcap and PBR side by side on the same object.

## What the app includes

* Fourteen curated matcap textures with a swatch picker.
* Twelve geometry options, including both classic demo forms and more product oriented forms.
* Six environment presets with coordinated platform colors.
* A reactive Sky preset that changes between day and night when lights are toggled.
* Side by side comparison mode for matcap versus PBR.
* A `ViewCube` for orientation, snapping, reset, and focus.
* Small UX details like animated pickers, interaction hints, hover states, keyboard shortcuts, and camera easing.

## Current geometry set

* `Torus Knot`
* `Sphere`
* `Torus`
* `Rounded Cube`
* `Shower Head`
* `Angle Stop Valve`
* `Tub Spout`
* `Lever Handle`
* `Escutcheon Plate`
* `Towel Ring`
* `Handle`
* `Knob`

## Controls

* Left drag rotates the camera.
* Right drag pans the camera.
* Mouse wheel zooms in and out.
* `R` resets the view.
* `F` focuses the object.
* `L` toggles lights.
* `C` toggles comparison mode.
* `P` toggles the side panel.
* Dragging the `ViewCube` or clicking its faces changes camera orientation.

## Getting started

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

For a production build:

```bash
npm run build
```

For a static export:

```bash
npm run generate
```

## Project structure

* `app/app.vue`: Main application shell and UI composition.
* `app/composables/useMatcapScene.ts`: Three.js scene setup, geometry creation, camera logic, lighting, and environment behavior.
* `app/composables/useFlipLabel.ts`: Shared animated label logic for the picker components.
* `app/components/`: UI building blocks such as `ViewCube`, pickers, sliders, toggles, info panel, and accordion sections.
* `app/types/scene.ts`: Scene settings, material data, geometry lists, and environment presets.
* `app/assets/css/main.css`: Global styles and custom control styling.
* `public/matcaps/`: Matcap texture assets used by the demo.

## Tech stack

* [Nuxt 4](https://nuxt.com/)
* [Vue 3](https://vuejs.org/)
* [Three.js](https://threejs.org/)
* [Tailwind CSS 4](https://tailwindcss.com/)
* [lucide-vue-next](https://github.com/lucide-icons/lucide)

## Notes on the implementation

* Most of the custom shapes are generated procedurally in code from basic Three.js geometry primitives.
* The comparison labels on the platform are rendered as flat decals rather than DOM overlays.
* The `Sky` environment background is drawn to a canvas texture so it can respond to the light toggle.
* The `ViewCube` is a separate scene rendered to its own canvas and synced to the main camera quaternion.

## Matcap set

The current set includes:

`chrome`, `brushedNickel`, `nickel`, `steel`, `brass`, `satinGold`, `gold`, `roseGold`, `copper`, `darkBronze`, `bronze`, `gunmetal`, `matteBlack`, `matteWhite`

Textures are sourced from [nidorx/matcaps](https://github.com/nidorx/matcaps).

## Useful references

* [Three.js MeshMatcapMaterial docs](https://threejs.org/docs/#api/en/materials/MeshMatcapMaterial)
* [Three.js matcap example](https://threejs.org/examples/#webgl_materials_matcap)
* [nidorx/matcaps](https://github.com/nidorx/matcaps)

## License

Code is MIT licensed.

Matcap textures follow their original source licensing.
