import Sketch from '../Sketch';

export default class SketchModel {
  id: string;
  source: string;
  corners: L.LatLng[]; // 4 tane ile sınırlandırılmalı
  opacity: number;
  rotation: number;
  frozen: boolean = false;
  constructor(sketch: Sketch) {
    this.id = sketch.id;
    this.source = sketch.source;
    this.corners = sketch.corners;
    this.opacity = sketch.opacity;
    this.rotation = sketch.rotation;
    this.frozen = sketch.frozen;
  }
}
