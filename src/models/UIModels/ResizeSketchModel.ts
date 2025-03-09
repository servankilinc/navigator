export default class ResizeSketchModel{
  id!: string;
  corners!: L.LatLng[];
  constructor(id: string, corners: L.LatLng[]){
    this.id = id;
    this.corners = corners;
  }
}