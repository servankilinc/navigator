import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as L from 'leaflet';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { Button, Form, ListGroup, Stack } from 'react-bootstrap';
import ThreeDModelPointGeoJson from '../models/Features/ThreeDModelPointGeoJson';
import { removeThreeDModel, setThreeDModelRotation } from '../redux/reducers/storageSlice';
import { HideThreeDModel, RotateThreeDModelPoint, ShowOrHideThreeDModel, ShowThreeDModel } from '../services/threeDModelService';
import { FaPen, FaTrash } from 'react-icons/fa6';
import ModalThreeDModelInfo from './ModalThreeDModelInfo';

export default function ThreeDModels(): React.JSX.Element {
  const map = useAppSelector((state) => state.mapReducer.map);
  const threeDModelList = useAppSelector((state) => state.storageReducer.threeDModels);

  const drawnItems = useAppSelector((state) => state.mapReducer.drawnItems);

  if (!map || !threeDModelList || !drawnItems) return <></>;

  return (
    <ListGroup className="shadow">
      <ListGroup.Item className="bg-light text-primary fw-bold">3D Modeller</ListGroup.Item>
      {threeDModelList.map((model, index) => (
        <ListGroup.Item key={model.properties.id} className="bg-light">
          <ThreeDModelSettingsRow model={model} drawnItems={drawnItems} />
        </ListGroup.Item>
      ))}
    </ListGroup>
  );
}

function ThreeDModelSettingsRow({ model, drawnItems }: { model: ThreeDModelPointGeoJson; drawnItems: L.FeatureGroup<any> }) {
  const dispatch = useAppDispatch();

  const [rotateDegVal, setRotateDegVal] = useState((model.properties.rotateY * 180) / Math.PI);
  const [showEditModal, setShowEditModal] = useState(false);

  const OnChangeRotation = (newRotateVal: number) => {
    RotateThreeDModelPoint(model, newRotateVal, drawnItems);
    setRotateDegVal(newRotateVal);
  };

  const OnMouseUpRotation = () => {
    const radian = (rotateDegVal * Math.PI) / 180;
    dispatch(setThreeDModelRotation({ id: model.properties.id, rotateX: undefined, rotateY: radian, rotateZ: undefined }));
    ShowThreeDModel(model, drawnItems);
  };

  const HandleDelete = async () => {
    HideThreeDModel(model, drawnItems);
    dispatch(removeThreeDModel(model.properties.id));
  };

  return (
    <>
      <Stack direction="horizontal" gap={1} className="justify-content-between py-2">
        <Form.Group className="d-flex align-items-center gap-3  w-100">
          <Form.Range
            min="0"
            max="360"
            value={(model.properties.rotateY * 180) / Math.PI}
            onMouseUp={() => OnMouseUpRotation()}
            onChange={(e) => OnChangeRotation(parseInt(e.target.value))}
          />
        </Form.Group>
        <Stack direction="horizontal" gap={2} className='align-items-center justify-content-center'>
          <Button onClick={() => setShowEditModal(true)} variant="warning" size="sm" className="py-0 px-1">
            <FaPen size={12} />
          </Button>
          <Button onClick={() => HandleDelete()} variant="danger" size="sm" className="py-0 px-1">
            <FaTrash color="#fff" size={12} />
          </Button>
        </Stack>
      </Stack>
      <ModalThreeDModelInfo isShowing={showEditModal} showModal={setShowEditModal} threeDModelId={model.properties.id} />
    </>
  );
}
