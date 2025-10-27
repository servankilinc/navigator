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

  const HandleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    formData.append('file', files[0]);

    const res = await fetch('http://localhost:5000/api/polygon/upload', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const body = await res.json(); 
    setIconSource(body.url);
    e.target.value = '';
  };

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
        <Form.Group controlId="formFile" className="my-2">
          <Form.Label>İkon Bilgisi</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={HandleFileUpload} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formIconSource">
          <Form.Control placeholder="Henüz dosya yüklenmedi" value={iconSource} disabled={true} className='readonly' />
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
