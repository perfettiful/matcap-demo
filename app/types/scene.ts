export interface SceneSettings {
  matcap: string
  geometry: string
  environment: string
  showPlatform: boolean
  showLights: boolean
  autoRotate: boolean
  rotationSpeed: number
  comparisonMode: boolean
  pbrMetalness: number
  pbrRoughness: number
  zoomLevel: number
}

export interface MatcapEntry {
  path: string
  color: number
  metalness: number
  roughness: number
}

export interface EnvGradient {
  type: 'gradient'
  stops: { pos: number; color: string }[]
  ground: string
}

export interface EnvSolid {
  type: 'solid'
  color: string
  ground: string
}

export type EnvPreset = EnvGradient | EnvSolid

export const MATCAPS: Record<string, MatcapEntry> = {
  chrome:       { path: '/matcaps/polishedChrome.png',  color: 0xcccccc, metalness: 1.0,  roughness: 0.05 },
  brushedNickel:{ path: '/matcaps/brushedNickel.png',   color: 0xa0a098, metalness: 0.9,  roughness: 0.35 },
  nickel:       { path: '/matcaps/polishedNickel.png',  color: 0xc8c8c8, metalness: 0.95, roughness: 0.1 },
  steel:        { path: '/matcaps/stainlessSteel.png',  color: 0x909098, metalness: 0.85, roughness: 0.25 },
  brass:        { path: '/matcaps/polishedBrass.png',   color: 0xd4a520, metalness: 0.95, roughness: 0.08 },
  satinGold:    { path: '/matcaps/satinBrass.png',      color: 0xc49830, metalness: 0.85, roughness: 0.3 },
  gold:         { path: '/matcaps/polishedGold.png',    color: 0xdbb504, metalness: 1.0,  roughness: 0.05 },
  roseGold:     { path: '/matcaps/roseGold.png',        color: 0xb87050, metalness: 0.9,  roughness: 0.15 },
  copper:       { path: '/matcaps/copper.png',          color: 0xb87333, metalness: 0.95, roughness: 0.12 },
  darkBronze:   { path: '/matcaps/oilRubbedBronze.png', color: 0x3a2518, metalness: 0.7,  roughness: 0.45 },
  bronze:       { path: '/matcaps/antiqueBronze.png',   color: 0x6a4a28, metalness: 0.75, roughness: 0.4 },
  gunmetal:     { path: '/matcaps/gunmetal.png',        color: 0x5a5a60, metalness: 0.9,  roughness: 0.2 },
  matteBlack:   { path: '/matcaps/matteBlack.png',      color: 0x1a1a1a, metalness: 0.8,  roughness: 0.5 },
  matteWhite:   { path: '/matcaps/matteWhite.png',      color: 0xe8e8e0, metalness: 0.0,  roughness: 0.6 },
}

export const GEOMETRIES_LIST = [
  'Torus Knot', 'Sphere', 'Torus', 'Rounded Cube',
  'Capsule', 'Cylinder', 'Handle', 'Knob',
] as const

export const ENVIRONMENTS: Record<string, EnvPreset> = {
  'Studio': { type: 'gradient', stops: [
    { pos: 0, color: '#3a3a42' }, { pos: 0.4, color: '#2c2c32' },
    { pos: 0.7, color: '#222228' }, { pos: 1, color: '#1a1a1e' }
  ], ground: '#1e1e22' },
  'Warm': { type: 'gradient', stops: [
    { pos: 0, color: '#44403a' }, { pos: 0.35, color: '#36322e' },
    { pos: 0.7, color: '#2a2826' }, { pos: 1, color: '#1e1c1a' }
  ], ground: '#22201e' },
  'Sunset': { type: 'gradient', stops: [
    { pos: 0, color: '#3d2840' }, { pos: 0.3, color: '#42283a' },
    { pos: 0.6, color: '#382230' }, { pos: 1, color: '#1e1418' }
  ], ground: '#201518' },
  'Ocean': { type: 'gradient', stops: [
    { pos: 0, color: '#283848' }, { pos: 0.3, color: '#2a3a48' },
    { pos: 0.6, color: '#222e38' }, { pos: 1, color: '#181e24' }
  ], ground: '#1a2028' },
  'Forest': { type: 'gradient', stops: [
    { pos: 0, color: '#2a3828' }, { pos: 0.3, color: '#283a2a' },
    { pos: 0.6, color: '#202e20' }, { pos: 1, color: '#161a16' }
  ], ground: '#1a1e1a' },
  'Dark': { type: 'solid', color: '#141418', ground: '#18181c' },
}
