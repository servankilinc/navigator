import * as L from 'leaflet';
import * as turf from '@turf/turf';
import { Position } from 'geojson';
import { store } from '../redux/store';
import { addPath, setIntersectionPointCoordinate, setIntersectionPointList, setPathCoordinates, splicePathCoordinates, trimPathCoordinates } from '../redux/reducers/storageSlice';
import LineStringGeoJson from '../models/Features/LineStringGeoJson';
import CustomLayer from '../models/Features/CustomLayer';
import IntersectionPoint, { IntersectionSegmentDetail } from '../models/IntersectionPoint';
import e7 from '../scripts/idGenerator';

const tolerance = 3;
const trimTolerance = 3;

export function CreatePath(geoJson: LineStringGeoJson, layer: CustomLayer, _id: string, floor: number, drawnItems: L.FeatureGroup<any>) {
  drawnItems.addLayer(layer);
  (geoJson as LineStringGeoJson).properties = {
    layerId: (layer as any)._leaflet_id,
    id: _id,
    floor: floor,
    name: 'Yol',
    popupContent: `Yol Bilgisi, Kat:${floor} ID:${_id}`,
  };
  const pathList = store.getState().storageReducer.paths;
  if (pathList == null) throw new Error('Path list could not found');

  store.dispatch(addPath(geoJson as LineStringGeoJson));
}

export function UpdatePath(layer: CustomLayer, drawnItems: L.FeatureGroup<any>) {
  let pathList = store.getState().storageReducer.paths;
  if (pathList == null) throw new Error('Path list could not found');

  let path = pathList.find((p) => p.properties.id == layer.customProperties!.id);
  if (path == null) throw new Error('Line to update not founded');

  if (!(layer instanceof L.Polyline)) throw new Error('Layer is not a polyline!');

  const latlngs = layer.getLatLngs();
  if (Array.isArray(latlngs)) {
    const newCoordinates: Position[] = [];
    (latlngs as L.LatLng[]).forEach((item: L.LatLng) => newCoordinates.push([item.lng, item.lat]));
    store.dispatch(setPathCoordinates({ pathId: path.properties.id, coordinates: newCoordinates }));
  } else {
    throw new Error('Informatinons could not be updated');
  }
}

export function ShowPath(path: LineStringGeoJson, drawnItems: L.FeatureGroup<any>): void {
  L.geoJSON(path, {
    onEachFeature: function (_feature, layer) {
      (layer as CustomLayer).customProperties = {
        id: path.properties.id,
        floor: path.properties.floor,
        typeOfData: 'polyline',
      };
      (layer as any)._leaflet_id = path.properties.layerId!;
      drawnItems.addLayer(layer);
    },
  });
}

export function HidePathByLayer(layer: L.Layer, drawnItems: L.FeatureGroup<any>): void {
  if (layer != null) {
    drawnItems.removeLayer(layer);
  }
}

export function HidePath(path: LineStringGeoJson, drawnItems: L.FeatureGroup<any>): void {
  const layer = drawnItems.getLayer(path.properties.layerId!);
  if (layer == null) throw new Error('Layer of path colud not found');

  drawnItems.removeLayer(layer);
}

export function ShowOrHidePath(path: LineStringGeoJson, drawnItems: L.FeatureGroup<any>): boolean {
  const layer = drawnItems.getLayer(path.properties.layerId!);
  if (layer != null) {
    console.log(layer);
    HidePathByLayer(layer, drawnItems);
    return false;
  } else {
    ShowPath(path, drawnItems);
    return true;
  }
}

// ############################## INTERSECTION METHODS ##############################

