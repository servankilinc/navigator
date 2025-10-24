import * as turf from '@turf/turf';

export default class IntersectionPoint {
  id: string;
  coordinate: number[];
  intersectPointPathDetails: IntersectPointPathDetail[];
  isBuffer: boolean = false;
  constructor(id: string, coordinate: number[], intersectPointPathDetails: IntersectPointPathDetail[], isbuffer: boolean = false) {
    this.id = id;
    this.coordinate = coordinate;
    this.intersectPointPathDetails = intersectPointPathDetails;
    this.isBuffer = isbuffer;
  }

  pushToPaths = (intersectPointPathDetails: IntersectPointPathDetail[]) => {
   intersectPointPathDetails.forEach(pointPathModel => {
    const isExist = this.intersectPointPathDetails.some((f) => 
      f.pathId == pointPathModel.pathId && 
      turf.booleanEqual(turf.point(f.segmentCoordinates), turf.point(pointPathModel.segmentCoordinates))
    );
     if (isExist == false){
      this.intersectPointPathDetails.push(pointPathModel);
     }
   });
  };
}

export class IntersectPointPathDetail{
  pathId: string;
  segmentCoordinates: number[];

  constructor(pathId: string, segmentCoords: number[])
  {
    this.pathId = pathId;
    this.segmentCoordinates = segmentCoords;
  }
}