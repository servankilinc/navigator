import React from 'react';
import { Button, ListGroup, Stack } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { FaEye, FaEyeSlash, FaTrash } from 'react-icons/fa6';
import { HidePath, ShowOrHidePath } from '../services/pathService';
import { removePath } from '../redux/reducers/storageSlice';

export default function Paths(): React.JSX.Element {
  const dispatch = useAppDispatch();

  const drawnItems = useAppSelector((state) => state.mapReducer.drawnItems);
  const currentFloor = useAppSelector((state) => state.appReducer.currentFloor);
  const pathList = useAppSelector((state) => state.storageReducer.paths);

  function HandleShowPath(id: string): void {
    const path = pathList.find((p) => p.properties.id == id)!;
    ShowOrHidePath(path, drawnItems!);
  }

  function IsOnMap(_leaflet_id: number): boolean {
    if (drawnItems != null) {
      return drawnItems.getLayer(_leaflet_id) != null ? true : false;
    }
    return false;
  }

  function HandleDeletePath(id: string): void {
    const path = pathList.find((p) => p.properties.id == id)!;
    HidePath(path, drawnItems!);
    dispatch(removePath(path.properties.id));
  }

  return (
    <ListGroup>
      <ListGroup.Item className="bg-light text-primary fw-bold">Yol Listesi</ListGroup.Item>
      {pathList != null &&
        drawnItems != null &&
        pathList
          .filter((f) => currentFloor != null && f.properties.floor == currentFloor?.index)
          .map((p) => (
            <ListGroup.Item key={p.properties.id} className="fw-light">
              <Stack direction={'horizontal'} className="justify-content-between">
                <span>{p.properties.name}</span>
                <Stack direction="horizontal" gap={1}>
                  {IsOnMap(p.properties.layerId!) ? (
                    <Button onClick={() => HandleShowPath(p.properties.id)} variant="primary" size="sm">
                      <FaEye color="#fff" size={14} />
                    </Button>
                  ) : (
                    <Button onClick={() => HandleShowPath(p.properties.id)} variant="secondary" size="sm">
                      <FaEyeSlash color="#fff" size={14} />
                    </Button>
                  )}
                  <Button onClick={() => HandleDeletePath(p.properties.id)} variant="danger" size="sm">
                    <FaTrash color="#fff" size={14} />
                  </Button>
                </Stack>
              </Stack>
            </ListGroup.Item>
          ))}
    </ListGroup>
  );
}
