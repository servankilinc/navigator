import * as L from 'leaflet';
import CustomLayer from '../models/Features/CustomLayer';
import { store } from '../redux/store';
import { addThreeDModel, setThreeDModelCoordinates } from '../redux/reducers/storageSlice';
import ThreeDModelPointGeoJson from '../models/Features/ThreeDModelPointGeoJson';

function iconModelPoint(rotationYDeg: number){
  
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="transform: rotate(${rotationYDeg}deg); transform-origin: center;"><path fill="#00ec3bff" d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM331.3 188.7L435.3 292.7C439.9 297.3 441.2 304.2 438.8 310.1C436.4 316 430.5 320 424 320L368 320L368 416C368 433.7 353.7 448 336 448L304 448C286.3 448 272 433.7 272 416L272 320L216 320C209.5 320 203.7 316.1 201.2 310.1C198.7 304.1 200.1 297.2 204.7 292.7L308.7 188.7C314.9 182.5 325.1 182.5 331.3 188.7z"/></svg>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
}

export function CreateThreeDModel(geoJson: ThreeDModelPointGeoJson, layer: CustomLayer, _id: string, floor: number,  drawnItems: L.FeatureGroup<any>) {
  drawnItems.addLayer(layer);
  geoJson.properties = {
    layerId: (layer as any)._leaflet_id,
    id: _id,
    floor: floor,
    name: '3D Model',
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scaleRate: 1,
    source: '/folderName/fileName',
  };
  store.dispatch(addThreeDModel(geoJson as ThreeDModelPointGeoJson));
}

export function ShowThreeDModel(threeDModel: ThreeDModelPointGeoJson, drawnItems: L.FeatureGroup<any>): void {
  L.geoJSON(threeDModel, {
    onEachFeature: function (_feature, layer) {
      const latLng = (layer as L.Marker).getLatLng();
      
      const degrees = threeDModel.properties.rotateY * (180 / Math.PI);
      const _icon = iconModelPoint(degrees);
      let modelPointMarker = L.marker(latLng, {icon: _icon});

      (modelPointMarker as CustomLayer).customProperties = {
        id: threeDModel.properties.id,
        floor: threeDModel.properties.floor,
        typeOfData: 'modelPoint',
      };
      (modelPointMarker as any)._leaflet_id = threeDModel.properties.layerId!;


      // radyan olarak tuttulan açıyı dereceye çevir
      // TODO: threeDModel.properties.rotateY bilgisi okunup ikon ona göre ayarlanmalı
      drawnItems.addLayer(modelPointMarker);
    },
  });
}

export function RotateThreeDModelPoint(threeDModel: ThreeDModelPointGeoJson, newRotationYDeg: number, drawnItems: L.FeatureGroup<any>) {
  const layer = drawnItems.getLayer(threeDModel.properties.layerId!) as L.Marker;
  if (layer && layer instanceof L.Marker) {
    const newIcon = iconModelPoint(newRotationYDeg);
    layer.setIcon(newIcon);
  }
}

export function UpdateThreeDModel(layer: CustomLayer) {
  const threeDModelList = store.getState().storageReducer.threeDModels;
  if (threeDModelList == null) throw new Error('ThreeD Model list could not found');

  const threeDModel = threeDModelList.find((p) => p.properties.id == layer.customProperties!.id);
  if (threeDModel == null) throw new Error('ThreeD model could not founded for update');

  if (!(layer instanceof L.Marker)) throw new Error('Layer is not a marker!');

  const latlng = layer.getLatLng();
  if (latlng == null) throw new Error('Informatinons could not be updated unsuported Type');
  store.dispatch(setThreeDModelCoordinates({ id: threeDModel.properties.id, coordinates: [latlng.lng, latlng.lat] }));
}

export function HideThreeDModelByLayer(threeDModel: L.Layer, drawnItems: L.FeatureGroup<any>): void {
  if (threeDModel != null) {
    drawnItems.removeLayer(threeDModel);
  }
}

export function HideThreeDModel(threeDModel: ThreeDModelPointGeoJson, drawnItems: L.FeatureGroup<any>): void {
  const layer = drawnItems.getLayer(threeDModel.properties.layerId!);
  if (layer != null) {
    drawnItems.removeLayer(layer);
  }
}

export function ShowOrHideThreeDModel(threeDModel: ThreeDModelPointGeoJson, drawnItems: L.FeatureGroup<any>): void {
  const threeDModelLayer = drawnItems.getLayer(threeDModel.properties.layerId!);
  if (threeDModelLayer != null) {
    // Hide
    HideThreeDModelByLayer(threeDModelLayer, drawnItems);
  } else {
    // Show
    ShowThreeDModel(threeDModel, drawnItems);
  }
}
