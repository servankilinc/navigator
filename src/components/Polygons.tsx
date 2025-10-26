import React, { useState } from 'react';
import { Button, ListGroup, Stack } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaLocationDot, FaTrash, FaPen } from 'react-icons/fa6';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { removeEntrancePoint, removePolygon } from '../redux/reducers/storageSlice';
import { HidePolygon, ShowOrHidePolygon } from '../services/polygonService';
import { HideEntrancePoint, ShowEntrancePoint } from '../services/entrancePointService';
import ModalPolygonInfo from './ModalPolygonInfo';
import PolygonGeoJson from '../models/Features/PolygonGeoJson';

function Polygons() {
  const currentFloor = useAppSelector((state) => state.appReducer.currentFloor);
  const polygonList = useAppSelector((state) => state.storageReducer.polygons);
  return (
    <>
      <ListGroup className="shadow" style={{ maxHeight: '300px', overflow: 'auto' }}>
        <ListGroup.Item className="bg-light text-primary fw-bold">Konum Listesi</ListGroup.Item>
        {polygonList &&
          polygonList
            .filter((f) => currentFloor != null && f.properties.floor == currentFloor?.index)
            .map((p) => (
              <ListGroup.Item key={p.properties.id} className="fw-light">
                <Stack direction={'horizontal'} className="justify-content-between">
                  <span>{p.properties.name}</span>
                  <ControlButtons key={p.properties.id} polygon={p} />
                </Stack>
              </ListGroup.Item>
            ))}
      </ListGroup>
    </>
  );
}

function ControlButtons({ polygon }: { polygon: PolygonGeoJson }): React.JSX.Element {
  const dispath = useAppDispatch();

  const drawnItems = useAppSelector((state) => state.mapReducer.drawnItems);

  // ------------------ FORM POLYGON INFO ------------------
  const [isOnMap, setIsOnMap] = useState(true);
  const [showPolyEdit, setShowPolyEdit] = useState(false);
  const [polygonId, setPolygonId] = useState<string>('');
  // ------------------ FORM POLYGON INFO ------------------

  function ShowModalPolygonInformation(): void {
    setPolygonId(polygon.properties.id);
    setShowPolyEdit(true);
  }

  function HandleShowPolygonEntrance(): void {
    if (polygon.properties.entrance == null) {
      alert('Entrance property not found on polygon for showing entrance point');
      return;
    }
    const entrancePoint = polygon.properties.entrance;
    ShowEntrancePoint(entrancePoint, drawnItems!);
  }

  function HandleShowPolygon(): void {
    const isShowed = ShowOrHidePolygon(polygon, drawnItems!);
    setIsOnMap(isShowed);
    if (polygon.properties.entrance != null) {
      if (isShowed) {
        ShowEntrancePoint(polygon.properties.entrance, drawnItems!);
      } else {
        HideEntrancePoint(polygon.properties.entrance, drawnItems!);
      }
    }
  }

  function HandleDeletePolygon(): void {
    HidePolygon(polygon, drawnItems!);
    if (polygon.properties.entrance != null) {
      HideEntrancePoint(polygon.properties.entrance, drawnItems!);
    }

    dispath(removePolygon(polygon.properties.id));
    if (polygon.properties.entrance != null) {
      dispath(removeEntrancePoint(polygon.properties.entrance.properties.id));
    }
  }

  return (
    <>
      <Stack direction="horizontal" gap={1}>
        <Button onClick={() => ShowModalPolygonInformation()} variant="warning" size="sm" className="py-0 px-1">
          <FaPen size={12} />
        </Button>
        <Button onClick={() => HandleShowPolygonEntrance()} variant="dark" size="sm" className="py-0 px-1">
          <FaLocationDot size={12} />
        </Button>
        {isOnMap ? (
          <Button onClick={() => HandleShowPolygon()} variant="primary" size="sm" className="py-0 px-1">
            <FaEye size={12} />
          </Button>
        ) : (
          <Button onClick={() => HandleShowPolygon()} variant="secondary" size="sm" className="py-0 px-1">
            <FaEyeSlash size={12} />
          </Button>
        )}
        <Button onClick={() => HandleDeletePolygon()} variant="danger" size="sm" className="py-0 px-1">
          <FaTrash size={12} />
        </Button>
      </Stack>

      <ModalPolygonInfo isShowing={showPolyEdit} polygonId={polygonId} showModal={setShowPolyEdit} />
    </>
  );
}

export default Polygons;
