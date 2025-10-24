import * as L from 'leaflet';
import * as turf from '@turf/turf';
import { FeatureCollection, GeoJsonProperties, Point, Position } from 'geojson';
import { store } from '../redux/store';
import { addPath, setIntersectedPathList, setIntersectionPointList, setPathCoordinateLatLng, setPathCoordinates, splicePathCoordinates, storageSlice } from '../redux/reducers/storageSlice';
import LineStringGeoJson from '../models/Features/LineStringGeoJson';
import CustomLayer from '../models/Features/CustomLayer';
import IntersectionPoint, { IntersectPointPathDetail } from '../models/IntersectionPoint';
import e7 from '../scripts/idGenerator';

const tolerance = 1;

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

  // const _newPathList = [...store.getState().storageReducer.paths, geoJson];
  store.dispatch(addPath(geoJson as LineStringGeoJson));
  // FindIntersections(_newPathList, geoJson.properties.id, drawnItems);
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

    // const _pathList = store.getState().storageReducer.paths;
    // FindIntersections(_pathList, path.properties.id, drawnItems);
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
// export function FindIntersections(pathList: LineStringGeoJson[], newPathId: string, drawnItems: L.FeatureGroup<any>): void {
//   const path1 = pathList.find((f) => f.properties.id == newPathId);
//   if (path1 == null) throw new Error('New path not found in finding intersections!');

//   pathList
//     .filter((f) => path1.properties.floor == f.properties.floor && path1.properties.id != f.properties.id)
//     .map((path2) => {
//       const linePath1 = turf.lineString(path1.geometry.coordinates);
//       const linePath2 = turf.lineString(path2.geometry.coordinates);

//       const intersect = turf.lineIntersect(linePath1, linePath2);

//       if (intersect.features.length > 0) {
//         ConnectIntersections(intersect, path1, path2, drawnItems);
//       }
//       else {
//         CheckBufferIntersection(path1, path2, drawnItems);
//       }
//     });
// }

export function FindIntersections(pathList: LineStringGeoJson[], drawnItems: L.FeatureGroup<any>): void {
  const tempPoints: IntersectionPoint[] = [];

  for (let i = 0; i < pathList.length; i++) {
    const path1 = pathList[i];
    for (let j = i + 1; j < pathList.length; j++) {
      const path2 = pathList[j];

      if (path1.properties.floor !== path2.properties.floor) continue;
      if (path1.properties.id === path2.properties.id) continue;

      for (let k = 0; k < path1.geometry.coordinates.length - 1; k++) {
        for (let m = 0; m < path2.geometry.coordinates.length - 1; m++) {
          const segment1 = turf.lineString([path1.geometry.coordinates[k], path1.geometry.coordinates[k + 1]]);
          const segment2 = turf.lineString([path2.geometry.coordinates[m], path2.geometry.coordinates[m + 1]]);
          
          const intersect = turf.lineIntersect(segment1, segment2);
          // 1) doğrudan kesişim var mı
          if (intersect.features.length > 0) {
            intersect.features.forEach((feature) => {
              const coords = feature.geometry.coordinates as [number, number];
              
              // kesişim var ve bu hangi yolların hangi segmentlerinden kaynaklanıyor bilgisi 
              const intersectedSegments = [
                new IntersectPointPathDetail(path1.properties.id, segment1.geometry.coordinates[0]),
                new IntersectPointPathDetail(path2.properties.id, segment2.geometry.coordinates[0])
              ];

              const existing = tempPoints.find((f) => turf.booleanEqual(turf.point(f.coordinate), turf.point(coords)));
              if (existing) {
                existing.pushToPaths(intersectedSegments);
              } 
              else {
                const id = e7();
                tempPoints.push(new IntersectionPoint(id, coords, intersectedSegments, false));
              }
            });
          }
          // 2) doğrudan kesişim yoksa
          else {
            const buffer1 = turf.buffer(segment1, tolerance, { units: 'meters' });
            const buffer2 = turf.buffer(segment2, tolerance, { units: 'meters' });
            // console.log("BUFFER CHECK", buffer1?.geometry.coordinates, buffer2?.geometry.coordinates)
            if (!buffer1 || !buffer2) continue;

            const isThereIntersects = turf.booleanIntersects(buffer1, buffer2); 
            if (!isThereIntersects) continue;

            const intersectBuffer = turf.intersect(turf.featureCollection([buffer1, buffer2]));
            if (!intersectBuffer?.geometry?.coordinates?.length) continue;

            const centerCords = turf.pointOnFeature(intersectBuffer).geometry.coordinates;

            // kesişim var ve bu hangi yolların hangi segmentlerinden kaynaklanıyor bilgisi
            const intersectedSegments = [
              new IntersectPointPathDetail(path1.properties.id, segment1.geometry.coordinates[0]),
              new IntersectPointPathDetail(path2.properties.id, segment2.geometry.coordinates[0])
            ];

            const existing = tempPoints.find((f) => turf.booleanEqual(turf.point(f.coordinate), turf.point(centerCords)));
            if (existing) {
              existing.pushToPaths(intersectedSegments);
            } 
            else {
              const id = e7();
              tempPoints.push(new IntersectionPoint(id, centerCords, intersectedSegments, true));
            }
          }
        }
      }
    }
  }
  
  console.log('INTERSECTIONS => ', tempPoints);

  tempPoints.forEach((tp) => {
    drawnItems.addLayer(
      L.circle([tp.coordinate[1], tp.coordinate[0]], {
        color: 'orange',
        fillColor: tp.isBuffer ? 'rgba(255, 0, 179, 0.99)':  'rgba(0, 255, 157, 0.99)',
        fillOpacity: 0.5,
        radius: 1,
      })
    );
  });
  store.dispatch(setIntersectionPointList(tempPoints));
  MergeBufferIntersections(tempPoints);
}