export function FindIntersections(): void {
  const tempPoints: IntersectionPoint[] = [];
  const pathList = store.getState().storageReducer.paths;
  const drawnItems = store.getState().mapReducer.drawnItems;
  if(!drawnItems) return;

  // YOLLAR GEZİLİR
  for (let i = 0; i < pathList.length; i++) {
    const path1 = pathList[i];
    for (let j = i; j < pathList.length; j++) {
      const path2 = pathList[j];

      if (path1.properties.floor !== path2.properties.floor) continue;

      // SEGMENTLER GEZİLİR
      for (let k = 0; k < path1.geometry.coordinates.length - 1; k++) {
        for (let m = 0; m < path2.geometry.coordinates.length - 1; m++) {
          // bir yol kendisi ile kesişebilir fakat aynı segment ve komşu segmentler zaten kesişir atlamamız lazım
          if (path1.properties.id === path2.properties.id && Math.abs(k - m) <= 1) continue;

          const coordsSegment1 = [path1.geometry.coordinates[k], path1.geometry.coordinates[k + 1]];
          const coordsSegment2 = [path2.geometry.coordinates[m], path2.geometry.coordinates[m + 1]];

          // bu iki segmentin uç naktalarından en az biri ortak kesişim algılanacak ancak zaten bağlanmışlar o yüzden atlanılmalı
          const isConnected =
            (coordsSegment1[0][0] == coordsSegment2[0][0] && coordsSegment1[0][1] == coordsSegment2[0][1]) || // 1. segmentin başlangıcı ile 2. segmentin başlangıcı
            (coordsSegment1[1][0] == coordsSegment2[0][0] && coordsSegment1[1][1] == coordsSegment2[0][1]) || // 1. segmentin uç noktası ile 2. segmentin başlangıcı
            (coordsSegment1[0][0] == coordsSegment2[1][0] && coordsSegment1[0][1] == coordsSegment2[1][1]) || // 1. segmentin başlangıcı ile 2. segmentin uç noktası
            (coordsSegment1[1][0] == coordsSegment2[1][0] && coordsSegment1[1][1] == coordsSegment2[1][1]); // 1. segmentin uç noktası ile 2. segmentin uç noktası

          if (isConnected) continue;

          const segment1 = turf.lineString(coordsSegment1);
          const segment2 = turf.lineString(coordsSegment2);

          const intersect = turf.lineIntersect(segment1, segment2);

          // Temaslı kesişim var
          if (intersect.features.length > 0) {
            intersect.features.forEach((feature) => {
              const coords = feature.geometry.coordinates;

              const aleradyExistOnPath1 = path1.geometry.coordinates.some((c) => (c[0] == coords[0] && c[1] == coords[1]) || (c[1] == coords[0] && c[0] == coords[1]));
              const aleradyExistOnPath2 = path2.geometry.coordinates.some((c) => (c[0] == coords[0] && c[1] == coords[1]) || (c[1] == coords[0] && c[0] == coords[1]));

              // iki yolda kesişim noktasına sahipse değilse veya en az biri düğüm olarak sahip değilse listeye atalım
              if (!aleradyExistOnPath1 || !aleradyExistOnPath2) {
                const intersectedSegments = [
                  new IntersectionSegmentDetail(path1.properties.id, segment1.geometry.coordinates, aleradyExistOnPath1),
                  new IntersectionSegmentDetail(path2.properties.id, segment2.geometry.coordinates, aleradyExistOnPath2),
                ];

                const id = e7();
                tempPoints.push(new IntersectionPoint(id, coords, intersectedSegments, false));
              }
            });
          }
        }
      }
    }
  }

  tempPoints.forEach((tp) => {
    drawnItems.addLayer(
      L.circle([tp.coordinate[1], tp.coordinate[0]], {
        color: 'orange',
        fillColor: tp.isBuffer ? 'rgba(0, 255, 170, 0.99)' : 'rgba(255, 196, 0, 0.99)',
        fillOpacity: 0.5,
        radius: 2,
      })
    );
    tp.segments.forEach((segment) => {
      drawnItems.addLayer(
        // segment.segmentCoordinates : number[][]
        L.polyline(segment.segmentCoordinates as [number, number][], { color: 'red' })
      );
    });
  });
  store.dispatch(setIntersectionPointList(tempPoints));
  MergeIntersections(tempPoints);
  TrimUnnecessaryParts();
}

