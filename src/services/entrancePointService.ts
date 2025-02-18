import * as L from 'leaflet';
import EntrancePointGeoJson from '../models/Features/EntrancePointGeoJson';
import CustomLayer from '../models/Features/CustomLayer';
import { store } from '../redux/store';
import { setEntranceAdded } from '../redux/reducers/appSlice';
import { addEntrancePoint, setEntrancePoinOfPolygon, setEntrancePointCoordinates, setEntrancePointCordsOfPolygon } from '../redux/reducers/storageSlice';


export function CreateEntrancePoint(geoJson: EntrancePointGeoJson, layer: CustomLayer, _id: string, floor: number, drawnItems: L.FeatureGroup<any>) {
  drawnItems.addLayer(layer);
  const polygonList = store.getState().storageReducer.polygons;
  if(polygonList == null) throw new Error('Polygon list could not found');

  var lastPolygon = polygonList[polygonList.length - 1];
  geoJson.properties = {
    layerId: (layer as any)._leaflet_id,
    id: _id,
    floor: floor,
    name: 'Bina Girisi',
    isEntrance: true,
    polygonId: lastPolygon.properties.id,
  };
  store.dispatch(setEntrancePoinOfPolygon(geoJson as EntrancePointGeoJson));
  store.dispatch(addEntrancePoint(geoJson as EntrancePointGeoJson));
  store.dispatch(setEntranceAdded(true));
}

export function UpdateEntrancePoint(layer: CustomLayer) {
  const entrancePointList = store.getState().storageReducer.entrancePoints;
  if (entrancePointList== null) throw new Error('EntrancePoint list could not found');

  const entrancePoint = entrancePointList.find((p) => p.properties.id == layer.customProperties!.id);
  if (entrancePoint == null) throw new Error('Entrance point could not founded for update');

  if (!(layer instanceof L.Marker)) throw new Error('Layer is not a marker!');

  const latlng = layer.getLatLng();
  if (latlng == null) throw new Error('Informatinons could not be updated unsuported Type');

  store.dispatch(setEntrancePointCordsOfPolygon({ id: entrancePoint.properties.polygonId!, coordinates: [latlng.lng, latlng.lat] }));
  store.dispatch(setEntrancePointCoordinates({ id: entrancePoint.properties.id, coordinates: [latlng.lng, latlng.lat] }));
}

export function ShowEntrancePoint(entrancePoint: EntrancePointGeoJson, drawnItems:  L.FeatureGroup<any>): void {
  L.geoJSON(entrancePoint, {
    onEachFeature: function (_feature, layer) {
      (layer as CustomLayer).customProperties = {
        id: entrancePoint.properties.id,
        floor: entrancePoint.properties.floor,
        typeOfData: 'marker',
      };
      (layer as any)._leaflet_id = entrancePoint.properties.layerId!; 
      drawnItems.addLayer(layer);
    }
  });
}

export function HideEntrancePointByLayer(entrancePointLayer: L.Layer, drawnItems:  L.FeatureGroup<any>): void {
  if(entrancePointLayer != null){
    drawnItems.removeLayer(entrancePointLayer);
  }
}

export function HideEntrancePoint(entrancePoint: EntrancePointGeoJson, drawnItems:  L.FeatureGroup<any>): void {
  const layer = drawnItems.getLayer(entrancePoint.properties.layerId!);
  if (layer != null) {
    drawnItems.removeLayer(layer); 
  }
}

export function ShowOrHideEntrancePoint(entrancePoint: EntrancePointGeoJson, drawnItems:  L.FeatureGroup<any>): void {
  const entrancePointLayer = drawnItems.getLayer(entrancePoint.properties.layerId!);
  if(entrancePointLayer != null){
    // Hide
    HideEntrancePointByLayer(entrancePointLayer, drawnItems);
  }
  else{
    // Show
    ShowEntrancePoint(entrancePoint, drawnItems);
  }
}




// CreateEntrancePoint(geoJson: PointGeoJson, _id: string): void {
//   var lastPolygon = polygons[polygons.length - 1];
//   geoJson.properties = {
//     id: _id,
//     floor: appStates.currentFloor.index,
//     name: 'Bina Girisi',
//     isEntrance: true,
//     polygonId: lastPolygon.properties.id,
//   };
//   lastPolygon.properties.entrance = geoJson;

//   entrancePoints.push(geoJson);
//   appStates.isEntrancePointAdded = true;
// }


// AddEntrancePointToMap(pId: string): void {
//   let entrancePoint = entrancePoints.find((p) => p.properties.id == pId);
//   if (entrancePoint == null) {
//     alert('Entrance point not founded for adding to map');
//     return;
//   }
//   L.geoJSON(entrancePoint, {
//     onEachFeature: function (feature, layer) {
//       if ((layer as CustomLayer).customProperties !== undefined) {
//         (layer as CustomLayer).customProperties = {
//           id: entrancePoint.properties.id,
//           floor: entrancePoint.properties.floor,
//           typeOfData: 'Point',
//         };
//         drawnItems.addLayer(layer);
//       } else {
//         alert('Layer is not a custom layer for adding advanced point to map');
//       }
//     },
//   });
// }

