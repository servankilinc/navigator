import { useState } from 'react';
import * as L from 'leaflet';
import * as turf from '@turf/turf';
import { alg } from 'graphlib';
import { Button, Form, FormGroup, ListGroup, Stack } from 'react-bootstrap';
import { useAppSelector } from '../redux/hooks';
import { IoNavigateCircle, IoTrash } from 'react-icons/io5';
import { ClearRoutes } from '../services/pathService';
import { Position } from 'geojson';
import Node from '../models/Node';
import { store } from '../redux/store';
import { DesignGraph, FindIntersections } from '../services/graphService';

export default function NavigationController() {

  const drawnItems = useAppSelector((state) => state.mapReducer.drawnItems);
  const drawnItemsRoute = useAppSelector((state) => state.mapReducer.drawnItemsRoute);

  const currentFloor = useAppSelector((state) => state.appReducer.currentFloor);
  const polygonList = useAppSelector((state) => state.storageReducer.polygons);
  const pathList = useAppSelector((state) => state.storageReducer.paths);
  const graphList = useAppSelector((state) => state.storageReducer.graphList);

  const [startPolyId, setStartPolyId] = useState<string>();
  const [targetPolyId, setTargetPolyId] = useState<string>();
  
  
  // ################################ HANDLER NAVIGATION ################################
  function HandleNavigation(): void {
    if (startPolyId == null || targetPolyId == null) { alert('Please selecet start and target positions'); return; }

    // x) Gelişmiş Nokta Geliştirmeleri 
    //    1) Eklenen Gelişmiş Noktanın hangi katlarda bulunduğunu seçitrip seçilen katlar için kayıt atılmalı
    //    2) Seçilen Kat Bilgilerine göre sadece aşağı, yukarı veya iki yönlü bilgisini girerek kaydet 

    // a) Yol Geliştirmeleri
    //    1) Yollardaki segmentleri 3 metre aralıklar ile böl  segmenet başlangıç ile bitiş arası 3 den fazla ise 
    //      *) başlangıç düğümünden 3 metre ilerisine bir düğüm eklenir     
    //      *) eklenen düğüm ile ana segmentin bitiş noktası arasında 3 den faza ise bir düğüm daha eklenir
  
    // b) Navigasyon Geliştirmeleri
    //    1) Sorgulayacağın iki konum aynı katta mı diye kontrol et
    //      *) Aynı Katta Değilse Aynı Şekilde işlemler devam etsin

    //      *) Farklı Katta ise 
    //      **) Başlangıç Yukarıda ise
    //      ****) en yakın advancedpointi bul aşağı yönü bulunan
    //      **) Başlangıç Aşağıda ise
    //      ****) en yakın advancedpointi bul yukarı yönü bulunan 
    //      **) başlangıç konumunun buldunduğu noktadan en yakın gelişmiş noktaya  FindShortestPath Fonksiyonunu ile yol çiz
    //      **) birsonraki konumunun buldunduğu kat hedef ile aynı değilse
    //      ****) aşağı yölü ise katı bir azaltıp veya tam tersi, birsonraki konumunun(Bir önceki katın gelişmiş noktası) buldunduğu noktadan en yakın gelişmiş noktaya  FindShortestPath Fonksiyonunu ile yol çiz
    //      **) birsonraki konumunun buldunduğu kat hedef ile aynı ise
    //      ****)  hedef konum ile gelinen gelişmiş noktra arasında FindShortestPath Fonksiyonunu ile yol çiz
     
    //    2) Başlangıç ve Hedef Konum arasındaki her kat için çizim yapman gerkiyor eğer katlar farklı ise
    //      *) katlar arası geçiş yapraken drawnItemsRoute de kullanılacak şekilde geliştirmeler Floor.tsx içine yazılmalı 
    //      *) katlar arası geçiş yapraken drawnItemsRoute de kullanılacak şekilde geliştirmeler Floor.tsx içine yazılmalı 

    FindIntersections(pathList, drawnItems!);
    DesignGraph(graphList);
    
    const nearestNodeToEnd = FindNearestNode(targetPolyId);
    const nearestNodeToStart = FindNearestNode(startPolyId);
    
    const route = FindShortestPath(nearestNodeToStart.coordinate, nearestNodeToEnd.coordinate, currentFloor!.index);

    var _cordsLine: L.LatLngExpression[] = [];
    route.map(([lng, lat]) => _cordsLine.push({lat: lat, lng: lng}));
    drawnItemsRoute!.addLayer(
      L.polyline(_cordsLine, {
        color: 'orange',
      })
    );
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

    var _graphList = store.getState().storageReducer.graphList;

    var graphData = _graphList.find((f) => f.floor == polygon.properties.floor);
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
    var _graphList = store.getState().storageReducer.graphList;

    const graphData = _graphList.find((f) => f.floor == floor);
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
    if (drawnItemsRoute == null) {
      alert('DrawnItesm Route not found');
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
            {polygonList != null &&
              drawnItems != null &&
              polygonList.map((poly) => (
                <option key={poly.properties.id} value={poly.properties.id}>
                  {poly.properties.name}
                </option>
              ))}
          </Form.Select>
        </FormGroup>
        <FormGroup>
          <Form.Label>Hedef Konum</Form.Label>
          <Form.Select value={targetPolyId} onChange={(e) => setTargetPolyId(e.target.value)}>
            {polygonList != null &&
              drawnItems != null &&
              drawnItemsRoute != null &&
              polygonList.map((poly) => (
                <option key={poly.properties.id} value={poly.properties.id}>
                  {poly.properties.name}
                </option>
              ))}
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
