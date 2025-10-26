export default class IntersectionPoint {
  id: string;
  coordinate: number[];
  segments: IntersectionSegmentDetail[];
  isBuffer: boolean = false;
  isChanged: boolean = false; // kesişim kordinatı ortak bir konuma almak için değişti mi bilgisi  
  constructor(id: string, coordinate: number[], segments: IntersectionSegmentDetail[], isbuffer: boolean = false) {
    this.id = id;
    this.coordinate = coordinate;
    this.segments = segments;
    this.isBuffer = isbuffer;
  }
}

export class IntersectionSegmentDetail {
  pathId: string;
  segmentCoordinates: number[][];
  isIntersectionExistOnPath: boolean; // kesişim noktası bu yolda düğüm olarak zaten bulunuyor(daha öncesinden eklenmiş)
  constructor(pathId: string, segmentCoords: number[][], isIntersectionExistOnPath: boolean = false) {
    this.pathId = pathId;
    this.segmentCoordinates = segmentCoords;
    this.isIntersectionExistOnPath = isIntersectionExistOnPath;
  }
}
