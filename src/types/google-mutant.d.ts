declare module 'leaflet.gridlayer.googlemutant/src/Leaflet.GoogleMutant.mjs' {
  import {GridLayer, GridLayerOptions} from 'leaflet';
  export default class GoogleMutant extends GridLayer {
    constructor(options?: GridLayerOptions & {type?:'roadmap'|'satellite'|'terrain'|'hybrid'});
  }
}