function MergeBufferIntersections(intersectionPoints: IntersectionPoint[]){
  const paths = [...store.getState().storageReducer.paths];

  
  const bufferIntersectionPoints = intersectionPoints.filter(f => f.isBuffer);
  if (bufferIntersectionPoints == null || bufferIntersectionPoints.length == 0) return;


  // 1.) buffer kesişimlerde segmentler için 3 koşul var 
  // a: ikisi de uç nokta b: ikiside orta segment c: birisi uç diğeri orta segment
  
  // 2.) merge süreci 
  // a,b: koşulunda her iki segmentten başka bir(buffer) kesişimi olmayan diğerine bağlanır eğer ikisininde de (buffer) kesişimi varsa atla şimdilik
  // c: uç da bulunan segmentin kesişimi(buffer) yoksa uç segmenti diğer segmente bağla kesişimi(buffer) varsa atla

  // geliştirilecek TODO: artık path bilgisi üzerinden graph oluşturulmuyor bunun gibi pathin kullanıldığı ancak artık intersectedPath bilgiine ihtiyaç duyabilecek alanlar olabilir 



  store.dispatch(setIntersectedPathList(paths));
}
function updatePathGeometry(path1: LineStringGeoJson, path2: LineStringGeoJson, intCoord: Position, nearestPath: 1 | 2, nearestIndex: number, i: number, j: number): void {
  if (nearestPath === 2) {
    // Path1'e yeni düğüm ekle, Path2'nin en yakın düğümünü güncelle
    store.dispatch(splicePathCoordinates({ prevIndex: i + 1, pathId: path1.properties.id, coordinate: intCoord }));
    store.dispatch(setPathCoordinateLatLng({ latLngIndex: nearestIndex, pathId: path2.properties.id, coordinate: intCoord }));
  } else {
    // Path2'ye yeni düğüm ekle, Path1'in en yakın düğümünü güncelle
    store.dispatch(splicePathCoordinates({ prevIndex: j + 1, pathId: path2.properties.id, coordinate: intCoord }));
    store.dispatch(setPathCoordinateLatLng({ latLngIndex: nearestIndex, pathId: path1.properties.id, coordinate: intCoord }));
  }
}


// function ConnectIntersections(intersect: FeatureCollection<Point, GeoJsonProperties>, path1: LineStringGeoJson, path2: LineStringGeoJson, drawnItems: L.FeatureGroup<any>) {
//   const coordinateListPath1 = path1.geometry.coordinates;
//   const coordinateListPath2 = path2.geometry.coordinates;

//   for (let i = 0; i < intersect.features.length; i++) {
//     var cordinate = intersect.features[i].geometry.coordinates;

//     var isExistOnPath1 = coordinateListPath1.some((c) => c[0] == cordinate[0] && c[1] == cordinate[1]);
//     var isExistOnPath2 = coordinateListPath2.some((c) => c[0] == cordinate[0] && c[1] == cordinate[1]);
//     if (isExistOnPath1 == true && isExistOnPath2 == true) continue;

//     for (let k = 0; k < coordinateListPath1.length - 1; k++) {
//       for (let m = 0; m < coordinateListPath2.length - 1; m++) {
//         const segment1 = turf.lineString([coordinateListPath1[k], coordinateListPath1[k + 1]]);
//         const segment2 = turf.lineString([coordinateListPath2[m], coordinateListPath2[m + 1]]);
//         const intersectSegment = turf.lineIntersect(segment1, segment2);

//         // segmentler arasında kesişim var mı
//         if (intersectSegment.features.length == 0) continue;

