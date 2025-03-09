import React, { useState } from 'react';
import { Button, Form, FormGroup, ListGroup, Stack } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { IoNavigateCircle, IoTrash } from 'react-icons/io5';
import { showAlertError, showAlertSuccess } from '../redux/reducers/alertSlice';
import Route from '../models/Route';
import { setRoutes } from '../redux/reducers/storageSlice';
import { ClearRoutes, GenerateRoutes, ShowRoute } from '../services/navigationService';

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
      drawnItemsRoute!.eachLayer(function (layer) {
        drawnItemsRoute!.removeLayer(layer);
      });

      if (startPolyId == null || targetPolyId == null) throw new Error('Please selecet start and target positions');
      
      const tempRouteList: Route[] = GenerateRoutes(startPolyId, targetPolyId);

      // Show 
      const currentResult = tempRouteList.find(f => f.floor== currentFloor?.index);
      if(currentResult != null) {
        ShowRoute(currentResult.path, drawnItemsRoute!);
      }

      dispatch(setRoutes(tempRouteList));
    }
    catch (error) {
      dispatch(showAlertSuccess({ message: (error as Error).message }));
    }
  }
  
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