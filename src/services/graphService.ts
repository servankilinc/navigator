import * as L from 'leaflet';
import * as turf from '@turf/turf';
import { FeatureCollection, GeoJsonProperties, Point, Position } from 'geojson';
import LineStringGeoJson from '../models/Features/LineStringGeoJson';
import { store } from '../redux/store';
import { setEdgeListToGraph, setgGraphToGraph, setNodeListToGraph, setPathCoordinates } from '../redux/reducers/storageSlice';
import Graph from '../models/Graph';
import Edge from '../models/Edge';
import Node from '../models/Node';
import { Graph as gGraph } from 'graphlib';

export function DesignGraph(graphList: Graph[]): void {
  graphList.map((graphData) => {
    var _pathList = store.getState().storageReducer.paths;
    var floorPaths = _pathList.filter((f) => f.properties.floor == graphData.floor);
    if (floorPaths == null) {
      return;
    }
    const tempEdgeArray: Edge[] = [];
    const tempNodeArray: Node[] = [];

    // set nodes
    floorPaths.forEach((_path) => {
      var index = tempNodeArray.length;
      _path.geometry.coordinates.map((cord) => {
        var isExist = tempNodeArray.some((n) => n.coordinate[0] == cord[0] && n.coordinate[1] == cord[1]);
        if (isExist == false) {
          tempNodeArray.push({
            id: index,
            coordinate: cord,
          });
          index += 1;
        }
      });
    });

    // set edges
    floorPaths.forEach((_path) => {
      const coordinates = _path.geometry.coordinates;
      for (let i = 0; i < coordinates.length - 1; i++) {
        const sourceCoordinate = coordinates[i];
        const targetCoordinate = coordinates[i + 1];

        const distance = turf.distance(turf.point(sourceCoordinate), turf.point(targetCoordinate));

        const source = JSON.stringify(sourceCoordinate);
        const target = JSON.stringify(targetCoordinate);

        tempEdgeArray.push({
          source: source,
          target: target,
          weight: distance,
          sourceCoordinate: sourceCoordinate as [number, number],
          targetCoordinate: targetCoordinate as [number, number],
        });

        // Çift yönlü bağlantı
        tempEdgeArray.push({
          source: target,
          target: source,
          weight: distance,
          sourceCoordinate: targetCoordinate as [number, number],
          targetCoordinate: sourceCoordinate as [number, number],
        });
      }
    });
    store.dispatch(setEdgeListToGraph({ floor: graphData.floor, edges: tempEdgeArray }));
    store.dispatch(setNodeListToGraph({ floor: graphData.floor, nodes: tempNodeArray }));

    var _gGraph = new gGraph();
    tempEdgeArray.forEach((edge) => {
      _gGraph.setNode(edge.source);
      _gGraph.setNode(edge.target);
      _gGraph.setEdge(edge.source, edge.target, edge.weight);
    });
    store.dispatch(setgGraphToGraph({ floor: graphData.floor, graph: _gGraph }));
  });
}

// kesişim noktalarını yoll çizgilerine sanki birer node'muş gibi ekler
export function FindIntersections(pathList: LineStringGeoJson[], drawnItems: L.FeatureGroup<any>): void {
  pathList.map((path1) => {
    pathList
      .filter((f) => path1.properties.floor == f.properties.floor && path1.properties.id != f.properties.id)
      .map((path2) => {
        const linePath1 = turf.lineString(path1.geometry.coordinates);
        const linePath2 = turf.lineString(path2.geometry.coordinates);

        const intersect = turf.lineIntersect(linePath1, linePath2);

        if (intersect.features.length > 0) {
          ConnectIntersections(intersect, path1, path2, drawnItems);
        } else {
          CheckBufferIntersection(path1, path2, drawnItems);
        }
      });
  });
}

function ConnectIntersections(
  intersect: FeatureCollection<Point, GeoJsonProperties>,
  path1: LineStringGeoJson,
  path2: LineStringGeoJson,
  drawnItems: L.FeatureGroup<any>
) {
  const coordinateListPath1 = path1.geometry.coordinates;
  const coordinateListPath2 = path2.geometry.coordinates;

  for (let i = 0; i < intersect.features.length; i++) {
    var cordinate = intersect.features[i].geometry.coordinates;

    var isExistOnPath1 = coordinateListPath1.some((c) => c[0] == cordinate[0] && c[1] == cordinate[1]);
    var isExistOnPath2 = coordinateListPath2.some((c) => c[0] == cordinate[0] && c[1] == cordinate[1]);
    if (isExistOnPath1 == true && isExistOnPath2 == true) {
      continue;
    }

    var _continue = true;
    for (let k = 0; _continue && k < coordinateListPath1.length - 1; k++) {
      for (let m = 0; _continue && m < coordinateListPath2.length - 1; m++) {
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
              color: '#000',
              fillColor: '#f03',
              fillOpacity: 0.5,
              radius: 5,
            })
          );

          _continue = false;
        }
      }
    }
  }
}

