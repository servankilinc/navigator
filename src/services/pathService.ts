import * as L from 'leaflet';
import * as turf from '@turf/turf';
import { FeatureCollection, GeoJsonProperties, Point, Position } from 'geojson';
import { store } from '../redux/store';
import { addPath, setPathCoordinateLatLng, setPathCoordinates, splicePathCoordinates } from '../redux/reducers/storageSlice';
import LineStringGeoJson from '../models/Features/LineStringGeoJson';
import CustomLayer from '../models/Features/CustomLayer';


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
  
  const _newPathList = [...store.getState().storageReducer.paths, geoJson];
  store.dispatch(addPath(geoJson as LineStringGeoJson));
  FindIntersections(_newPathList, geoJson.properties.id, drawnItems);
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

    const _pathList = store.getState().storageReducer.paths;
    FindIntersections(_pathList, path.properties.id, drawnItems);
  }
  else {
    throw new Error('Informatinons could not be updated');
  }
}


export function ShowPath(path: LineStringGeoJson, drawnItems: L.FeatureGroup<any>): void  {
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

export function HidePathByLayer(layer: L.Layer, drawnItems:  L.FeatureGroup<any>): void {
  if(layer != null){
    drawnItems.removeLayer(layer);
  }
}

export function HidePath(path: LineStringGeoJson, drawnItems: L.FeatureGroup<any>): void {
  const layer = drawnItems.getLayer(path.properties.layerId!);
  if(layer == null) throw new Error('Layer of path colud not found');
  
  drawnItems.removeLayer(layer);
}

export function ShowOrHidePath(path: LineStringGeoJson, drawnItems:  L.FeatureGroup<any>): boolean {
  const layer = drawnItems.getLayer(path.properties.layerId!);
  if(layer != null){
    console.log(layer)
    HidePathByLayer(layer, drawnItems);
    return false;
  }
  else{
    ShowPath(path, drawnItems);
    return true;
  }
}


// ############################## INTERSECTION METHODS ##############################

export function FindIntersections(pathList: LineStringGeoJson[], newPathId: string, drawnItems: L.FeatureGroup<any>): void
{
  const path1 = pathList.find((f) => f.properties.id == newPathId);
  if (path1 == null) throw new Error('New path not found in finding intersections!');
  
  pathList.filter((f) => path1.properties.floor == f.properties.floor && path1.properties.id != f.properties.id).map((path2) => 
  {
    const linePath1 = turf.lineString(path1.geometry.coordinates);
    const linePath2 = turf.lineString(path2.geometry.coordinates);
    
    const intersect = turf.lineIntersect(linePath1, linePath2);

    if (intersect.features.length > 0) {
      ConnectIntersections(intersect, path1, path2, drawnItems);
    }
    else {
      CheckBufferIntersection(path1, path2, drawnItems);
    }
  });
}

function ConnectIntersections(intersect: FeatureCollection<Point, GeoJsonProperties>, path1: LineStringGeoJson, path2: LineStringGeoJson, drawnItems: L.FeatureGroup<any>)
{
  const coordinateListPath1 = path1.geometry.coordinates;
  const coordinateListPath2 = path2.geometry.coordinates;

  for (let i = 0; i < intersect.features.length; i++) {
    var cordinate = intersect.features[i].geometry.coordinates;

    var isExistOnPath1 = coordinateListPath1.some((c) => c[0] == cordinate[0] && c[1] == cordinate[1]);
    var isExistOnPath2 = coordinateListPath2.some((c) => c[0] == cordinate[0] && c[1] == cordinate[1]);
    if (isExistOnPath1 == true && isExistOnPath2 == true) continue;
    

    for (let k = 0;   k < coordinateListPath1.length - 1; k++) {
      for (let m = 0;  m < coordinateListPath2.length - 1; m++) {
        const segment1 = turf.lineString([coordinateListPath1[k], coordinateListPath1[k + 1]]);
        const segment2 = turf.lineString([coordinateListPath2[m], coordinateListPath2[m + 1]]);
        const intersectSegment = turf.lineIntersect(segment1, segment2);

        // segmentler arasında kesişim var mı
        if (intersectSegment.features.length > 0) {
          if (!isExistOnPath1) {
            const tempCords = [...coordinateListPath1];
            tempCords.splice(k + 1, 0, cordinate);
            store.dispatch(setPathCoordinates({ pathId: path1.properties.id, coordinates: tempCords }));
          }
          if (!isExistOnPath2) {
            const tempCords = [...coordinateListPath2];
            tempCords.splice(m + 1, 0, cordinate);
            store.dispatch(setPathCoordinates({ pathId: path2.properties.id, coordinates: tempCords }));
          }

          drawnItems.addLayer(
            L.circle([cordinate[1], cordinate[0]], {
              color: 'orange',
              fillColor: '#f03',
              fillOpacity: 0.5,
              radius: 3,
            })
          );

        }
      }
    }
  }
}

function CheckBufferIntersection(path1: LineStringGeoJson, path2: LineStringGeoJson, drawnItems: L.FeatureGroup<any>): void 
{
  // ***** kesişim olmaması durumunda *****
  // 1) tampon bölgeler ile tekrar kesişimi kontrol et
  // 2) eğer kesişim olursa kesişimin üzerinde olduğu segment'te kesişim noktası düğüm olarak eklenir
  // 3) diğer segmentin kesişime neden olan yakın düğümünün konumu kesişim noktası olarak düzenlenir

  const coordinateListPath1 = path1.geometry.coordinates;
  const coordinateListPath2 = path2.geometry.coordinates;

  const tolerance = 0.5;

  for (let k = 0; k < coordinateListPath1.length - 1; k++) {
    for (let m = 0;  m < coordinateListPath2.length - 1; m++) {
      const segment1 = turf.lineString([coordinateListPath1[k], coordinateListPath1[k + 1]]);
      const segment2 = turf.lineString([coordinateListPath2[m], coordinateListPath2[m + 1]]);

      const buffer1 = turf.buffer(segment1, tolerance, { units: 'meters' });
      const buffer2 = turf.buffer(segment2, tolerance, { units: 'meters' });
      if (buffer1 == null || buffer2 == null) throw new Error('Buffer is coming undefined on buffer checking');
      
      var isInterSect = turf.booleanIntersects(buffer1, buffer2);
      if (isInterSect == false) continue;

      const intersectPoly = turf.intersect(turf.featureCollection([buffer1, buffer2]));
      if (intersectPoly == null) throw new Error('Intersection bufer as a Polygon is coming undefined on buffer checking');
      

      if (intersectPoly.geometry.coordinates.length > 0) {
        var med = Math.floor(intersectPoly.geometry.coordinates[0].length / 2);
        var intCoord : Position | Position[] = intersectPoly.geometry.coordinates[0][med] as Position;
        
        // false ise path1 de kesişim nokatına en yakın iki düğümün arasına kesişim noktası kordinatında yeni bir düğüm atılacak
        // true ise aynı işlem path2 için uygulanır diğer senaryoda, ikinci segmentin en yakın düğümünün konumu doğrudan kesişim noktası olarak güncellenir
        var isFirstSegmentResizing = true;

        var indexNearestNodeToIntersection: number | undefined = undefined; // kesişim noktasına en yakın düğümün index değeri
        var minDistance = 0;
        for (var x = 0; x < 2; x++) {
          var _dist = turf.distance(
            turf.point([coordinateListPath1[k + x][0], coordinateListPath1[k + x][1]]),
            turf.point([intCoord[0], intCoord[1]])
          );
          if (minDistance == 0 || minDistance > _dist) {
            minDistance = _dist;
            indexNearestNodeToIntersection = k + x;
          }
        }
        for (var x = 0; x < 2; x++) {
          var _dist = turf.distance(
            turf.point([coordinateListPath2[m + x][0], coordinateListPath2[m + x][1]]),
            turf.point([intCoord[0], intCoord[1]])
          );
          if (minDistance == 0 || minDistance > _dist) {
            minDistance = _dist;
            isFirstSegmentResizing = false;
            indexNearestNodeToIntersection = m + x;
          }
        }

        if (indexNearestNodeToIntersection == undefined) throw new Error('indexNearestNodeToIntersection could not calculated');
 
        if (isFirstSegmentResizing == false) { // demek ki ilk segmentin ortasına yeni bir düğüm eklenecek
          // ilk segmentin arasına kesişim noktası girmeli
          store.dispatch(splicePathCoordinates({prevIndex: k + 1, pathId: path1.properties.id, coordinate: intCoord }));
          // ikinci segment replace edilmeli
          store.dispatch(setPathCoordinateLatLng({ latLngIndex: indexNearestNodeToIntersection, pathId: path2.properties.id, coordinate: intCoord }));
        }
        else {
          // ikinci segmentin arasına kesişim noktası girmeli
          store.dispatch(splicePathCoordinates({prevIndex: m + 1,  pathId: path2.properties.id, coordinate: intCoord }));
          // ilk segmentin düğüm noka kordinatı değişmeli
          store.dispatch(setPathCoordinateLatLng({ latLngIndex: indexNearestNodeToIntersection, pathId: path1.properties.id, coordinate: intCoord}));
        }

        drawnItems!.addLayer(
          L.circle([intCoord[1], intCoord[0]], {
            color: 'orange',
            fillColor: 'green',
            fillOpacity: 0.5,
            radius: 3,
          })
        );

      }
    }
  }
}



// CreateLineString(geoJson: LineStringGeoJson, _id: string, layer: CustomLayer): void {
//   geoJson.properties = {
//     id: _id,
//     floor: appStates.currentFloor.index,
//     name: 'Yol',
//     popupContent: `Yol Bilgisi, Kat:${appStates.currentFloor.index} ID:${_id}`,
//   };

//   paths.push(geoJson);
//   drawnItems.addLayer(layer);

//   this.uiSynchronizerService.path();
// }


// DeletePath(pId: string) {
//   const path = paths.findIndex((p) => p.properties.id == pId);
//   if (path == null) {
//     alert('Path to delete not founded');
//     return;
//   }

//   const _index = paths.findIndex((p) => p.properties.id == pId);
//   paths.splice(_index, 1);

//   this.RemovePathFromMap(pId);
// }