function MergeIntersections(intersectionPoints: IntersectionPoint[]) {
  let handledIntersections: string[] = [];
  intersectionPoints.forEach((data_ip) => {
    if (data_ip.segments.length != 2) return;

    debugger;
    const ip = store.getState().storageReducer.intersectionPoints.find(f => f.id == data_ip.id);
    if(ip == null) return;

    handledIntersections.push(ip.id);

    const paths = [...store.getState().storageReducer.paths];

    const segment1 = ip.segments[0];
    const segment2 = ip.segments[1];
    const path1 = paths.find((f) => f.properties.id == segment1.pathId);
    const path2 = paths.find((f) => f.properties.id == segment2.pathId);

    if (path1 == undefined || path2 == undefined) return;
    

    // her iki segmentin de bulunduğu başka kesişimler varsa arasındaki measafe tolerans değerinin içinde ise diğer kesişimlerin kesişim kordinatları aynı yapılır
    const shared_intersections = intersectionPoints.filter(
      (other_ip) =>
        !other_ip.isBuffer &&
        !handledIntersections.includes(other_ip.id) &&
        turf.distance(turf.point(ip.coordinate), turf.point(other_ip.coordinate), { units: 'meters' }) <= tolerance &&
        (
          other_ip.segments.some((fi) => fi.pathId == segment1.pathId && CoordinatesEqual(fi.segmentCoordinates, segment1.segmentCoordinates)) ||
          other_ip.segments.some((fi) => fi.pathId == segment2.pathId && CoordinatesEqual(fi.segmentCoordinates, segment2.segmentCoordinates))
        )
    );

    if (shared_intersections.length > 0) {
      // ortak nokta olarak ilk kesişimi kullanacağım ancak ileride burada tam orta nokta hesaplanarak kullanılabilir
      shared_intersections.forEach((other_ip) => store.dispatch(setIntersectionPointCoordinate({ id: other_ip.id, coordinate: ip.coordinate })));
    }

    // kesişim noktaları yolların ilgli segmentlerinin arasına eklenir
    if (segment1.isIntersectionExistOnPath == false) {
      const aleradyExistOnPath = path1.geometry.coordinates.some((c) => (c[0] == ip.coordinate[0] && c[1] == ip.coordinate[1]) || (c[1] == ip.coordinate[0] && c[0] == ip.coordinate[1]));

      if (!aleradyExistOnPath){
        const segmentIndex = FindNearestSegmentIndex(path1.geometry.coordinates, ip.coordinate);
        if (segmentIndex >= 0) store.dispatch(splicePathCoordinates({ pathId: path1.properties.id, prevIndex: segmentIndex + 1, coordinate: ip.coordinate }));
      }
    }
    if (segment2.isIntersectionExistOnPath == false) {
      const aleradyExistOnPath = path2.geometry.coordinates.some((c) => (c[0] == ip.coordinate[0] && c[1] == ip.coordinate[1]) || (c[1] == ip.coordinate[0] && c[0] == ip.coordinate[1]));

      if (!aleradyExistOnPath){
        const segmentIndex = FindNearestSegmentIndex(path2.geometry.coordinates, ip.coordinate);
        if (segmentIndex >= 0) store.dispatch(splicePathCoordinates({ pathId: path2.properties.id, prevIndex: segmentIndex + 1, coordinate: ip.coordinate }));
      }
    }
  });
}

export function FindNearestSegmentIndex(coords: number[][], point: number[]) {
  const pt = turf.point(point);

  let minDistance = Infinity;
  let nearestIndex = -1;

  for (let i = 0; i < coords.length - 1; i++) {
    const segment = turf.lineString([
      coords[i],
      coords[i + 1]
    ]);

    const distance = turf.pointToLineDistance(pt, segment, { units: "meters" });

    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = i;
    }
  }

  return nearestIndex;
} 

function CoordinatesEqual(a: number[][], b: number[][]) {
  if (a.length !== b.length) return false;
  return a.every((coord, i) => coord[0] === b[i][0] && coord[1] === b[i][1]); // segmentlerin uç noktaları eşit mi?
}

function TrimUnnecessaryParts() {
  // yollar gezilir uç kısımlarındaki segmentin uzunluğuna bakılır tolerans değerinden kısa ise ve
  debugger;
  const paths = store.getState().storageReducer.paths;

  paths.forEach((path) => {
    const lengthCoordinates = path.geometry.coordinates.length;
    if (lengthCoordinates < 3) return;

    const firstSegment = [path.geometry.coordinates[0], path.geometry.coordinates[1]];
    const lastSegment = [path.geometry.coordinates[lengthCoordinates - 2], path.geometry.coordinates[lengthCoordinates - 1]];

    const distanceFirst = turf.distance(turf.point(firstSegment[0]), turf.point(firstSegment[1]), {units: 'meters'});
    const distanceLast = turf.distance(turf.point(lastSegment[0]), turf.point(lastSegment[1]), {units: 'meters'});

    if (distanceFirst <= trimTolerance) {
      // first segment: [[lat, lng], [lat, lng]]
      //             c:  [lat, lng]
      const isPointsUsing = paths.some(
        (p) =>
          p.properties.id != path.properties.id &&
          p.geometry.coordinates.some((c) => c[0] == firstSegment[0][0] && c[1] == firstSegment[0][1])
      );
      if (!isPointsUsing) {
        store.dispatch(trimPathCoordinates({ pathId: path.properties.id, prevIndex: 0 }));
      }
    }
    if (distanceLast <= trimTolerance) {
      const isPointsUsing = paths.some((p) =>
          p.properties.id != path.properties.id &&
          p.geometry.coordinates.some((c) => c[0] == lastSegment[1][0] && c[1] == lastSegment[1][1])
      );
      if (!isPointsUsing) {
        store.dispatch(trimPathCoordinates({ pathId: path.properties.id, prevIndex: lengthCoordinates - 1 }));
      }
    }
  });
}