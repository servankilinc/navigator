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
  const [popupContent, setPopupContent] = useState<string | undefined>();
  const [iconSource, setIconSource] = useState<string | undefined>();

  useEffect(() => {
    if (isShowing == true) {
      const polygon = polygonList.find((p) => p.properties.id == polygonId);
      if (polygon != null) {
        setBuildingName(polygon.properties.name ? polygon.properties.name : '');
        setPopupContent(polygon.properties.popupContent ? polygon.properties.popupContent : '');
        setIconSource(polygon.properties.iconSource ? polygon.properties.iconSource : '');
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
        name: buildingName ?? '',
        popupContent: popupContent ?? `Bina Bilgisi, İsim: ${polygon.properties.name}`,
        iconSource: iconSource,
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
        <Form.Group className="mb-3" controlId="formName">
          <Form.Label>Konum İsmi</Form.Label>
          <Form.Control placeholder="Konum İsmi" value={buildingName} onChange={(e) => setBuildingName(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formPopupContent">
          <Form.Label>Popup Bilgisi</Form.Label>
          <Form.Control placeholder="Popup Bilgisi" value={popupContent} onChange={(e) => setPopupContent(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formIconSource">
          <Form.Label>İkon Bilgisi</Form.Label>
          <Form.Control placeholder="İkon Bilgisi" value={iconSource} onChange={(e) => setIconSource(e.target.value)} />
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
