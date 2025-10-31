import React, { useState } from 'react';
import * as L from 'leaflet';
import throttle from 'lodash/throttle';
import { Button, Form, Stack } from 'react-bootstrap';
import { FaBan, FaComputerMouse, FaEye, FaEyeSlash, FaTrash } from 'react-icons/fa6';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { removeSketch, setSketchOpacity, setSketchRotation, toggleSketchFrozenStatus } from '../redux/reducers/mapSlice';
import { showAlertError } from '../redux/reducers/alertSlice';
import Sketch from '../models/Sketch';

type SectionProps = {
  sketch: Sketch;
  index: number;
};

export default function ImageSettings(props: SectionProps): React.JSX.Element {
  const dispatch = useAppDispatch();
  const map = useAppSelector((state) => state.mapReducer.map);

  const [rotateVal, setRotateVal] = useState(0);
  const [opacityVal, setOpacityVal] = useState(0.7);

  // ------------ ROTATION PROCESS ------------
  const OnMouseUpRotation = () => {
    dispatch(setSketchRotation({ id: props.sketch.id, rotation: rotateVal }));
  };
 
  const OnChangeRotation = throttle((angle: number) => {
    setRotateVal(angle);

    const overlay = props.sketch.imageOverlay;
    const corners = props.sketch.corners;

    // 4 köşenin ortalama noktası bulunarak merkez hesaplanıyor
    const layerPts = corners.map((latlng) => map!.latLngToLayerPoint(latlng));
    const center = layerPts.reduce((acc, p) => L.point(acc.x + p.x, acc.y + p.y), L.point(0, 0)).divideBy(layerPts.length);

    // Açıyı radyana çeviriyoruz
    const rad = (angle * Math.PI) / 180;

    // Tüm köşeleri yeni konumlarına çevir
    const rotatedLayerPts = layerPts.map((p) => {
      const x = p.x - center.x;
      const y = p.y - center.y;
      const xr = x * Math.cos(rad) - y * Math.sin(rad);
      const yr = x * Math.sin(rad) + y * Math.cos(rad);
      return L.point(center.x + xr, center.y + yr);
    });
    const rotatedLatLngs = rotatedLayerPts.map((p) => map!.layerPointToLatLng(p));

    overlay.reposition(rotatedLatLngs[0], rotatedLatLngs[1], rotatedLatLngs[3]);
  }, 400);

  // ------------ OPACITY PROCESS ------------
  const OnMouseUpOpacity = () => {
    dispatch(setSketchOpacity({ id: props.sketch.id, opacity: opacityVal }));
  };

  const OnChangeOpacity = throttle((value: number) => {
    setOpacityVal(value);
    props.sketch.imageOverlay.setOpacity(value);
  }, 400);


  // ------------ DELETE PROCESS ------------
  const HandleDelete = async () => {
    try {
      if (map!.hasLayer(props.sketch.imageOverlay)) map!.removeLayer(props.sketch.imageOverlay);
      dispatch(removeSketch(props.sketch.id));
      await fetch(`${import.meta.env.VITE_API_URL}/api/sketch/${props.sketch.id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
    } catch (err: any) {
      dispatch(showAlertError({ message: err?.message || 'Silme İşleminde Hata Oluştu' }));
    }
  };

  // ------------ FREEZE PROCESS ------------
  const FreezingHandler = () => {
    dispatch(toggleSketchFrozenStatus(props.sketch.id));
  };

  if (!map) return <></>;
  return (
    <>
      <Stack direction="horizontal" gap={2} className="justify-content-between py-2 border-bottom">
        <Stack direction="horizontal" gap={2}>
          <img src={`${import.meta.env.VITE_API_URL}/api/sketch/${props.sketch.source}`} alt={`Uploaded`} style={{ height: '4vh', width: '4vh', objectFit: 'cover', borderRadius: '50%' }} />
          <span>Kroki - {props.index}</span>
        </Stack>

        <Stack direction="horizontal" gap={1}>
          {opacityVal != undefined && opacityVal > 0 ? (
            <Button onClick={() => OnChangeOpacity(0)} variant="secondary" size="sm" className="py-0 px-1">
              <FaEyeSlash color="#fff" size={12} />
            </Button>
          ) : (
            <Button onClick={() => OnChangeOpacity(1)} variant="primary" size="sm" className="py-0 px-1">
              <FaEye color="#fff" size={12} />
            </Button>
          )}
          <Button onClick={() => HandleDelete()} variant="danger" size="sm" className="py-0 px-1">
            <FaTrash color="#fff" size={12} />
          </Button>
          <Button onClick={() => FreezingHandler()} variant="light" size="sm" className="py-0 px-1">
            {props.sketch.frozen ? <FaBan color="#801a1aff" size={12} /> : <FaComputerMouse color="#1e3050" size={14} />}
          </Button>
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={2} className="mt-2 text-start bg-light mt-3">
        <Form.Group className="d-flex align-items-center gap-3">
          <Form.Label>Döndür</Form.Label>
          <Form.Range min="0" max="360" value={rotateVal} onMouseUp={() => OnMouseUpRotation()} onChange={(e) => OnChangeRotation(parseInt(e.target.value))} />
        </Form.Group>
        <Form.Group className="d-flex align-items-center gap-3">
          <Form.Label>Saydamlık</Form.Label>
          <Form.Range min="0" max="1" value={opacityVal} step={0.1} onMouseUp={() => OnMouseUpOpacity()} onChange={(e) => OnChangeOpacity(parseFloat(e.target.value))} />
        </Form.Group>
      </Stack>
    </>
  );
}
