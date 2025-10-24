import { useState } from 'react';
import { Button, ListGroup, Stack } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaLocationDot, FaTrash, FaPen } from 'react-icons/fa6';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { removeEntrancePoint, removePolygon } from '../redux/reducers/storageSlice';
import { HidePolygon, ShowOrHidePolygon } from '../services/polygonService';
import { HideEntrancePoint, ShowEntrancePoint } from '../services/entrancePointService';
import ModalPolygonInfo from './ModalPolygonInfo';

function Polygons() {
  const dispath = useAppDispatch();

  const drawnItems = useAppSelector((state) => state.mapReducer.drawnItems);
  const currentFloor = useAppSelector((state) => state.appReducer.currentFloor);
  const polygonList = useAppSelector((state) => state.storageReducer.polygons);

  // ------------------ FORM POLYGON INFO ------------------
  const [showPolyEdit, setShowPolyEdit] = useState(false);
  const [polygonId, setPolygonId] = useState<string>('');
  // ------------------ FORM POLYGON INFO ------------------

  function ShowModalPolygonInformation(id: string): void {
    setPolygonId(id);
    setShowPolyEdit(true);
  }

  function HandleShowPolygonEntrance(polygonId: string): void {
    const selectedPoly = polygonList.find((p) => p.properties.id == polygonId)!;
    if (selectedPoly.properties.entrance == null) {
      alert('Entrance property not found on polygon for showing entrance point');
      return;
    }
    const entrancePoint = selectedPoly.properties.entrance;
    ShowEntrancePoint(entrancePoint, drawnItems!);
  }

  function HandleShowPolygon(id: string): void {
    const poly = polygonList.find((p) => p.properties.id == id)!;

    const isShowed = ShowOrHidePolygon(poly, drawnItems!);

    if (poly.properties.entrance != null) {
      if (isShowed) {
        ShowEntrancePoint(poly.properties.entrance, drawnItems!);
      } else {
        HideEntrancePoint(poly.properties.entrance, drawnItems!);
      }
    }
  }

  function HandleDeletePolygon(id: string): void {
    const polygon = polygonList.find((p) => p.properties.id == id)!;

    HidePolygon(polygon, drawnItems!);
    if (polygon.properties.entrance != null) {
      HideEntrancePoint(polygon.properties.entrance, drawnItems!);
    }

    dispath(removePolygon(polygon.properties.id));
    if (polygon.properties.entrance != null) {
      dispath(removeEntrancePoint(polygon.properties.entrance.properties.id));
    }
  }

  function IsOnMap(_leaflet_id: number): boolean {
    if (drawnItems != null) {
      return drawnItems.getLayer(_leaflet_id) != null ? true : false;
    }
    return false;
  }

  return (
    <>
      <ListGroup className="shadow" style={{maxHeight: '400px', overflow: 'auto'}}>
        <ListGroup.Item className="bg-light text-primary fw-bold">Konum Listesi</ListGroup.Item>
        {polygonList != null && drawnItems != null &&
          polygonList
            .filter((f) => currentFloor != null && f.properties.floor == currentFloor?.index)
            .map((p) => (
              <ListGroup.Item key={p.properties.id} className="fw-light">
                <Stack direction={'horizontal'} className="justify-content-between">
                  <span>{p.properties.name}</span>
                  <Stack direction="horizontal" gap={1}>
                    <Button onClick={() => ShowModalPolygonInformation(p.properties.id)} variant="warning" size="sm">
                      <FaPen size={14} />
                    </Button>
                    <Button onClick={() => HandleShowPolygonEntrance(p.properties.id)} variant="dark" size="sm">
                      <FaLocationDot color="#fff" size={14} />
                    </Button>
                    {IsOnMap(p.properties.layerId!) ? (
                      <Button onClick={() => HandleShowPolygon(p.properties.id)} variant="primary" size="sm">
                        <FaEye color="#fff" size={14} />
                      </Button>
                    ) : (
                      <Button onClick={() => HandleShowPolygon(p.properties.id)} variant="secondary" size="sm">
                        <FaEyeSlash color="#fff" size={14} />
                      </Button>
                    )}
                    <Button onClick={() => HandleDeletePolygon(p.properties.id)} variant="danger" size="sm">
                      <FaTrash color="#fff" size={14} />
                    </Button>
                  </Stack>
                </Stack>
              </ListGroup.Item>
            ))}
      </ListGroup>

      <ModalPolygonInfo isShowing={showPolyEdit} polygonId={polygonId} showModal={setShowPolyEdit} />
    </>
  );
}

export default Polygons;
