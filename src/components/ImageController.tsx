import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import * as L from 'leaflet';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { Form, ListGroup, Stack } from 'react-bootstrap';
import Sketch from '../models/Sketch';
import e7 from '../scripts/idGenerator';
import { addSketch, removeSketch, rePositionSketch, setSketchOpacity, setSketchRotation, toggleSketchFrozenStatus } from '../redux/reducers/mapSlice';
import ImageSettings from './ImageSettings';
import { showAlertError } from '../redux/reducers/alertSlice';
import 'leaflet-imageoverlay-rotated';
import SketchModel from '../models/UIModels/SketchModel';

const movementIcon = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="#1e30507a" d="M342.6 73.4C330.1 60.9 309.8 60.9 297.3 73.4L233.3 137.4C220.8 149.9 220.8 170.2 233.3 182.7C245.8 195.2 266.1 195.2 278.6 182.7L288 173.3L288 288L173.3 288L182.7 278.6C195.2 266.1 195.2 245.8 182.7 233.3C170.2 220.8 149.9 220.8 137.4 233.3L73.4 297.3C60.9 309.8 60.9 330.1 73.4 342.6L137.4 406.6C149.9 419.1 170.2 419.1 182.7 406.6C195.2 394.1 195.2 373.8 182.7 361.3L173.3 351.9L288 351.9L288 466.6L278.6 457.2C266.1 444.7 245.8 444.7 233.3 457.2C220.8 469.7 220.8 490 233.3 502.5L297.3 566.5C309.8 579 330.1 579 342.6 566.5L406.6 502.5C419.1 490 419.1 469.7 406.6 457.2C394.1 444.7 373.8 444.7 361.3 457.2L351.9 466.6L351.9 351.9L466.6 351.9L457.2 361.3C444.7 373.8 444.7 394.1 457.2 406.6C469.7 419.1 490 419.1 502.5 406.6L566.5 342.6C579 330.1 579 309.8 566.5 297.3L502.5 233.3C490 220.8 469.7 220.8 457.2 233.3C444.7 245.8 444.7 266.1 457.2 278.6L466.6 288L351.9 288L351.9 173.3L361.3 182.7C373.8 195.2 394.1 195.2 406.6 182.7C419.1 170.2 419.1 149.9 406.6 137.4L342.6 73.4z"/></svg>`,
  className: '',
  iconSize: [20, 20],
  iconAnchor: [15, 15],
});

export default function ImageController(): React.JSX.Element {
  const dispatch = useAppDispatch();
  const sketchList = useAppSelector((state) => state.mapReducer.sketchList);
  const map = useAppSelector((state) => state.mapReducer.map);
  const sketchListRef = useRef<Sketch[]>();

  useEffect(() => {
    sketchListRef.current = sketchList;
  }, [sketchList]);

  // Debounce helper
  const debounce = useCallback(function <T extends (...args: any[]) => void>(fn: T, wait = 300) {
    let t: any = 0;
    return (...args: Parameters<T>) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }, []);

  // Fetch persisted sketches when map available
  useEffect(() => {
    if (!map) return;

    let mounted = true;
    (async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sketch`);
      if (!res.ok) return;
      const data: SketchModel[] = await res.json();
      if (!mounted || !data) return;
      data.forEach((ds) =>
        BindSketchToMap(
          ds.id,
          ds.source,
          ds.corners.map((c) => L.latLng(c.lat, c.lng)),
          true
        )
      );
    })();

    return () => {
      mounted = false;
    };
  }, [map]);

  const HandleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !map) return;
    const formData = new FormData();
    formData.append('file', files[0]);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/sketch/upload`, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Upload failed');
    const body = await res.json();

    const newSketchId = e7();
    const center = map.getCenter();
    const offset = 0.0005;
    const centeredCorners = [
      L.latLng(center.lat + offset, center.lng - offset),
      L.latLng(center.lat + offset, center.lng + offset),
      L.latLng(center.lat - offset, center.lng + offset),
      L.latLng(center.lat - offset, center.lng - offset),
    ];

    BindSketchToMap(newSketchId, body.url, centeredCorners, false);

    e.target.value = '';
  };

  function BindSketchToMap(id: string, source: string, corners: L.LatLng[], froozen: boolean) {
    if (!map) return;

    // Leaflet DistortableImage kullanımı
    const imageOverlay = L.imageOverlay
      .rotated(`${import.meta.env.VITE_API_URL}/api/sketch/${source}`, corners[0], corners[1], corners[3], {
        opacity: 0.7,
        interactive: true,
      })
      .addTo(map);

    const polygon = new L.Polygon(corners, { opacity: 0, fillOpacity: 0 }).addTo(map);

    var cp1 = L.marker(corners[0], { draggable: true, icon: movementIcon }).addTo(map!);
    var cp2 = L.marker(corners[1], { draggable: true, icon: movementIcon }).addTo(map!);
    var cp3 = L.marker(corners[3], { draggable: true, icon: movementIcon }).addTo(map!);

    dispatch(addSketch(new Sketch(id, source, imageOverlay, corners, froozen)));

    // #region MOUSE DRAG
    let isDragging = false;
    let prevLatLng: L.LatLng | null = null;

    // Poligon üzerine mousedown eventi ekleyerek sürüklemeyi başlat
    polygon.on('mousedown', (ev: L.LeafletMouseEvent) => {
      if (!sketchListRef.current) return;
      const sk = sketchListRef.current.find((s) => s.id === id);
      if (!sk || sk?.frozen) return;
      isDragging = true;
      prevLatLng = ev.latlng;
      // Sürükleme sırasında haritanın da sürüklenmesini engelle
      map.dragging.disable();
    });

    // Harita üzerinde mousemove ile poligonun konumunu güncelle
    map.on('mousemove', (ev: L.LeafletMouseEvent) => {
      if (!isDragging || !prevLatLng) return;

      if (!sketchListRef.current) return;
      const sk = sketchListRef.current.find((s) => s.id === id);
      if (!sk || sk.frozen) return;

      // Fare hareketi farkını hesapla
      const latDiff = ev.latlng.lat - prevLatLng.lat;
      const lngDiff = ev.latlng.lng - prevLatLng.lng;

      // Poligonun mevcut koordinatlarını al ve güncelle
      const currentCorners = polygon.getLatLngs() as L.LatLng[][];

      // const newCorners = currentCorners.map((latlngArr) =>
      const newCorners = (currentCorners[0] || corners).map((pt) => L.latLng(pt.lat + latDiff, pt.lng + lngDiff));

      // update markers
      cp1.setLatLng(newCorners[0]);
      cp2.setLatLng(newCorners[1]);
      cp3.setLatLng(newCorners[3]);

      // Poligonun koordinatlarını güncelle
      polygon.setLatLngs([newCorners]);
      imageOverlay.reposition(newCorners[0], newCorners[1], newCorners[3]);

      SketchRePosition(id, newCorners);

      prevLatLng = ev.latlng;
    });

    // Mouseup olayı ile sürüklemeyi sonlandır
    map.on('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      prevLatLng = null;
      // Haritanın sürüklenmesini tekrar etkinleştir
      map.dragging.enable();
    });
    //#endregion

    // #region KÖŞE NOKTALARI ILE KONTROL
    cp1.on('drag', () => {
      if (!sketchListRef.current) return;
      const sk = sketchListRef.current.find((s) => s.id === id);
      if (!sk || sk?.frozen) return;

      const _corners = [...sk.corners];
      _corners[0] = cp1.getLatLng();
      imageOverlay.reposition(_corners[0], _corners[1], _corners[3]);
      polygon.setLatLngs([_corners]);
      SketchRePosition(id, _corners);
    });

    cp2.on('drag', () => {
      if (!sketchListRef.current) return;
      const sk = sketchListRef.current.find((s) => s.id === id);
      if (!sk || sk?.frozen) return;

      const _corners = [...sk.corners];
      _corners[1] = cp2.getLatLng();
      imageOverlay.reposition(_corners[0], _corners[1], _corners[3]);
      polygon.setLatLngs([_corners]);
      SketchRePosition(id, _corners);
    });

    cp3.on('drag', () => {
      if (!sketchListRef.current) return;
      const sk = sketchListRef.current.find((s) => s.id === id);
      if (!sk || sk?.frozen) return;

      const _corners = [...sk.corners];
      _corners[3] = cp3.getLatLng();
      imageOverlay.reposition(_corners[0], _corners[1], _corners[3]);
      polygon.setLatLngs([_corners]);
      SketchRePosition(id, _corners);
    });
    // #endregion
  }

  const debouncedRePositionRotationSketch = useMemo(() =>
      debounce((sketchId: string, corners: L.LatLng[]) => {
        dispatch(rePositionSketch({ id: sketchId, corners: corners }));
      }, 400),
    [debounce, dispatch]
  );

  const SketchRePosition = useCallback((sketchId: string, corners: L.LatLng[]) => {
      debouncedRePositionRotationSketch(sketchId, corners);
    },[debouncedRePositionRotationSketch]
  );

  //#region ROTATION METHODS
  function HandleRotate(angle: number, sketchId: string) {
    if (!map) return;
    const sketch = sketchList.find((sketch) => sketch.id === sketchId);
    if (!sketch) return;

    const overlay = sketch.imageOverlay;
    const corners = sketch.corners;

    // 4 köşenin ortalama noktası bulunarak merkez hesaplanıyor
    const layerPts = corners.map((latlng) => map.latLngToLayerPoint(latlng));
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
    const rotatedLatLngs = rotatedLayerPts.map((p) => map.layerPointToLatLng(p));

    overlay.reposition(rotatedLatLngs[0], rotatedLatLngs[1], rotatedLatLngs[3]);
  }

  const SaveRotation = (sketchId: string, rotateVal: number) => {
    dispatch(setSketchRotation({ id: sketchId, rotation: rotateVal }));
  };
  //#endregion

  //#region OPACITY METHODS
  const HandleOpacity = useCallback((opacity: number, sketchId: string) => {
      const sketch = sketchList.find((s) => s.id === sketchId);
      if (!sketch) return;
      sketch.imageOverlay.setOpacity(opacity);
    },
    [sketchList]
  );

  const SaveOpacity = (sketchId: string, opacityVal: number) => {
    dispatch(setSketchOpacity({ id: sketchId, opacity: opacityVal }));
  };
  //#endregion

  const HandleDelete = useCallback(async (sketchId: string) => {
      try {
        const sketch = sketchList.find((s) => s.id === sketchId);
        if (!sketch) throw new Error('Kroki bulunamadı');

        if (map!.hasLayer(sketch.imageOverlay)) map!.removeLayer(sketch.imageOverlay);
        dispatch(removeSketch(sketchId));
        await fetch(`${import.meta.env.VITE_API_URL}/api/sketch/${sketchId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } });
      } catch (err: any) {
        dispatch(showAlertError({ message: err?.message || 'Silme İşleminde Hata Oluştu' }));
      }
    },
    [dispatch, map, sketchList]
  );

  const FreezingHandler = useCallback(
    (sketchId: string) => {
      dispatch(toggleSketchFrozenStatus(sketchId));
    },
    [dispatch]
  );

  return (
    <ListGroup className="shadow">
      <ListGroup.Item className="bg-light text-primary fw-bold">Krokiler</ListGroup.Item>

      {map && (
        <ListGroup.Item className="bg-light ">
          <Form.Group controlId="formFile" className="my-2">
            <Form.Control type="file" accept="image/*" onChange={HandleFileUpload} />
          </Form.Group>
        </ListGroup.Item>
      )}

      {map &&
        sketchList &&
        sketchList.map((sketch, index) => (
          <ListGroup.Item key={index} className="bg-light">
            <Stack direction={'vertical'} className="justify-content-between">
              <ImageSettings
                index={index}
                sketchId={sketch.id}
                sketchSource={sketch.source}
                sketch_rotation={sketch.rotation}
                sketch_opacity={sketch.opacity}
                frozen={sketch.frozen}
                FreezingHandler={FreezingHandler}
                RotationHandler={HandleRotate}
                OpacityHandler={HandleOpacity}
                SaveRotation={SaveRotation}
                SaveOpacity={SaveOpacity}
                HandleDelete={HandleDelete}
                key={index}
              />
            </Stack>
          </ListGroup.Item>
        ))}
    </ListGroup>
  );
}
