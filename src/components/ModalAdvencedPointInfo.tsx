import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, Form, Modal } from 'react-bootstrap';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import AdvancedPointTypes, { AdvancedPointTypeEntries } from '../models/UIModels/AdvancedPointTypes';
import { setAdvancedPointInfo } from '../redux/reducers/storageSlice';
import { HideAdvancedPointByLayer, ShowAdvancedPointByType } from '../services/advancedPointService';
import { AdvancedPointDirectionTypesEnums } from '../models/UIModels/AdvancedPointDirectionTypes';
import { FaArrowDown, FaArrowsUpDown, FaArrowUp } from 'react-icons/fa6';

type SectionProps = {
  showModal: (value: boolean) => void;
  isShowing: boolean;
  advancedPointId: string;
};

export default function ModalAdvencedPointInfo({ isShowing, showModal, advancedPointId }: SectionProps): React.JSX.Element {
  const dispatch = useAppDispatch();

  const drawnItems = useAppSelector((state) => state.mapReducer.drawnItems);
  const advancedPoints = useAppSelector((state) => state.storageReducer.advancedPoints);

  const [pointName, setPointName] = useState<string>('');
  const [pointType, setPointType] = useState<AdvancedPointTypes>(AdvancedPointTypes.stairs);
  const [pointDirectionType, setPointDirectionType] = useState<AdvancedPointDirectionTypesEnums>(AdvancedPointDirectionTypesEnums.twoWay);

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
        directionType: pointDirectionType,
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

        <Form.Group className="mb-3" controlId="formBasic-2">
          <ButtonGroup className="border shadow-sm">
            <Button
              variant="light"
              onClick={() => setPointDirectionType(AdvancedPointDirectionTypesEnums.up)}
              className={pointDirectionType == AdvancedPointDirectionTypesEnums.up ? 'active' : ''}
            >
              <FaArrowUp />
            </Button>
            <Button
              variant="light"
              onClick={() => setPointDirectionType(AdvancedPointDirectionTypesEnums.down)}
              className={pointDirectionType == AdvancedPointDirectionTypesEnums.down ? 'active' : ''}
            >
              <FaArrowDown />
            </Button>
            <Button
              variant="light"
              onClick={() => setPointDirectionType(AdvancedPointDirectionTypesEnums.twoWay)}
              className={pointDirectionType == AdvancedPointDirectionTypesEnums.twoWay ? 'active' : ''}
            >
              <FaArrowsUpDown />
            </Button>
          </ButtonGroup>
          <strong className="d-block">
            Seçili Yön{' '}
            {pointDirectionType == AdvancedPointDirectionTypesEnums.up
              ? 'Sadece Yukarı'
              : pointDirectionType == AdvancedPointDirectionTypesEnums.down
              ? 'Sadece Aşağı'
              : 'Çift Yön'}
          </strong>
        </Form.Group>

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