function CheckBufferIntersection(path1: LineStringGeoJson, path2: LineStringGeoJson, drawnItems: L.FeatureGroup<any>): void {
  // ***** kesişim olmaması durumunda *****
  // 1) tampon bölgeler ile tekrar kesişimi kontrol et
  // 2) eğer kesişim olursa kesişimin üzerinde olduğu segment'te kesişim noktası düğüm olarak eklenir
  // 3) diğer segmentin kesişime neden olan yakın düğümünün konumu kesişim noktası olarak düzenlenir

  const coordinateListPath1 = path1.geometry.coordinates;
  const coordinateListPath2 = path2.geometry.coordinates;

  const tolerance = 3;

  var _continue = true;
  for (let k = 0; _continue && k < coordinateListPath1.length - 1; k++) {
    for (let m = 0; _continue && m < coordinateListPath2.length - 1; m++) {
      const segment1 = turf.lineString([coordinateListPath1[k], coordinateListPath1[k + 1]]);
      const segment2 = turf.lineString([coordinateListPath2[m], coordinateListPath2[m + 1]]);

      const buffer1 = turf.buffer(segment1, tolerance, { units: 'meters' });
      const buffer2 = turf.buffer(segment2, tolerance, { units: 'meters' });
      if (buffer1 == null || buffer2 == null) {
        alert('Buffer is coming undefined on buffer checking');
        continue;
      }

      var isInterSect = turf.booleanIntersects(buffer1, buffer2);
      if (isInterSect == false) {
        continue;
      }

      const intersectPoly = turf.intersect(turf.featureCollection([buffer1, buffer2]));
      if (intersectPoly == null) {
        alert('Intersection bufer as a Polygon is coming undefined on buffer checking');
        continue;
      }

      if (intersectPoly.geometry.coordinates.length > 0) {
        var med = Math.floor(intersectPoly.geometry.coordinates[0].length / 2);
        var cordinate: Position | Position[] = intersectPoly.geometry.coordinates[0][med] as Position;

        var isExistOnPath1 = coordinateListPath1.some((c) => c[0] == cordinate[0] && c[1] == cordinate[1]);
        var isExistOnPath2 = coordinateListPath2.some((c) => c[0] == cordinate[0] && c[1] == cordinate[1]);

        var isFirstSegmentResizing = true; // kesişim noktasına en yakın düğüme sahip segment bulmak için
        var indexNearestNodeToIntersection: number | undefined = undefined; // kesişim noktasına en yakın düğümün index değeri
        var minDistance = 0;
        for (var x = 0; x < 2; x++) {
          var _dist = turf.distance(
            turf.point([coordinateListPath1[k + x][0], coordinateListPath1[k + x][1]]),
            turf.point([cordinate[0], cordinate[1]])
          );
          if (minDistance == 0 || minDistance > _dist) {
            minDistance = _dist;
            indexNearestNodeToIntersection = k + x;
          }
        }
        for (var x = 0; x < 2; x++) {
          var _dist = turf.distance(
            turf.point([coordinateListPath2[m + x][0], coordinateListPath2[m + x][1]]),
            turf.point([cordinate[0], cordinate[1]])
          );
          if (minDistance == 0 || minDistance > _dist) {
            minDistance = _dist;
            isFirstSegmentResizing = false;
            indexNearestNodeToIntersection = m + x;
          }
        }

        if (indexNearestNodeToIntersection == undefined) {
          alert('indexNearestNodeToIntersection could not calculated');
          continue;
        }

        if (!isExistOnPath1) {
          if (isFirstSegmentResizing) {
            // ilk segmentin düğüm noka kordinatı değişmeli
            const tempCords = [...coordinateListPath1];
            tempCords[indexNearestNodeToIntersection] = cordinate;
            store.dispatch(setPathCoordinates({ pathId: path1.properties.id, coordinates: tempCords }));
          } else {
            // ilk segmentin arasına kesişim noktası girmeli
            const tempCords = [...coordinateListPath1];
            tempCords.splice(k + 1, 0, cordinate);
            store.dispatch(setPathCoordinates({ pathId: path1.properties.id, coordinates: tempCords }));
          }
        }
        if (!isExistOnPath2) {
          if (isFirstSegmentResizing == false) {
            // ikinci segmentin düğüm noka kordinatı değişmeli
            const tempCords = [...coordinateListPath2];
            tempCords[indexNearestNodeToIntersection] = cordinate;
            store.dispatch(setPathCoordinates({ pathId: path2.properties.id, coordinates: tempCords }));
          } else {
            // ikinci segmentin arasına kesişim noktası girmeli
            const tempCords = [...coordinateListPath2];
            tempCords.splice(m + 1, 0, cordinate);
            store.dispatch(setPathCoordinates({ pathId: path2.properties.id, coordinates: tempCords }));
          }
        }

        drawnItems!.addLayer(
          L.circle([cordinate[1], cordinate[0]], {
            color: '#000',
            fillColor: '#f03',
            fillOpacity: 0.5,
            radius: 5,
          })
        );

        _continue = false;
      }
    }
  }
}
