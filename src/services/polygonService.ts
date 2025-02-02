import * as L from "leaflet";
import CustomLayer from "../models/Features/CustomLayer";
import PolygonGeoJson from "../models/Features/PolygonGeoJson"

export function ShowPolygon(polygon: PolygonGeoJson, drawnItems:  L.FeatureGroup<any>): void {
  L.geoJSON(polygon, {
    onEachFeature: function (_feature, layer) {
      (layer as CustomLayer).customProperties = {
        id: polygon.properties.id,
        floor: polygon.properties.floor,
        typeOfData: 'polygon',
      };
      (layer as any)._leaflet_id = polygon.properties.layerId!; 
      layer.bindPopup(polygon.properties.popupContent != null ? polygon.properties.popupContent : '');
      drawnItems.addLayer(layer);
    }
  });
  
  // Add Entrance Point to Map
  if (polygon.properties.entrance == null) {
    alert('Be Carefull Entrance point not founded for adding to map, Please add an entrance point to the polygon');
    return;
  }
}

export function HidePolygonByLayer(polygonLayer: L.Layer, drawnItems:  L.FeatureGroup<any>): void {
  if(polygonLayer != null){
    drawnItems.removeLayer(polygonLayer);
  }
}

export function HidePolygon(polygon: PolygonGeoJson, drawnItems:  L.FeatureGroup<any>): void {
  const polygonLayer = drawnItems.getLayer(polygon.properties.layerId!);
  if (polygonLayer == null) {
    alert('Layer of polygon colud not found');
    return;
  }
  drawnItems.removeLayer(polygonLayer);
}

export function ShowOrHidePolygon(polygon: PolygonGeoJson, drawnItems:  L.FeatureGroup<any>): boolean {
  const polygonLayer = drawnItems.getLayer(polygon.properties.layerId!);
  if(polygonLayer != null){
    HidePolygonByLayer(polygonLayer, drawnItems);
    return false;
  }
  else{
    ShowPolygon(polygon, drawnItems);
    return true;
  }
}

export function UpdatePopupContentOfPolygon(polygon: PolygonGeoJson, drawnItems:  L.FeatureGroup<any>): void {
  const layer = drawnItems.getLayer(polygon.properties.layerId!);
  if(layer != null){
    layer.setPopupContent(polygon.properties.popupContent!);
  }
}

 


// CreatePolygon(geoJson: PolygonGeoJson, _id: string, layer: CustomLayer): void {
//   geoJson.properties = {
//     id: _id,
//     floor: appStates.currentFloor.index,
//     name: 'Bina',
//     popupContent: `Bina Bilgisi, Kat:${appStates.currentFloor.index} ID:${_id}`,
//   };

//   polygons.push(geoJson);
//   drawnItems.addLayer(layer);

//   appStates.isEntrancePointAdded = false;

//   this.ShowModalPolygonInformations(_id);
//   this.uiSynchronizerService.polygon();
// }


// DeletePolygon(pId: string): void {
//   var isExist = polygons.some((p) => p.properties.id == pId);
//   if (isExist != true) {
//     alert('Polygon to delete not founded');
//     return;
//   }

//   const _index = polygons.findIndex((p) => p.properties.id == pId);
//   polygons.splice(_index, 1);

//   this.RemovePolygonFromMap(pId);
// }





// ShowModalPolygonInformations(pId: string): void {
//   let polygon = polygons.find((p) => p.properties.id == pId);
//   if (polygon == null) {
//     return;
//   }

//   $('#buildingName').val(polygon.properties.name != null ? polygon.properties.name : '');
//   $('#modalSetPolyInfo').attr('currentPolyId', pId);
//   $('#modalSetPolyInfo').show();
// }

