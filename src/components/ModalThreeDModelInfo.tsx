import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
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

  const [name, setName] = useState<string>('');
  const [sourcePath, setSourcePath] = useState<string>('');
  const [scaleRate, setScaleRate] = useState<number>(1);

  useEffect(() => {
    if (isShowing == true) {
      const threeDModel = threeDModelList.find((m) => m.properties.id == threeDModelId);
      if (threeDModel != null) {
        setName(threeDModel.properties.name ? threeDModel.properties.name : '');
        setSourcePath(threeDModel.properties.source ? threeDModel.properties.source : '');
        setScaleRate(threeDModel.properties.scaleRate ? threeDModel.properties.scaleRate : 1);
      }
    }
  }, [isShowing]);

  function SaveInformations() {
    const threeDModel = threeDModelList.find((p) => p.properties.id == threeDModelId);
    if (threeDModel == null) {
      alert('ThreeDModel could not found to updating informations from modal');
      return;
    }

    dispatch(
      setThreeDModelInfo({
        id: threeDModelId,
        name: name,
        scaleRate: scaleRate,
        source: sourcePath,
      })
    );

    showModal(false);
  }

  return (
    <Modal show={isShowing} onHide={() => showModal(false)}>
      <Modal.Header closeButton>
        <Modal.Title>Model Bilgisi Giriniz.</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3" controlId="formName">
          <Form.Label>Model İsmi</Form.Label>
          <Form.Control placeholder="Model İsmi" value={name} onChange={(e) => setName(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formScaleRate">
          <Form.Label>Ölçek Oranı</Form.Label>
          <Form.Control placeholder="Ölçek" type="number" value={scaleRate} onChange={(e) => setScaleRate(Number(e.target.value))} />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formSource">
          <Form.Control placeholder="KlasörAdı/DosyaAdı" value={sourcePath}  />
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
