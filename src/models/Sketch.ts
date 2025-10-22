import * as L from "leaflet";
export default class Sketch {
  id: string;
  source: string;
  imageOverlay: L.ImageOverlay.Rotated;
  corners: L.LatLng[]; // 4 tane ile sınırlandırılmalı
  opacity: number;
  rotation: number;
  frozen: boolean = false;
  
  constructor(id: string, source: string, imageOverlay: L.ImageOverlay.Rotated, corners: L.LatLng[]){
    this.id = id;
    this.source = source;
    this.imageOverlay = imageOverlay;
    this.corners = corners;
    this.opacity = 0.7;
    this.rotation = 0;
  }
}
// var temp : Sketch = {
//   id: "1",
//   source: "source",
//   corners: [
//     L.latLng(51.52,-0.14),
//     L.latLng(51.52,-0.10),
//     L.latLng(51.50,-0.14),
//     L.latLng(51.50,-0.10),],
//   opacity: 1
// }