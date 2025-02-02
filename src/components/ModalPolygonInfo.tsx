import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { UpdatePopupContentOfPolygon } from '../services/polygonService';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setPolygonInfo } from '../redux/reducers/storageSlice';

type SectionProps = {
  showModal: (value: boolean) => void;
  isShowing: boolean;
  polygonId: string;
};

export default function ModalPolygonInfo({ isShowing, showModal, polygonId }: SectionProps): React.JSX.Element {
  const dispatch = useAppDispatch();

  const polygonList = useAppSelector((state) => state.storageReducer.polygons);
  const drawnItems = useAppSelector((state) => state.mapReducer.drawnItems);

  const [buildingName, setBuildingName] = useState<string>('');

  useEffect(() => {
    if (isShowing == true) {
      const polygon = polygonList.find((p) => p.properties.id == polygonId);
      if (polygon != null) {
        setBuildingName(polygon.properties.name ? polygon.properties.name : '');
      }
    }
  }, [isShowing]);

  
  function SavePolygonInformations() {
    const polygon = polygonList.find((p) => p.properties.id == polygonId);
    if (polygon == null) {
      alert('Polygon could not found to updating informations from modal');
      return;
    }

    dispatch(
      setPolygonInfo({
        polygonId: polygon.properties.id,
        propertiesName: buildingName != null ? buildingName : '',
        propertiesPopupContent: `Bina Bilgisi, İsim: ${polygon.properties.name} Kat:${polygon.properties.floor} ID:${polygon.properties.id}`,
      })
    );

    showModal(false);

    UpdatePopupContentOfPolygon(polygon, drawnItems!);
  }

  return (
    <Modal show={isShowing} onHide={() => showModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Konum Detay Bilgisi Giriniz.</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Konum İsmi</Form.Label>
          <Form.Control placeholder="Konum İsmi" value={buildingName} onChange={(e) => setBuildingName(e.target.value)} />
        </Form.Group>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={() => SavePolygonInformations()}>
          Kaydet
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
