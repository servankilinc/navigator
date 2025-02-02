import { useState } from "react";
import * as L from 'leaflet';
import * as turf from '@turf/turf';
import { alg } from 'graphlib';
import { Button, Form, FormGroup, ListGroup, Stack } from "react-bootstrap";
import { useAppSelector } from "../redux/hooks";
import { IoNavigateCircle, IoTrash } from "react-icons/io5";
import { ClearRoutes } from "../services/pathService";
import { FeatureCollection, GeoJsonProperties, Point, Position } from "geojson";
import Node from "../models/Node";

export default function NavigationController() {
  
  const drawnItems = useAppSelector((state) => state.mapReducer.drawnItems);
  const drawnItemsRoute = useAppSelector((state) => state.mapReducer.drawnItemsRoute);

  const currentFloor = useAppSelector((state) => state.appReducer.currentFloor);
  const polygonList = useAppSelector((state) => state.storageReducer.polygons);
  const pathList = useAppSelector((state) => state.storageReducer.paths);
  const graphList = useAppSelector((state) => state.storageReducer.graphList);

  const [startPolyId, setStartPolyId] = useState<string>();
  const [targetPolyId, setTargetPolyId] = useState<string>();
  
  function HandleNavigation(): void { 
    if(startPolyId == null || targetPolyId == null){
      alert("Please selecet start and target positions");
      return;
    }
    FindIntersections();
    DesignGraph();
    const nearestNodeToStart = FindNearestNode(startPolyId);
    const nearestNodeToEnd = FindNearestNode(targetPolyId);

    // drawnItemsRoute.addLayer(
    //   L.marker([nearestNodeToStart.coordinate[1], nearestNodeToStart.coordinate[0]])
    // );
    // drawnItemsRoute.addLayer(
    //   L.marker([nearestNodeToEnd.coordinate[1], nearestNodeToEnd.coordinate[0]])
    // );

    const route = FindShortestPath(nearestNodeToStart.coordinate, nearestNodeToEnd.coordinate, currentFloor!.index);
    console.log('En Kisa Yol:', route);
      
    var _cordsLine: L.LatLngExpression[] = [];
    route.map(([lng, lat]) => _cordsLine.push({lat: lat, lng: lng}));
    drawnItemsRoute!.addLayer(
      L.polyline(_cordsLine, {
        color: 'orange',
      })
    );
  
  }


  function FindIntersections(): void {
    pathList.map((path1) => {
      pathList.filter((f) => path1.properties.floor == f.properties.floor && path1.properties.id != f.properties.id).map((path2) => {
        const linePath1 = turf.lineString(path1.geometry.coordinates);
        const linePath2 = turf.lineString(path2.geometry.coordinates);

        const intersect = turf.lineIntersect(linePath1, linePath2);

        if (intersect.features.length > 0) {
          ConnectIntersections(intersect, path1.geometry.coordinates, path2.geometry.coordinates);
        } 
        else {
          CheckBufferIntersection(path1.geometry.coordinates, path2.geometry.coordinates);
        }
      });
    });
  }

  function ConnectIntersections(intersect: FeatureCollection<Point, GeoJsonProperties>, coordinateListPath1: Position[], coordinateListPath2: Position[]) {
    /*
      intersect.features.forEach((feature) => {
      var cordinate = feature.geometry.coordinates;
    */
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
              coordinateListPath1.splice(k + 1, 0, cordinate);
            }
            if (!isExistOnPath2) {
              coordinateListPath2.splice(m + 1, 0, cordinate);
            }
  
            drawnItemsRoute!.addLayer(
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
 
  function CheckBufferIntersection(coordinateListPath1: number[][], coordinateListPath2: number[][]): void {
    // ***** kesişim olmaması durumunda *****
    // 1) tampon bölgeler ile tekrar kesişimi kontrol et
    // 2) eğer kesişim olursa kesişimin üzerinde olduğu segment'te kesişim noktası düğüm olarak eklenir 
    // 3) diğer segmentin kesişime neden olan yakın düğümünün konumu kesişim noktası olarak düzenlenir 
    
    const tolerance = 3;
  
    var _continue = true;
    for (let k = 0; _continue && k < coordinateListPath1.length - 1; k++) {
      for (let m = 0; _continue && m < coordinateListPath2.length - 1; m++) {
        const segment1 = turf.lineString([coordinateListPath1[k], coordinateListPath1[k + 1]]);
        const segment2 = turf.lineString([coordinateListPath2[m], coordinateListPath2[m + 1]]);
  
        const buffer1 = turf.buffer(segment1, tolerance, { units: 'meters' });
        const buffer2 = turf.buffer(segment2, tolerance, { units: 'meters' });
        if(buffer1 == null ||  buffer2 == null){
          alert("Buffer is coming undefined on buffer checking");
          continue;
        }
        
        var isInterSect = turf.booleanIntersects(buffer1, buffer2);
        if (isInterSect == false) {
          continue;
        }
  
            const intersectPoly = turf.intersect(turf.featureCollection([buffer1, buffer2]));
            if(intersectPoly == null){
              alert("Intersection bufer as a Polygon is coming undefined on buffer checking");
              continue;
            }
  
        if (intersectPoly.geometry.coordinates.length > 0) {
          var med = Math.floor(intersectPoly.geometry.coordinates[0].length / 2);
          var cordinate: Position | Position[] = intersectPoly.geometry.coordinates[0][med] as Position;
     
          var isExistOnPath1 = coordinateListPath1.some((c) => c[0] == cordinate[0] && c[1] == cordinate[1]);
          var isExistOnPath2 = coordinateListPath2.some((c) => c[0] == cordinate[0] && c[1] == cordinate[1]);
  
          var isFirstSegmentResizing = true; // kesişim noktasına en yakın düğüme sahip segment bulmak için
          var indexNearestNodeToIntersection:number | undefined = undefined; // kesişim noktasına en yakın düğümün index değeri
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
  
          if(indexNearestNodeToIntersection == undefined){
            alert("indexNearestNodeToIntersection could not calculated");
            continue;
          }
  
          if (!isExistOnPath1) {
            if (isFirstSegmentResizing) {
              // ilk segmentin düğüm noka kordinatı değişmeli
              coordinateListPath1[indexNearestNodeToIntersection] = cordinate;
            } else {
              // ilk segmentin arasına kesişim noktası girmeli
              coordinateListPath1.splice(k + 1, 0, cordinate);
            }
          }
          if (!isExistOnPath2) {
            if (isFirstSegmentResizing == false) {
              // ikinci segmentin düğüm noka kordinatı değişmeli
              coordinateListPath2[indexNearestNodeToIntersection] = cordinate;
            } else {
              // ikinci segmentin arasına kesişim noktası girmeli
              coordinateListPath2.splice(m + 1, 0, cordinate);
            }
          }
  
          drawnItemsRoute!.addLayer(
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

  function DesignGraph(): void {
    graphList.map((graphData) => {
      var floorPaths = pathList.filter((f) => f.properties.floor == graphData.floor);
      if (floorPaths == null) {
        return;
      }

      // set nodes
      floorPaths.forEach((_path) => {
        var index = graphData.nodes.length;
        _path.geometry.coordinates.map((cord) => {
          var isExist = graphData.nodes.some((n) => n.coordinate[0] == cord[0] && n.coordinate[1] == cord[1]);
          if (isExist == false) {
            graphData.nodes.push({
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

          graphData.edges.push({
            source: source,
            target: target,
            weight: distance,
            sourceCoordinate: sourceCoordinate as [number, number],
            targetCoordinate: targetCoordinate as [number, number],
          });
          
          // Çift yönlü bağlantı
          graphData.edges.push({
            source: target,
            target: source,
            weight: distance,
            sourceCoordinate: targetCoordinate as [number, number],
            targetCoordinate: sourceCoordinate as [number, number],
          });
        }
      });

      graphData.edges.forEach((edge) => {
        graphData.graphGraphLib.setNode(edge.source);
        graphData.graphGraphLib.setNode(edge.target);
        graphData.graphGraphLib.setEdge(edge.source, edge.target, edge.weight);
      });
    });
  }
  
  function FindNearestNode(polygonId: string): Node {
    const polygon = polygonList.find((p) => p.properties.id == polygonId);
    if (polygon == null) {
      throw new Error('Polygon colud not found on finding nearest node');
    }
    if (polygon.properties.entrance == null) {
      throw new Error('Entrance poin colud not found in polygon on finding nearest node');
    }
    const cordinate = polygon.properties.entrance.geometry.coordinates;

    let nearestNode: Node | undefined = undefined;
    let minDistance = Infinity;

    var graphData = graphList.find((f) => f.floor == polygon.properties.floor);
    if (graphData == null) {
      throw new Error('Graph could not found by floor value in nearest node calculation');
    }

    graphData.nodes.map((n) => {
      const dist = turf.distance(turf.point(cordinate), turf.point(n.coordinate), {
        units: 'meters',
      });
      if (dist < minDistance) {
        nearestNode = n;
        minDistance = dist;
      }
    });

    if (nearestNode == undefined) {
      throw new Error('Nearest node could not found in nearest node calculation');
    }
    return nearestNode;
  }

  function FindShortestPath(startCordinate: Position, targetCordinate: Position, floor: number): Position[] {
    const graphData = graphList.find((f) => f.floor == floor);
    if (graphData == null) {
      throw new Error('Could not found graphdata after filter by floor value on finding shortest path!');
    }

    const startCord = JSON.stringify(startCordinate);
    const targetCord = JSON.stringify(targetCordinate);

    const path = alg.dijkstra(graphData.graphGraphLib, startCord);

    const route: string[] = [];
    let current = targetCord;

    while (current !== startCord) {
      if (!path[current].predecessor) {
        throw new Error('Hedefe ulaşmak mümkün değil!');
      }
      // [target, before of last cord, ...] (hedef noktadan başlayıp bir öncekileri diziye attar başlangıca ulaşınca işlem biter)
      route.unshift(current);
      current = path[current].predecessor;
    }

    route.unshift(startCord);

    const data: number[][] = route.map((i) => JSON.parse(i));
    return data;
  }

  function HandleClear(): void {
    if(drawnItemsRoute == null){
      alert("DrawnItesm Route not found");
      return;
    }
    ClearRoutes(drawnItemsRoute);
  }

  return (
    <ListGroup className="shadow">
      <ListGroup.Item className="bg-light text-primary fw-bold">Rota Kontrol</ListGroup.Item>
        <ListGroup.Item className="p-2">
        <FormGroup>
          <Form.Label>Başlangıç Konum</Form.Label>
          <Form.Select value={startPolyId} onChange={(e) => setStartPolyId(e.target.value)}>
            {polygonList != null && drawnItems != null && polygonList
              .map((poly) => <option key={poly.properties.id}>{poly.properties.name}</option>)
            }
          </Form.Select>
        </FormGroup>
        <FormGroup>
          <Form.Label>Hedef Konum</Form.Label>
          <Form.Select value={targetPolyId} onChange={(e) => setTargetPolyId(e.target.value)}>
            {polygonList != null && drawnItems != null &&  drawnItemsRoute != null && 
              polygonList.map((poly) => <option key={poly.properties.id}>{poly.properties.name}</option>)
            }
          </Form.Select>
        </FormGroup>
        
        <Stack direction="horizontal" className="justify-content-around py-4">
          <Button variant="success" onClick={HandleNavigation}>
            <IoNavigateCircle color="white" />
          </Button>
          <Button variant="danger" onClick={HandleClear}>
            <IoTrash color="white" />
          </Button>
        </Stack>
      </ListGroup.Item>
    </ListGroup>
  );
}
