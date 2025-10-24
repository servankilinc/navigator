import * as turf from '@turf/turf';
import { alg } from 'graphlib';
import { Position } from 'geojson';
import { store } from '../redux/store';
import Node from '../models/Node';
import { setGraphList } from '../redux/reducers/storageSlice';
import PolygonGeoJson from '../models/Features/PolygonGeoJson';
import { AdvancedPointDirectionTypesEnums } from '../models/AdvancedPointDirectionTypes';
import AdvancedPointGeoJson from '../models/Features/AdvancedPointGeoJson';
import Graph from '../models/Graph';

// export function DesignGraph(): void {
//   const tempArray: DesignGraphModel[] = [];

//   const graphList = store.getState().storageReducer.graphList;
//   graphList.map((graphData) => {
//     var _pathList = store.getState().storageReducer.paths;

//     var floorPaths = _pathList.filter((f) => f.properties.floor == graphData.floor);
//     if (floorPaths == null) return;

//     const floorTempArray: DesignGraphModel = {
//       floor: graphData.floor,
//       edges: [],
//       nodes: [],
//       gGraph: new gGraph(),
//     };

//     // 1) **************** KEEP NODES ****************
//     floorPaths.forEach((_path) => {
//       var index = floorTempArray.nodes.length;
//       _path.geometry.coordinates.map((cord) => {
//         var isExist = floorTempArray.nodes.some((n) => n.coordinate[0] == cord[0] && n.coordinate[1] == cord[1]);
//         if (isExist == false) {
//           floorTempArray.nodes.push({
//             id: index,
//             coordinate: cord,
//           });
//           index += 1;
//         }
//       });
//     });

//     // 2) **************** KEEP EDGES ****************
//     floorPaths.forEach((_path) => {
//       const coordinates = _path.geometry.coordinates;
//       for (let i = 0; i < coordinates.length - 1; i++) {
//         const sourceCoordinate = coordinates[i];
//         const targetCoordinate = coordinates[i + 1];

//         const distance = turf.distance(turf.point(sourceCoordinate), turf.point(targetCoordinate));

//         const source = JSON.stringify(sourceCoordinate);
//         const target = JSON.stringify(targetCoordinate);

//         floorTempArray.edges.push({
//           source: source,
//           target: target,
//           weight: distance,
//           sourceCoordinate: sourceCoordinate as [number, number],
//           targetCoordinate: targetCoordinate as [number, number],
//         });

//         // Çift yönlü bağlantı
//         floorTempArray.edges.push({
//           source: target,
//           target: source,
//           weight: distance,
//           sourceCoordinate: targetCoordinate as [number, number],
//           targetCoordinate: sourceCoordinate as [number, number],
//         });
//       }
//     });

//     floorTempArray.edges.forEach((edge) => {
//       floorTempArray.gGraph.setNode(edge.source);
//       floorTempArray.gGraph.setNode(edge.target);
//       floorTempArray.gGraph.setEdge(edge.source, edge.target, edge.weight);
//     });

//     tempArray.push(floorTempArray);
//   });

//   store.dispatch(designGraphList({ updateModels: tempArray }));
// }

export function DesignGraph(): void {
  const graphList: Graph[] = [];

  const floors = store.getState().storageReducer.floorList;
  const paths = store.getState().storageReducer.intersectedPaths; // paths to intersectedPaths

  floors.forEach((floor) => {
    const newGraph = new Graph(floor.index);

    const floorPaths = paths.filter((f) => f.properties.floor == floor.index);
    if (floorPaths == null) {
      graphList.push(newGraph);
      return;
    }

    // 1) **************** KEEP NODES ****************
    floorPaths.forEach((path) => {
      var index = newGraph.nodes.length;
      path.geometry.coordinates.forEach((cord) => {
        var isExist = newGraph.nodes.some((n) => turf.booleanEqual(turf.point(n.coordinate), turf.point(cord)));
        if (isExist) return;
        newGraph.nodes.push({
          id: index,
          coordinate: cord,
        });
        index += 1;
      });
    });

    // 2) **************** KEEP EDGES ****************
    floorPaths.forEach((path) => {
      const coordinates = path.geometry.coordinates;
      for (let i = 0; i < coordinates.length - 1; i++) {
        const edgeStartCord = coordinates[i];
        const edgeEndCord = coordinates[i + 1];

        const distance = turf.distance(turf.point(edgeStartCord), turf.point(edgeEndCord));

        const source = JSON.stringify(edgeStartCord);
        const target = JSON.stringify(edgeEndCord);

        newGraph.edges.push({
          source: source,
          target: target,
          weight: distance,
          sourceCoordinate: edgeStartCord as [number, number],
          targetCoordinate: edgeEndCord as [number, number],
        });

        // Çift yönlü bağlantı sağlanabilmesi için
        newGraph.edges.push({
          source: target,
          target: source,
          weight: distance,
          sourceCoordinate: edgeEndCord as [number, number],
          targetCoordinate: edgeStartCord as [number, number],
        });
      }
    });

    // 3) **************** SET GRAPHLIB GRAPH ****************
    newGraph.edges.forEach((edge) => {
      newGraph.graphGraphLib.setNode(edge.source);
      newGraph.graphGraphLib.setNode(edge.target);
      newGraph.graphGraphLib.setEdge(edge.source, edge.target, edge.weight);
    });

    graphList.push(newGraph);
  });

  store.dispatch(setGraphList(graphList));
}

