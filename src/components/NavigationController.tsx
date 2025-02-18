import React, { useState } from 'react';
import { Button, Form, FormGroup, ListGroup, Stack } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { IoNavigateCircle, IoTrash } from 'react-icons/io5';
import { ClearRoutes } from '../services/pathService';
import { DesignGraph, FindNearestAdvancedPoint, FindNearestNode, FindShortestPath } from '../services/graphService';
import { showAlertError, showAlertSuccess } from '../redux/reducers/alertSlice';
import e7 from '../scripts/idGenerator';
import Route from '../models/Route';
import { setRoutes } from '../redux/reducers/storageSlice';

export default function NavigationController(): React.JSX.Element {
  const dispatch = useAppDispatch();

  const drawnItems = useAppSelector((state) => state.mapReducer.drawnItems);
  const drawnItemsRoute = useAppSelector((state) => state.mapReducer.drawnItemsRoute);

  const currentFloor = useAppSelector((state) => state.appReducer.currentFloor);
  const polygonList = useAppSelector((state) => state.storageReducer.polygons);

  const [startPolyId, setStartPolyId] = useState<string>();
  const [targetPolyId, setTargetPolyId] = useState<string>();

  function HandleNavigation(): void {
    try {
      if (startPolyId == null || targetPolyId == null) throw new Error('Please selecet start and target positions');
      const startPoly = polygonList.find(f => f.properties.id == startPolyId);
      const targetPoly = polygonList.find(f => f.properties.id == targetPolyId);
      if (startPoly == null || targetPoly == null) throw new Error('Start or Target locations not found');

      DesignGraph();

      const nearestNodeToStart = FindNearestNode(startPoly);
      const nearestNodeToTarget = FindNearestNode(targetPoly);
      
      const tempRouteList: Route[] = [];
      // 1) İki konum da aynı katta ise 
      if (startPoly.properties.floor == targetPoly.properties.floor){
        const route = FindShortestPath(nearestNodeToStart.coordinate, nearestNodeToTarget.coordinate, currentFloor!.index);
        
        tempRouteList.push({
          id: e7(), 
          floor: startPoly.properties.floor,
          path: route
        })
      }
      // 2) Başlangıç konumu üstte veya aşağıda ise
      else{
        const direction = startPoly.properties.floor > targetPoly.properties.floor;
        
        const floorDiff = direction ? targetPoly.properties.floor - startPoly.properties.floor :  startPoly.properties.floor - targetPoly.properties.floor;
        const nearestAdvancedPoint = direction ? FindNearestAdvancedPoint(startPoly, targetPoly, "down") : FindNearestAdvancedPoint(startPoly, targetPoly, "up");
        

        for (let index = 0; index < floorDiff; index++) {
          if (index == 0) { // Başlangıç Konumunun Bullunduğu Katı
            const _floorIndex = startPoly.properties.floor;
            const route = FindShortestPath(nearestNodeToStart.coordinate, nearestAdvancedPoint.geometry.coordinates, _floorIndex);
            
            tempRouteList.push({
              id: e7(), 
              floor: _floorIndex,
              path: route
            })
          }
          else if (floorDiff - index > 1){ // Ara Kat
            // Todo: Arak Katlar için Görselleştirme Eklenmeli
          }
          else { // Hedef Konumun Bullunduğu Kat
            const _floorIndex = targetPoly.properties.floor;
            const route = FindShortestPath(nearestNodeToTarget.coordinate, nearestAdvancedPoint.geometry.coordinates, _floorIndex);
            
            tempRouteList.push({
              id: e7(), 
              floor: _floorIndex,
              path: route
            })
          }
        }
      }
      console.log("TEMP => ", tempRouteList)
      dispatch(setRoutes(tempRouteList));
    }
    catch (error) {
      dispatch(showAlertSuccess({ message: (error as Error).message }));
    }
  }

  // function CreateNavigationRoute(geoJson: LineStringGeoJson, layer: CustomLayer, _id: string, floor: number, drawnItemsRoute: L.FeatureGroup<any>) {
  //   (geoJson as LineStringGeoJson).properties = {
  //     layerId: (layer as any)._leaflet_id,
  //     id: _id,
  //     floor: floor,
  //     name: 'Yol',
  //     popupContent: `Yol Bilgisi, Kat:${floor} ID:${_id}`,
  //   };
  //   const _newPathList = [...store.getState().storageReducer.paths, geoJson];
  //   store.dispatch(addRoutePath(geoJson as LineStringGeoJson));
  // }

  // function CreateNavigationRoute(geoJson: AdvancedPointGeoJson, layer: CustomLayer, _id: string, floor: number, drawnItems: L.FeatureGroup<any>) {
  //   drawnItems.addLayer(layer);
  //   geoJson.properties = {
  //     layerId: (layer as any)._leaflet_id,
  //     id: _id,
  //     floor: 404, //currentFloorRef.current!.index,
  //     name: 'Gelişmiş Nokta',
  //     popupContent: `Gelişmiş Nokta Bilgisi, Kat:${floor} ID:${_id}`,
  //   };
  //   store.dispatch(addAdvancedPoint(geoJson as AdvancedPointGeoJson));
  // }
  
  function HandleClear(): void {
    try {
      ClearRoutes(drawnItemsRoute);
    }
    catch (error) {
      dispatch(showAlertError({ message: (error as Error).message }));
    }
  }

  return (
    <ListGroup className="shadow">
      <ListGroup.Item className="bg-light text-primary fw-bold">Rota Kontrol</ListGroup.Item>
      <ListGroup.Item className="p-2">
        <FormGroup>
          <Form.Label>Başlangıç Konum</Form.Label>
          <Form.Select value={startPolyId} onChange={(e) => setStartPolyId(e.target.value)}>
            {polygonList != null && drawnItems != null && polygonList.map((poly) => (
                <option key={poly.properties.id} value={poly.properties.id}>
                  {poly.properties.name}
                </option>
              ))}
          </Form.Select>
        </FormGroup>
        <FormGroup>
          <Form.Label>Hedef Konum</Form.Label>
          <Form.Select value={targetPolyId} onChange={(e) => setTargetPolyId(e.target.value)}>
            {polygonList != null && drawnItems != null && drawnItemsRoute != null &&
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