//         if (!isExistOnPath1) {
//           const tempCords = [...coordinateListPath1];
//           tempCords.splice(k + 1, 0, cordinate);
//           store.dispatch(setPathCoordinates({ pathId: path1.properties.id, coordinates: tempCords }));
//         }
//         if (!isExistOnPath2) {
//           const tempCords = [...coordinateListPath2];
//           tempCords.splice(m + 1, 0, cordinate);
//           store.dispatch(setPathCoordinates({ pathId: path2.properties.id, coordinates: tempCords }));
//         }

//         drawnItems.addLayer(
//           L.circle([cordinate[1], cordinate[0]], {
//             color: 'orange',
//             fillColor: '#f03',
//             fillOpacity: 0.5,
//             radius: 3,
//           })
//         );
//       }
//     }
//   }
// }

// function CheckBufferIntersection(path1: LineStringGeoJson, path2: LineStringGeoJson, drawnItems: L.FeatureGroup<any>): void {
//   // ***** kesişim olmaması durumunda *****
//   // 1) tampon bölgeler ile tekrar kesişimi kontrol et
//   // 2) eğer kesişim olursa kesişimin üzerinde olduğu segment'te kesişim noktası düğüm olarak eklenir
//   // 3) diğer segmentin kesişime neden olan yakın düğümünün konumu kesişim noktası olarak düzenlenir

//   const coords1 = path1.geometry.coordinates;
//   const coords2 = path2.geometry.coordinates;

//   const tolerance = 0.5;

//   for (let k = 0; k < coords1.length - 1; k++) {
//     for (let m = 0; m < coords2.length - 1; m++) {
//       const segment1 = turf.lineString([coords1[k], coords1[k + 1]]);
//       const segment2 = turf.lineString([coords2[m], coords2[m + 1]]);

//       const buffer1 = turf.buffer(segment1, tolerance, { units: 'meters' });
//       const buffer2 = turf.buffer(segment2, tolerance, { units: 'meters' });
//       if (!buffer1 || !buffer2) continue;

//       // is there intersect
//       if (turf.booleanIntersects(buffer1, buffer2) == false) continue;

//       const intersectPoly = turf.intersect(turf.featureCollection([buffer1, buffer2]));
//       if (!intersectPoly?.geometry?.coordinates?.length) continue;

//       // const centroid = turf.center(intersectPoly);
//       // const centerCords = centroid.geometry.coordinates as [number, number];
//       const centerCords = turf.pointOnFeature(intersectPoly).geometry.coordinates;

//       const { nearestPath, nearestIndex } = findNearestPathSegment(coords1, coords2, centerCords, k, m);

//       updatePathGeometry(path1, path2, centerCords, nearestPath, nearestIndex, k, m);

//       drawnItems!.addLayer(
//         L.circle([centerCords[1], centerCords[0]], {
//           color: 'orange',
//           fillColor: 'green',
//           fillOpacity: 0.5,
//           radius: 3,
//         })
//       );
//     }
//   }
// }

// function findNearestPathSegment(coords1: Position[], coords2: Position[], intCoord: Position, i: number, j: number): { nearestPath: 1 | 2; nearestIndex: number } {
//   const dist1 = getNearestIndexAndDistance(coords1, intCoord, i);
//   const dist2 = getNearestIndexAndDistance(coords2, intCoord, j);

//   return dist1.distance <= dist2.distance ? { nearestPath: 1, nearestIndex: dist1.index } : { nearestPath: 2, nearestIndex: dist2.index };
// }

// function getNearestIndexAndDistance(coords: Position[], intCoord: Position, startIdx: number) {
//   let nearestIndex = startIdx;
//   let minDist = Infinity;

//   for (let x = 0; x < 2; x++) {
//     const dist = turf.distance(turf.point(coords[startIdx + x]), turf.point(intCoord));
//     if (dist < minDist) {
//       minDist = dist;
//       nearestIndex = startIdx + x;
//     }
//   }
//   return { index: nearestIndex, distance: minDist };
// }

// function updatePathGeometry(path1: LineStringGeoJson, path2: LineStringGeoJson, intCoord: Position, nearestPath: 1 | 2, nearestIndex: number, i: number, j: number): void {
//   if (nearestPath === 2) {
//     // Path1'e yeni düğüm ekle, Path2'nin en yakın düğümünü güncelle
//     store.dispatch(splicePathCoordinates({ prevIndex: i + 1, pathId: path1.properties.id, coordinate: intCoord }));
//     store.dispatch(setPathCoordinateLatLng({ latLngIndex: nearestIndex, pathId: path2.properties.id, coordinate: intCoord }));
//   } else {
//     // Path2'ye yeni düğüm ekle, Path1'in en yakın düğümünü güncelle
//     store.dispatch(splicePathCoordinates({ prevIndex: j + 1, pathId: path2.properties.id, coordinate: intCoord }));
//     store.dispatch(setPathCoordinateLatLng({ latLngIndex: nearestIndex, pathId: path1.properties.id, coordinate: intCoord }));
//   }
// }
