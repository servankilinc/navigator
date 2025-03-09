import React, { useState } from 'react';
import { Button, ListGroup, Stack } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { FaEye, FaEyeSlash, FaPen, FaTrash } from 'react-icons/fa6';
import { HideAdvancedPoint, ShowOrHideAdvancedPoint } from '../services/advancedPointService';
import { removeAdvancedPoint } from '../redux/reducers/storageSlice';
import ModalAdvencedPointInfo from './ModalAdvencedPointInfo';

export default function AdvancedPoints(): React.JSX.Element {
  const dispatch = useAppDispatch();

  const drawnItems = useAppSelector((state) => state.mapReducer.drawnItems);
  const currentFloor = useAppSelector((state) => state.appReducer.currentFloor);
  const advancedPoints = useAppSelector((state) => state.storageReducer.advancedPoints);

  const [showAdvPointEdit, setShowAdvPointEdit] = useState(false);
  const [advPointId, setAdvPointId] = useState<string>('');

  function HandleShow(id: string): void {
    const path = advancedPoints.find((p) => p.properties.id == id)!;
    ShowOrHideAdvancedPoint(path, drawnItems!);
  }

  function HandleDelete(id: string): void {
    const point = advancedPoints.find((p) => p.properties.id == id)!;
    HideAdvancedPoint(point, drawnItems!);
    dispatch(removeAdvancedPoint(point.properties.id));
  }

  function HandleShowModalEdit(id: string): void {
    setAdvPointId(id);
    setShowAdvPointEdit(true);
  }

  return (
    <>
      <ListGroup className="shadow">
        <ListGroup.Item className="bg-light text-primary fw-bold">Noktalar</ListGroup.Item>
        {advancedPoints != null &&
          drawnItems != null &&
          advancedPoints
            .filter((f) => currentFloor != null && f.properties.floor == currentFloor?.index)
            .map((p) => (
              <ListGroup.Item key={p.properties.id} className="fw-light">
                <Stack direction={'horizontal'} className="justify-content-between">
                  <span>{p.properties.name}</span>
                  <Stack direction="horizontal" gap={1}>
                    <Button onClick={() => HandleShowModalEdit(p.properties.id)} variant="warning" size="sm">
                      <FaPen size={14} />
                    </Button>
                    {p.properties.layerId! ? (
                      <Button onClick={() => HandleShow(p.properties.id)} variant="primary" size="sm">
                        <FaEye color="#fff" size={14} />
                      </Button>
                    ) : (
                      <Button onClick={() => HandleShow(p.properties.id)} variant="secondary" size="sm">
                        <FaEyeSlash color="#fff" size={14} />
                      </Button>
                    )}
                    <Button onClick={() => HandleDelete(p.properties.id)} variant="danger" size="sm">
                      <FaTrash color="#fff" size={14} />
                    </Button>
                  </Stack>
                </Stack>
              </ListGroup.Item>
            ))}
      </ListGroup>
      <ModalAdvencedPointInfo isShowing={showAdvPointEdit} showModal={setShowAdvPointEdit} advancedPointId={advPointId} />
    </>
  );
}
