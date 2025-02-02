import * as L from 'leaflet';
import EntrancePointGeoJson from '../models/Features/EntrancePointGeoJson';
import CustomLayer from '../models/Features/CustomLayer';

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

