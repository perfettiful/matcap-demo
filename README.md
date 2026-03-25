# Matcap Material Demo

Live Demo: [https://perfettiful.github.io/matcap-demo/](https://perfettiful.github.io/matcap-demo/)

An interactive Three.js demo exploring **Matcap (Material Capture)** materials - a technique for rendering beautiful materials without scene lights.

## What is a Matcap?

A **Matcap** is a texture that encodes lighting and material properties in a single image of a shaded sphere. Instead of calculating lighting in real-time, the shader simply looks up colors from this texture based on surface normals.

### The Key Insight

**Matcaps don't need lights.** The lighting is "baked" into the texture itself. This demo includes a "Scene Lights" toggle to prove it - turn on the lights and watch the Matcap stay exactly the same while the PBR material changes.

### How It Works

```
1. For each pixel, get the surface normal in view space
2. Map the normal's X,Y components to UV coordinates
3. Sample the matcap texture at those coordinates
4. That's your final color - no lighting math needed!
```

```glsl
// Simplified shader logic
vec3 viewNormal = normalize(normalMatrix * normal);
vec2 uv = viewNormal.xy * 0.5 + 0.5;
vec3 color = texture2D(matcapTexture, uv).rgb;
```

### When to Use Matcaps

| Use Case | Matcap | PBR |
|----------|--------|-----|
| Stylized/artistic rendering | Best choice | Overkill |
| Quick prototyping | Best choice | More setup |
| Mobile/performance-critical | Best choice | Heavier |
| Sculpting preview (ZBrush-style) | Best choice | Not needed |
| Photorealistic rendering | Limited | Best choice |
| Dynamic/moving lights | Not supported | Best choice |
| Real reflections | Not supported | Best choice |

### Limitations

- Lighting doesn't respond to scene lights (by design)
- No real reflections or environment mapping
- Less effective on flat/angular geometry (needs curved surfaces)
- Lighting is view-dependent (always "faces" the camera)

## Features

### Materials
- **20 Matcap Textures** organized by category:
  - Metals: chrome, steel, darkMetal, lightMetal, gold, copper, brass, rosegold
  - Minerals: pearl, obsidian, jade
  - Organic: skin, clay
  - Colors: redGlossy, orange, green, greenTeal, cyan, blue, purple

### Geometry
- 10 shapes: Torus Knot, Sphere, Torus, Icosahedron, Dodecahedron, Octahedron, Capsule, Cylinder, Cone, Teapot

### Environment
- 6 background presets with coordinated platform colors
- Toggle platform visibility

### Lighting Demo
- Scene lights toggle to demonstrate matcap's light-independence
- When enabled: directional light + point light + ambient
- Matcap ignores them, PBR responds

### PBR Comparison
- Side-by-side comparison mode
- Adjustable metalness and roughness for the PBR material
- Shows the difference between baked (matcap) vs calculated (PBR) lighting

### Camera Controls
- Drag to rotate
- Scroll to zoom
- Right-drag to pan
- Zoom In/Out buttons
- Reset View button

## Tech Stack

### Framework
- **[Nuxt 4](https://nuxt.com/)** - Vue.js meta-framework
  - File-based routing
  - Auto-imports for composables
  - Server-side rendering capable

### 3D Graphics
- **[Three.js](https://threejs.org/)** - WebGL 3D library
  - `MeshMatcapMaterial` - The core material type
  - `MeshStandardMaterial` - For PBR comparison
  - `OrbitControls` - Camera interaction
  - `PMREMGenerator` - Environment map generation

### Styling
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS
  - CSS-first configuration with `@theme`
  - Custom color tokens
  - Glass morphism effects

### Links
- [Three.js MeshMatcapMaterial Docs](https://threejs.org/docs/#api/en/materials/MeshMatcapMaterial)
- [Three.js Matcap Example](https://threejs.org/examples/#webgl_materials_matcap)
- [nidorx/matcaps](https://github.com/nidorx/matcaps) - Huge free matcap library (textures used here)
- [Matcap Observable Gallery](https://observablehq.com/@makio135/matcaps) - Browse matcaps visually

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open in browser
open http://localhost:3000
```

## Project Structure

```
matcap-demo/
├── app/
│   └── app.vue              # Main UI component
├── composables/
│   └── useMatcapScene.ts    # Three.js scene logic
├── assets/
│   └── css/main.css         # Tailwind config + custom styles
├── public/
│   ├── favicon.svg
│   └── matcaps/             # 20 PNG textures (1024x1024)
│       ├── chrome.png
│       ├── gold.png
│       └── ...
├── nuxt.config.ts
└── package.json
```

## Controls Reference

| Control | Action |
|---------|--------|
| Left-drag | Rotate camera |
| Scroll | Zoom in/out |
| Right-drag | Pan camera |
| Zoom In button | Step zoom in |
| Zoom Out button | Step zoom out |
| Reset View | Return to default camera position |

## Matcap Textures

All textures are 1024x1024 PNG files sourced from [nidorx/matcaps](https://github.com/nidorx/matcaps).

| Texture | Description |
|---------|-------------|
| chrome | Bright chrome/mirror finish |
| steel | Brushed steel |
| darkMetal | Dark gunmetal |
| lightMetal | Light silver |
| gold | Yellow gold |
| copper | Warm copper |
| brass | Antique brass |
| rosegold | Pink gold |
| pearl | Iridescent pearl |
| obsidian | Dark glass |
| jade | Green jade stone |
| skin | Flesh tone (subsurface look) |
| clay | Matte clay/ceramic |
| redGlossy | Glossy red |
| orange | Warm orange |
| green | Fresh green |
| greenTeal | Blue-green |
| cyan | Bright cyan |
| blue | Cool blue |
| purple | Deep purple |

## Creating Your Own Matcaps

1. **In Blender**: Render a sphere with your desired material/lighting to a square image
2. **In Photoshop**: Paint a sphere with gradient tools
3. **From photos**: Photograph a chrome ball bearing in your lighting environment
4. **Tools**: [Matcap Studio](https://github.com/kchapelier/matcap-studio) for tweaking existing matcaps

## License

- Code: MIT
- Matcap textures: See [nidorx/matcaps](https://github.com/nidorx/matcaps) for original sources
