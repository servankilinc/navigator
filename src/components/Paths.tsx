import React, { useState } from 'react';
import { Button, ListGroup, Stack } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { FaEye, FaEyeSlash, FaTrash } from 'react-icons/fa6';
import { HidePath, ShowOrHidePath } from '../services/pathService';
import { removePath } from '../redux/reducers/storageSlice';
import LineStringGeoJson from '../models/Features/LineStringGeoJson';

export default function Paths(): React.JSX.Element {
  const currentFloor = useAppSelector((state) => state.appReducer.currentFloor);
  const pathList = useAppSelector((state) => state.storageReducer.paths);

  return (
    <ListGroup className="shadow" style={{ maxHeight: '400px', overflow: 'auto' }}>
      <ListGroup.Item className="bg-light text-primary fw-bold">Yol Listesi</ListGroup.Item>
      {pathList != null &&
        pathList
          .filter((f) => currentFloor != null && f.properties.floor == currentFloor?.index)
          .map((p) => (
            <ListGroup.Item key={p.properties.id} className="fw-light">
              <Stack direction={'horizontal'} className="justify-content-between">
                <span>
                  {p.properties.name} {p.geometry.coordinates.length}
                </span>
                <ControlButtons key={p.properties.id} path={p} />
              </Stack>
            </ListGroup.Item>
          ))}
    </ListGroup>
  );
}

function ControlButtons({ path }: { path: LineStringGeoJson }): React.JSX.Element {
  const dispatch = useAppDispatch();

  const drawnItems = useAppSelector((state) => state.mapReducer.drawnItems);
  const [isOnMap, setIsOnMap] = useState(true);

  function HandleShowPath(): void {
    const isShowed = ShowOrHidePath(path, drawnItems!);
    setIsOnMap(isShowed);
  }

  function HandleDeletePath(): void {
    HidePath(path, drawnItems!);
    dispatch(removePath(path.properties.id));
  }

  return (
    <Stack direction="horizontal" gap={1}>
      {isOnMap ? (
        <Button onClick={() => HandleShowPath()} variant="primary" size="sm" className="py-0 px-1">
          <FaEye color="#fff" size={12} />
        </Button>
      ) : (
        <Button onClick={() => HandleShowPath()} variant="secondary" size="sm" className="py-0 px-1">
          <FaEyeSlash color="#fff" size={12} />
        </Button>
      )}
      <Button onClick={() => HandleDeletePath()} variant="danger" size="sm" className="py-0 px-1">
        <FaTrash color="#fff" size={12} />
      </Button>
    </Stack>
  );
}
