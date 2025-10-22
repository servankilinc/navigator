import React, { useState } from 'react';
import { Button, Form, Stack } from 'react-bootstrap';
import { FaBan, FaComputerMouse, FaEye, FaEyeSlash, FaTrash } from 'react-icons/fa6';

type SectionProps = {
  index: number;
  sketchId: string;
  sketchSource: string;
  sketch_rotation: number;
  sketch_opacity: number;  
  frozen: boolean;  
  FreezingHandler: (sketchId: string) => void;
  RotationHandler: (angle: number, sketchId: string) => void;
  OpacityHandler: (opacity: number, sketchId: string) => void;
  SaveRotation: (sketchId: string, opacityVal: number) => void;
  SaveOpacity: (sketchId: string, opacityVal: number) => void;
  HandleDelete: (sketchId: string) => void;
};

export default function ImageSettings(props: SectionProps): React.JSX.Element {
  const [rotateVal, setRotateVal] = useState(0);
  const [opacityVal, setOpacityVal] = useState(0.7);

  function OnChangeRotation(value: number) {
    setRotateVal(value);
    props.RotationHandler(value, props.sketchId);
  }
  function OnChangeOpacity(value: number) {
    setOpacityVal(value);
    props.OpacityHandler(value, props.sketchId);
  }

  return (
    <>
      <Stack direction="horizontal" gap={2} className="justify-content-between py-2 border-bottom">
        <Stack direction='horizontal' gap={2}>
          <img src={props.sketchSource} alt={`Uploaded`} style={{ height: '4vh', width: '4vh', objectFit: 'cover', borderRadius: '50%' }} />
          <span>Resim {props.index}</span>
        </Stack>

        <Stack direction="horizontal" gap={1}>
          {opacityVal != undefined && opacityVal > 0 ? 
            (<Button onClick={() => OnChangeOpacity(0)} variant="secondary" size="sm">
              <FaEyeSlash color="#fff" size={14} />
            </Button>) : 
            (<Button onClick={() => OnChangeOpacity(1)} variant="primary" size="sm">
              <FaEye color="#fff" size={14} />
            </Button>)
          }
          <Button onClick={() => props.HandleDelete(props.sketchId)} variant="danger" size="sm">
            <FaTrash color="#fff" size={14} />
          </Button>
          <Button onClick={() => props.FreezingHandler(props.sketchId)} variant="light" size="sm">
            {
              props.frozen ?
              <FaBan color="#801a1aff" size={14} /> :
              <FaComputerMouse color="#1e3050" size={14} /> 
            }
          </Button>
        </Stack>
      </Stack>
      <Stack direction="vertical" gap={2} className="mt-2 text-start bg-light mt-3">
        <Form.Group className='d-flex align-items-center gap-3'>
          <Form.Label>Döndür</Form.Label>
          <Form.Range
            min="0"
            max="360"
            value={rotateVal}
            onMouseUp={() => props.SaveRotation(props.sketchId, rotateVal)}
            onChange={(e) => OnChangeRotation(parseInt(e.target.value))}
          />
        </Form.Group>
        <Form.Group className='d-flex align-items-center gap-3'>
          <Form.Label>Saydamlık</Form.Label>
          <Form.Range
            min="0"
            max="1"
            value={opacityVal}
            step={0.1}
            onMouseUp={() => props.SaveOpacity(props.sketchId, opacityVal)}
            onChange={(e) => OnChangeOpacity(parseFloat(e.target.value))}
          />
        </Form.Group>
      </Stack>
    </>
  );
}
