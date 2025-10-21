import React from 'react';
import * as L from 'leaflet';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { Button, Form, ListGroup, Stack } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa6';
import Sketch from '../models/Sketch';
import e7 from '../scripts/idGenerator';
import {
  addSketch,
  removeSketch,
  rePositionSketch,
  setPositionOfCorner,
  setSketchOpacity,
  setSketchRotaion,
} from '../redux/reducers/mapSlice';
import ImageSettings from './ImageSettings';
import { showAlertError } from '../redux/reducers/alertSlice';
import 'leaflet-imageoverlay-rotated';
import { store } from '../redux/store';

export default function ImageController(): React.JSX.Element {
  const dispath = useAppDispatch();
  const sketchList = useAppSelector((state) => state.mapReducer.sketchList);

  const map = useAppSelector((state) => state.mapReducer.map);

  const HandleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const source = URL.createObjectURL(files[0]);
      const id = e7();
      const center = map!.getCenter()!;
      const offset = 0.0005;
      const corners = [
        L.latLng(center.lat + offset, center.lng - offset),
        L.latLng(center.lat + offset, center.lng + offset),
        L.latLng(center.lat - offset, center.lng + offset),
        L.latLng(center.lat - offset, center.lng - offset),
      ];

      event.target.value = '';
      // Leaflet DistortableImage kullanımı
      var imageOverlay = L.imageOverlay
        .rotated(source, corners[0], corners[1], corners[3], {
          opacity: 0.7,
          interactive: true,
        })
        .addTo(map!);

      const newSketch = new Sketch(id, source, imageOverlay, corners);
      dispath(addSketch(newSketch));

      var polygon = new L.Polygon(corners, {
        opacity: 0,
        fillOpacity: 0,
      }).addTo(map!);
      var cp1 = L.marker(corners[0], { draggable: true }).addTo(map!);
      var cp2 = L.marker(corners[1], { draggable: true }).addTo(map!);
      var cp3 = L.marker(corners[3], { draggable: true }).addTo(map!);

      //#region DRAGGABLE POLYGON

      // Sürükleme için durum bilgileri
      let isDragging = false;
      let startLatLng: L.LatLng | null = null;

      // Poligon üzerine mousedown olayı ekleyerek sürüklemeyi başlat
      polygon.on('mousedown', (e: L.LeafletMouseEvent) => {
        isDragging = true;
        startLatLng = e.latlng;
        // Sürükleme sırasında haritanın da sürüklenmesini engellemek için
        map!.dragging.disable();
      });

      // Harita üzerinde mousemove ile poligonun konumunu güncelle
      map!.on('mousemove', (e: L.LeafletMouseEvent) => {
        if (!isDragging || !startLatLng) return;

        // Fare hareketi farkını hesapla
        const latDiff = e.latlng.lat - startLatLng.lat;
        const lngDiff = e.latlng.lng - startLatLng.lng;

        // Poligonun mevcut koordinatlarını al ve güncelle
        const currentLatLngs = polygon.getLatLngs() as L.LatLng[][]; // Çokgen için (iç içe dizi)
        const newLatLngs = currentLatLngs.map((latlngArr) => latlngArr.map((point) => L.latLng(point.lat + latDiff, point.lng + lngDiff)));

        cp1.setLatLng(newLatLngs[0][0]);
        cp2.setLatLng(newLatLngs[0][1]);
        cp3.setLatLng(newLatLngs[0][3]);

        // Poligonun koordinatlarını güncelle
        polygon.setLatLngs(newLatLngs);

        imageOverlay.reposition(newLatLngs[0][0], newLatLngs[0][1], newLatLngs[0][3]);
        dispath(rePositionSketch({ id: id, corners: newLatLngs[0] }));
        startLatLng = e.latlng;
      });

      // Mouseup olayı ile sürüklemeyi sonlandır
      map!.on('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          startLatLng = null;
          // Haritanın sürüklenmesini tekrar etkinleştir
          map!.dragging.enable();
        }
      });
      //#endregion

      // #region corner points

      cp1.on('drag', () => {
        var _corners = [...store.getState().mapReducer.sketchList.find((sketch) => sketch.id === id)!.corners];
        _corners[0] = cp1.getLatLng();
        imageOverlay.reposition(_corners[0], _corners[1], _corners[3]);
        polygon.setLatLngs([_corners]);
        dispath(rePositionSketch({ id: id, corners: _corners }));
      });

      cp2.on('drag', () => {
        var _corners = [...store.getState().mapReducer.sketchList.find((sketch) => sketch.id === id)!.corners];
        _corners[1] = cp2.getLatLng();
        imageOverlay.reposition(_corners[0], _corners[1], _corners[3]);
        polygon.setLatLngs([_corners]);
        dispath(rePositionSketch({ id: id, corners: _corners }));
      });

      cp3.on('drag', () => {
        var _corners = [...store.getState().mapReducer.sketchList.find((sketch) => sketch.id === id)!.corners];
        _corners[3] = cp3.getLatLng();
        imageOverlay.reposition(_corners[0], _corners[1], _corners[3]);
        polygon.setLatLngs([_corners]);
        dispath(rePositionSketch({ id: id, corners: _corners }));
      });
      // #endregion
    }
  };

  function HandleRotate(angle: number, sketchId: string) {
    const sketch = sketchList.find((sketch) => sketch.id === sketchId);
    if (sketch) {
      const imageOverlay = sketch.imageOverlay;

      // 4 köşenin ortalama noktası bulunarak merkez hesaplanıyor
      const centerLat = sketch.corners.reduce((sum, corner) => sum + corner.lat, 0) / sketch.corners.length;
      const centerLng = sketch.corners.reduce((sum, corner) => sum + corner.lng, 0) / sketch.corners.length;
      const center = L.latLng(centerLat, centerLng);

      // Açıyı radyana çeviriyoruz
      const rad = (angle * Math.PI) / 180;

      // Tüm köşeleri yeni konumlarına çevir
      const rotatedCorners = sketch.corners.map((corner) => {
        const x = corner.lat - center.lat; // x yükseklik
        const y = corner.lng - center.lng; // y genişlik
        const x1 = x * Math.cos(rad) - y * Math.sin(rad);
        const y1 = x * Math.sin(rad) + y * Math.cos(rad);
        return L.latLng(center.lat + x1, center.lng + y1);
      });
      imageOverlay.reposition(rotatedCorners[0], rotatedCorners[1], rotatedCorners[3]);
    }
  }

  function HandleOpacity(opacity: number, sketchId: string) {
    const sketch = sketchList.find((sketch) => sketch.id === sketchId);
    if (sketch) {
      const imageOverlay = sketch.imageOverlay;
      imageOverlay.setOpacity(opacity);
    }
  }

  function SaveRotation(sketchId: string, rotateVal: number) {
    dispath(setSketchRotaion({ id: sketchId, rotation: rotateVal }));
  }
  function SaveOpacity(sketchId: string, opacityVal: number) {
    dispath(setSketchOpacity({ id: sketchId, opacity: opacityVal }));
  }

  function HandleDelete(sketchId: string) {
    try {
      const sketch = sketchList.find((sketch) => sketch.id === sketchId);
      if (sketch) {
        // sketch.imageOverlay.remove();
        map!.removeLayer(sketch.imageOverlay);
        dispath(removeSketch(sketchId));
      } else {
        throw new Error('Katman bulunamadı');
      }
    } catch (error: Error | any) {
      dispath(showAlertError({ message: error.message }));
    }
  }

  return (
    <ListGroup className="shadow">
      <ListGroup.Item className="bg-light text-primary fw-bold">Resimler</ListGroup.Item>

      {map != undefined && (
        <ListGroup.Item className="bg-light ">
          <Form.Group controlId="formFile" className="my-2">
            <Form.Control type="file" accept="image/*" onChange={HandleFileUpload} />
          </Form.Group>
        </ListGroup.Item>
      )}

      {map != undefined &&
        sketchList != undefined &&
        sketchList.map((sketch, index) => (
          <ListGroup.Item key={index} className="bg-light">
            <Stack direction={'vertical'} className="justify-content-between">
              <ImageSettings
                index={index}
                sketchId={sketch.id}
                sketchSource={sketch.source}
                sketch_rotation={sketch.rotation}
                sketch_opacity={sketch.opacity}
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
