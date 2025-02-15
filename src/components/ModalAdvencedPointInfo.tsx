import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import AdvancedPointTypes, { AdvancedPointTypeEntries } from '../models/UIModels/AdvancedPointTypes';
import { setAdvancedPointInfo } from '../redux/reducers/storageSlice';
import { HideAdvancedPointByLayer, ShowAdvancedPointByType } from '../services/advancedPointService';

type SectionProps = {
  showModal: (value: boolean) => void;
  isShowing: boolean;
  advancedPointId: string;
};

export default function ModalAdvencedPointInfo({ isShowing, showModal, advancedPointId }: SectionProps): React.JSX.Element {
  const dispatch = useAppDispatch();

  const drawnItems = useAppSelector((state) => state.mapReducer.drawnItems);
  const advancedPoints = useAppSelector((state) => state.storageReducer.advancedPoints);
  const floorList  = useAppSelector((state) => state.storageReducer.floorList);
  

  const [pointName, setPointName] = useState<string>('');
  const [pointType, setPointType] = useState<AdvancedPointTypes>(AdvancedPointTypes.stairs);
  const [targetFloorList, setTargetFloorList] = useState<string[]>([]);

  useEffect(() => {
    console.log("targetFloorList = ",targetFloorList)
  },[targetFloorList])
  
  useEffect(() => {
    if (isShowing == true) {
      const polygon = advancedPoints.find((p) => p.properties.id == advancedPointId);
      if (polygon != null) {
        setPointName(polygon.properties.name ? polygon.properties.name : '');
      }
    }
  }, [isShowing]);

  function SaveInformations() {
    const point = advancedPoints.find((p) => p.properties.id == advancedPointId);
    if (point == null) {
      alert('Advanced point could not found to updating informations from modal');
      return;
    }

    dispatch(
      setAdvancedPointInfo({
        id: advancedPointId,
        name: pointName != null ? pointName : '',
        type: pointType,
        targetFloorList: targetFloorList.map(i => parseInt(i))
      })
    );

    const updatedpoint = advancedPoints.find((p) => p.properties.id == advancedPointId)!;
    const layer = drawnItems!.getLayer(updatedpoint.properties.layerId!);

    if (layer == null) {
      // show only
      ShowAdvancedPointByType(pointType, updatedpoint, drawnItems!);
    } else {
      // hide firstly
      HideAdvancedPointByLayer(layer, drawnItems!);
      ShowAdvancedPointByType(pointType, updatedpoint, drawnItems!);
    }
    showModal(false);
  }

  return (
    <Modal show={isShowing} onHide={() => showModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Konum Detay Bilgisi Giriniz.</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3" controlId="formBasic-1">
          <Form.Label>Konum İsmi</Form.Label>
          <Form.Select value={pointType} onChange={(e) => setPointType(e.target.value as AdvancedPointTypes)}>
            {AdvancedPointTypeEntries.map(([key, value]) => (
              <option key={value} value={value}>
                {key}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
        {
          floorList &&
            <Form.Group className="mb-3" controlId="formBasic-12">
              <Form.Label>Bulunacağı Kat Listesi</Form.Label>
              <Form.Select multiple value={targetFloorList} onChange={(e) => setTargetFloorList([].slice.call((e.target as HTMLSelectElement).selectedOptions).map((i: HTMLOptionElement) => i.value))}>
                {floorList.map((value, index) => 
                  <option key={index} value={value.index}>{value.name} </option>
                )}
              </Form.Select>
            </Form.Group>
        }
        <Form.Group className="mb-3" controlId="formBasic-3">
          <Form.Label>Konum İsmi</Form.Label>
          <Form.Control placeholder="Konum İsmi" value={pointName} onChange={(e) => setPointName(e.target.value)} />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => SaveInformations()}>
          Kaydet
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
