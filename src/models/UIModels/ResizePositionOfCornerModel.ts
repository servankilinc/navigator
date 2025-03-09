

export class ResizePositionOfCornerModel {
  id!: string;
  index!: number;
  latng!: L.LatLng;
  constructor(id: string, index: number, latng: L.LatLng) {
    this.id = id;
    this.index = index;
    this.latng = latng;
  }
}
