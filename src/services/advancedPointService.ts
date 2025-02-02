import * as L from 'leaflet';
import AdvancedPointGeoJson from '../models/Features/AdvancedPointGeoJson';
import CustomLayer from '../models/Features/CustomLayer';
import AdvancedPointTypes from '../models/UIModels/AdvancedPointTypes';

// const svgStairs2D = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
// svgStairs2D.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
// svgStairs2D.setAttribute('viewBox', '0 0 576 512');
// svgStairs2D.innerHTML = '<path d="M384 64c0-17.7 14.3-32 32-32l128 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-96 0 0 96c0 17.7-14.3 32-32 32l-96 0 0 96c0 17.7-14.3 32-32 32l-96 0 0 96c0 17.7-14.3 32-32 32L32 480c-17.7 0-32-14.3-32-32s14.3-32 32-32l96 0 0-96c0-17.7 14.3-32 32-32l96 0 0-96c0-17.7 14.3-32 32-32l96 0 0-96z"/>';

// circleMarker = L.svgOverlay(svgElevator2D, [[latLng.lat - 0.0001, latLng.lng - 0.0001], [latLng.lat + 0.0001, latLng.lng + 0.0001]], {
//   opacity: 0.7,
//   interactive: true
// });

const customIconElevator = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="#FFC800" d="M132.7 4.7l-64 64c-4.6 4.6-5.9 11.5-3.5 17.4s8.3 9.9 14.8 9.9l128 0c6.5 0 12.3-3.9 14.8-9.9s1.1-12.9-3.5-17.4l-64-64c-6.2-6.2-16.4-6.2-22.6 0zM64 128c-35.3 0-64 28.7-64 64L0 448c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-256c0-35.3-28.7-64-64-64L64 128zm96 96a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM80 400c0-26.5 21.5-48 48-48l64 0c26.5 0 48 21.5 48 48l0 16c0 17.7-14.3 32-32 32l-96 0c-17.7 0-32-14.3-32-32l0-16zm192 0c0-26.5 21.5-48 48-48l64 0c26.5 0 48 21.5 48 48l0 16c0 17.7-14.3 32-32 32l-96 0c-17.7 0-32-14.3-32-32l0-16zm32-128a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zM356.7 91.3c6.2 6.2 16.4 6.2 22.6 0l64-64c4.6-4.6 5.9-11.5 3.5-17.4S438.5 0 432 0L304 0c-6.5 0-12.3 3.9-14.8 9.9s-1.1 12.9 3.5 17.4l64 64z"/></svg>`,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15,15]
});

const customIconStairs = L.divIcon({
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path fill="#F53924" d="M384 64c0-17.7 14.3-32 32-32l128 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-96 0 0 96c0 17.7-14.3 32-32 32l-96 0 0 96c0 17.7-14.3 32-32 32l-96 0 0 96c0 17.7-14.3 32-32 32L32 480c-17.7 0-32-14.3-32-32s14.3-32 32-32l96 0 0-96c0-17.7 14.3-32 32-32l96 0 0-96c0-17.7 14.3-32 32-32l96 0 0-96z"/></svg>`, // SVG kodunu buraya koy
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});


export function ShowAdvancedPoint(advancedPoint: AdvancedPointGeoJson, drawnItems:  L.FeatureGroup<any>): void {
  L.geoJSON(advancedPoint, {
    onEachFeature: function (_feature, layer) {
      const latLng = (layer as L.Marker).getLatLng();

      let circleMarker: L.Marker | L.CircleMarker;
      switch (advancedPoint.properties.type) {
        case AdvancedPointTypes.elevator:
          circleMarker =  L.marker(latLng, { icon: customIconElevator })
          break;
        case AdvancedPointTypes.stairs:
          circleMarker = L.marker(latLng, {icon: customIconStairs});
          break;
        default:
          circleMarker = L.circleMarker(latLng);
          break;
      }
      (circleMarker as CustomLayer).customProperties = {
        id: advancedPoint.properties.id,
        floor: advancedPoint.properties.floor,
        typeOfData: 'circlemarker',
      };
      (circleMarker as any)._leaflet_id = advancedPoint.properties.layerId!; 
      drawnItems.addLayer(circleMarker);
    }
  });
}

export function ShowAdvancedPointByType(type: AdvancedPointTypes, advancedPoint: AdvancedPointGeoJson, drawnItems:  L.FeatureGroup<any>): void {
  L.geoJSON(advancedPoint, {
    onEachFeature: function (_feature, layer) {
      const latLng = (layer as L.Marker).getLatLng();
      let circleMarker: L.Marker | L.CircleMarker;
      
      switch (type) {
        case AdvancedPointTypes.elevator:
          circleMarker =  L.marker(latLng, { icon: customIconElevator })
          break;
        case AdvancedPointTypes.stairs:
          circleMarker = L.marker(latLng, {icon: customIconStairs});
          break;
        default:
          circleMarker = L.circleMarker(latLng);
          break;
      }
      (circleMarker as CustomLayer).customProperties = {
        id: advancedPoint.properties.id,
        floor: advancedPoint.properties.floor,
        typeOfData: 'circlemarker',
      };
      (circleMarker as any)._leaflet_id = advancedPoint.properties.layerId!; 
      drawnItems.addLayer(circleMarker);
    }
  });
}

export function HideAdvancedPointByLayer(layer: L.Layer, drawnItems:  L.FeatureGroup<any>): void {
  if(layer != null){
    drawnItems.removeLayer(layer);
  }
}

export function HideAdvancedPoint(advancedPoint: AdvancedPointGeoJson, drawnItems:  L.FeatureGroup<any>): void {
  const layer = drawnItems.getLayer(advancedPoint.properties.layerId!);
  if (layer != null) {
    drawnItems.removeLayer(layer); 
  }
}

export function ShowOrHideAdvancedPoint(advancedPoint: AdvancedPointGeoJson, drawnItems:  L.FeatureGroup<any>): void {
  const layer = drawnItems.getLayer(advancedPoint.properties.layerId!);
  if(layer != null){
    // Hide
    HideAdvancedPointByLayer(layer, drawnItems);
  }
  else{
    // Show
    ShowAdvancedPoint(advancedPoint, drawnItems);
  }
}
