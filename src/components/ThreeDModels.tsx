import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as L from 'leaflet';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { Button, Form, ListGroup, Stack } from 'react-bootstrap';
import ThreeDModelPointGeoJson from '../models/Features/ThreeDModelPointGeoJson';
import { removeThreeDModel, setThreeDModelRotation } from '../redux/reducers/storageSlice';
import { HideThreeDModel, RotateThreeDModelPoint } from '../services/threeDModelService';
import { FaTrash } from 'react-icons/fa6';

export default function ThreeDModels(): React.JSX.Element {
  const map = useAppSelector((state) => state.mapReducer.map);
  const threeDModelList = useAppSelector((state) => state.storageReducer.threeDModels);

  const drawnItems = useAppSelector((state) => state.mapReducer.drawnItems);

  if (!map || !threeDModelList || !drawnItems) return <></>;

  return (
    <ListGroup className="shadow">
      <ListGroup.Item className="bg-light text-primary fw-bold">3D Modeller</ListGroup.Item>
      {threeDModelList.map((model, index) => (
        <ListGroup.Item key={model.id} className="bg-light">
          <ThreeDModelSettingsRow model={model} key={index} drawnItems={drawnItems} />
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}

function ThreeDModelSettingsRow({ model, drawnItems }: { model: ThreeDModelPointGeoJson; drawnItems: L.FeatureGroup<any> }) {
  const dispatch = useAppDispatch();
  
  const [rotateDegVal, setRotateDegVal] = useState(model.properties.rotateY * 180 / Math.PI);

  const OnChangeRotation = (newRotateVal: number) => {
    RotateThreeDModelPoint(model, newRotateVal, drawnItems);
    setRotateDegVal(newRotateVal);
  }

  const SaveRotation = () => {
    const radian = (rotateDegVal * Math.PI) / 180;
    dispatch(setThreeDModelRotation({ id: model.properties.id, rotateX: undefined, rotateY: radian, rotateZ: undefined }));
  };

  const HandleDelete = async () => {
    HideThreeDModel(model, drawnItems);
    dispatch(removeThreeDModel(model.properties.id));
  };

  return (
    <>
      <Stack direction="horizontal" gap={2} className="justify-content-between py-2 border-bottom">
        <Stack direction="horizontal" gap={1}>
          <Button onClick={() => HandleDelete()} variant="danger" size="sm">
            <FaTrash color="#fff" size={14} />
          </Button>
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={2} className="mt-2 text-start bg-light mt-3">
        <Form.Group className="d-flex align-items-center gap-3">
          <Form.Label>Döndür</Form.Label>
          <Form.Range min="0" max="360" value={model.properties.rotateY} onMouseUp={() => SaveRotation()} onChange={(e) => OnChangeRotation(parseInt(e.target.value))} />
        </Form.Group>
      </Stack>
    </>
  );
}

