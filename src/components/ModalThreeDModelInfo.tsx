import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { UpdatePopupContentOfPolygon } from '../services/polygonService';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { setThreeDModelInfo } from '../redux/reducers/storageSlice';
 

type SectionProps = {
  showModal: (value: boolean) => void;
  isShowing: boolean;
  threeDModelId: string;
};

export default function ModalThreeDModelInfo({ isShowing, showModal, threeDModelId }: SectionProps): React.JSX.Element {
  const dispatch = useAppDispatch();

  const threeDModelList = useAppSelector((state) => state.storageReducer.threeDModels);
  const drawnItems = useAppSelector((state) => state.mapReducer.drawnItems);

  const [name, setName] = useState<string>('');
  const [sourcePath, setSourcePath] = useState<string>('');
  const [scaleRate, setScaleRate] = useState<number>(1);

  useEffect(() => {
    if (isShowing == true) {
      const threeDModel = threeDModelList.find((m) => m.properties.id == threeDModelId);
      if (threeDModel != null) {
        setName(threeDModel.properties.name ? threeDModel.properties.name : '');
        setSourcePath(threeDModel.properties.source ? threeDModel.properties.source : '');
      }
    }
  }, [isShowing]);
  
  function SaveInformations() {
    const polygon = threeDModelList.find((p) => p.properties.id == threeDModelId);
    if (polygon == null) {
      alert('ThreeDModel could not found to updating informations from modal');
      return;
    }

    dispatch(
      setThreeDModelInfo({
        id: threeDModelId,
        name: name,
        scaleRate: scaleRate,
        source: sourcePath
      })
    );

    showModal(false);
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