export function FindNearestNode(coordinate: Position, floor: number): Node {
  let nearestNode: Node | undefined = undefined;
  let minDistance = Infinity;

  const _graphList = store.getState().storageReducer.graphList;
  const graphData = _graphList.find((f) => f.floor == floor);
  if (graphData == null) throw new Error('Graph could not found by floor value in nearest node calculation');

  graphData.nodes.map((n) => {
    const dist = turf.distance(turf.point(coordinate), turf.point(n.coordinate), { units: 'meters' });
    if (dist < minDistance) {
      nearestNode = n;
      minDistance = dist;
    }
  });

  if (nearestNode == undefined) throw new Error('Nearest node could not found in nearest node calculation');

  return nearestNode;
}

export function FindNearestAdvancedPoint(startPolygon: PolygonGeoJson, targetPoly: PolygonGeoJson, direction: 'down' | 'up'): AdvancedPointGeoJson {
  const advancedPoints = store.getState().storageReducer.advancedPoints;
  if (advancedPoints == null) throw new Error('There is no any advancedpoint for navigation');

  // 1) sorgulanmak istenen lokasyonun bulunduğu kattaki gelişmiş noktalardan itenen yönlü olanları ve hedef konumun bulunduğu kata erişilebilen noktaları filtrele
  const filteredAdvancedPointList = advancedPoints.filter(
    (f) =>
      f.properties.floor == startPolygon.properties.floor &&
      f.properties.directionType == (direction == 'down' ? AdvancedPointDirectionTypesEnums.down : AdvancedPointDirectionTypesEnums.up) &&
      advancedPoints.some((x) => x.properties.groupId == f.properties.groupId && x.properties.floor == targetPoly.properties.floor)
  );

  let nearestAp: AdvancedPointGeoJson | undefined = undefined;
  let minDistance = Infinity;

  // 2) en yakın gelişmiş noktayı bul (groupId'si aynı olanlar üzerinden erişilirliği kontrol edebilirsin)
  filteredAdvancedPointList.map((ap) => {
    const dist = turf.distance(turf.point(startPolygon.properties.entrance?.geometry.coordinates!), turf.point(ap.geometry.coordinates), { units: 'meters' });
    if (dist < minDistance) {
      nearestAp = ap;
      minDistance = dist;
    }
  });

  if (nearestAp == undefined) throw new Error('Nearest advanced point could not found in nearest ap calculation');

  return nearestAp;
}

export function FindShortestPath(startCordinate: Position, targetCordinate: Position, floor: number): Position[] {
  var _graphList = store.getState().storageReducer.graphList;
  const graphData = _graphList.find((f) => f.floor == floor);
  if (graphData == null) throw new Error('Could not found graphdata after filter by floor value on finding shortest path!');

  const startCord = JSON.stringify(startCordinate);
  const targetCord = JSON.stringify(targetCordinate);
  const path = alg.dijkstra(graphData.graphGraphLib, startCord);

  const route: string[] = [];
  let current = targetCord;
  while (current !== startCord) {
    if (!path[current].predecessor) throw new Error('Hedefe ulaşmak mümkün değil!');

    // [target, before of last cord, ...] (hedef noktadan başlayıp bir öncekileri diziye attar başlangıca ulaşınca işlem biter)
    route.unshift(current);
    current = path[current].predecessor;
  }
  route.unshift(startCord);

  const data: number[][] = route.map((i) => JSON.parse(i));
  return data;
}
