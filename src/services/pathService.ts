import * as L from 'leaflet';
import LineStringGeoJson from '../models/Features/LineStringGeoJson';
import CustomLayer from '../models/Features/CustomLayer';


export function ShowPath(path: LineStringGeoJson, drawnItems:  L.FeatureGroup<any>): void  {
  L.geoJSON(path, {
    onEachFeature: function (_feature, layer) {
      (layer as CustomLayer).customProperties = {
        id: path.properties.id,
        floor: path.properties.floor,
        typeOfData: 'polyline',
      };
      (layer as any)._leaflet_id = path.properties.layerId!; 
      drawnItems.addLayer(layer);
    },
  });
}

export function HidePathByLayer(layer: L.Layer, drawnItems:  L.FeatureGroup<any>): void {
  if(layer != null){
    drawnItems.removeLayer(layer);
  }
}

export function HidePath(path: LineStringGeoJson, drawnItems: L.FeatureGroup<any>): void {
  const layer = drawnItems.getLayer(path.properties.layerId!);
  if(layer == null){
    alert('Layer of path colud not found');
    return;
  }
  drawnItems.removeLayer(layer);
}

export function ShowOrHidePath(path: LineStringGeoJson, drawnItems:  L.FeatureGroup<any>): boolean {
  const layer = drawnItems.getLayer(path.properties.layerId!);
  if(layer != null){
    console.log(layer)
    HidePathByLayer(layer, drawnItems);
    return false;
  }
  else{
    ShowPath(path, drawnItems);
    return true;
  }
}

export function ClearRoutes(drawnItemsRoute:  L.FeatureGroup<any>): void {
  drawnItemsRoute.eachLayer(function (layer) {
    drawnItemsRoute.removeLayer(layer);
  });
}



// CreateLineString(geoJson: LineStringGeoJson, _id: string, layer: CustomLayer): void {
//   geoJson.properties = {
//     id: _id,
//     floor: appStates.currentFloor.index,
//     name: 'Yol',
//     popupContent: `Yol Bilgisi, Kat:${appStates.currentFloor.index} ID:${_id}`,
//   };

//   paths.push(geoJson);
//   drawnItems.addLayer(layer);

//   this.uiSynchronizerService.path();
// }


// DeletePath(pId: string) {
//   const path = paths.findIndex((p) => p.properties.id == pId);
//   if (path == null) {
//     alert('Path to delete not founded');
//     return;
//   }

//   const _index = paths.findIndex((p) => p.properties.id == pId);
//   paths.splice(_index, 1);

//   this.RemovePathFromMap(pId);
// }

