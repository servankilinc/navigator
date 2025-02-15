import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import 'leaflet-draw';
import CustomLayer from '../models/Features/CustomLayer';
import e7 from '../scripts/idGenerator';
import * as geojson from 'geojson';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import {
  addAdvancedPoint,
  addEntrancePoint,
  addPath,
  addPolygon,
  setAdvancedPointCoordinates,
  setEntrancePoinOfPolygon,
  setEntrancePointCoordinates,
  setEntrancePointCordsOfPolygon,
  setPathCoordinates,
  setPolygonCoordinates,
} from '../redux/reducers/storageSlice';
import EntrancePointGeoJson from '../models/Features/EntrancePointGeoJson';
import AdvancedPointGeoJson from '../models/Features/AdvancedPointGeoJson';
import { setEntranceAdded } from '../redux/reducers/appSlice';
import PolygonGeoJson from '../models/Features/PolygonGeoJson';
import LineStringGeoJson from '../models/Features/LineStringGeoJson';
import { setDrawnItems, setDrawnItemsRoute } from '../redux/reducers/mapSlice';
import Floor from '../models/Floor';
import ModalPolygonInfo from './ModalPolygonInfo';
import ModalAdvencedPointInfo from './ModalAdvencedPointInfo';
import { ShowAdvancedPoint } from '../services/advancedPointService';
import { ShowEntrancePoint } from '../services/entrancePointService';
import { ShowPolygon } from '../services/polygonService';
import { ShowPath } from '../services/pathService';

function Map() {
  const dispatch = useAppDispatch();

  const polygonList = useAppSelector((state) => state.storageReducer.polygons);
  const pathList = useAppSelector((state) => state.storageReducer.paths);
  const entrancePoints = useAppSelector((state) => state.storageReducer.entrancePoints);
  const advancedPoints = useAppSelector((state) => state.storageReducer.advancedPoints);
  const currentFloor = useAppSelector((state) => state.appReducer.currentFloor);
  const isEntrancePointAdded = useAppSelector((state) => state.appReducer.isEntrancePointAdded);

  // ------------------ REFERANCES ------------------
  const polygonListRef = useRef<PolygonGeoJson[]>();
  const pathListRef = useRef<LineStringGeoJson[]>();
  const entrancePointsRef = useRef<EntrancePointGeoJson[]>();
  const advancedPointsRef = useRef<AdvancedPointGeoJson[]>();
  const currentFloorRef = useRef<Floor>();
  const isEntrancePointAddedRef = useRef<boolean>(false);

  const drawnItemsRef = useRef<L.FeatureGroup | null>(null);
  const drawnItemsRouteRef = useRef<L.FeatureGroup | null>(null);
  // ------------------ REFERANCES ------------------

  // ------------------ FORM POLYGON INFO ------------------
  const [showPolyEdit, setShowPolyEdit] = useState(false);
  const [polygonId, setPolygonId] = useState<string>('');
  // ------------------ FORM POLYGON INFO ------------------

  // ------------------ FORM ADVANCED POINT INFO ------------------
  const [showAdvPointEdit, setShowAdvPointEdit] = useState(false);
  const [advPointId, setAdvPointId] = useState<string>('');
  // ------------------ FORM ADVANCED POINT INFO ------------------

  useEffect(() => {
    polygonListRef.current = polygonList;
    // console.log("polygonList",polygonList);
  }, [polygonList]);
  useEffect(() => {
    pathListRef.current = pathList;
    // console.log("pathList",pathList);
  }, [pathList]);
  useEffect(() => {
    entrancePointsRef.current = entrancePoints;
    // console.log("entrancePoints",entrancePoints);
  }, [entrancePoints]);
  useEffect(() => {
    advancedPointsRef.current = advancedPoints;
    // console.log("advancedPoints",advancedPoints);
  }, [advancedPoints]);
  useEffect(() => {
    isEntrancePointAddedRef.current = isEntrancePointAdded;
  }, [isEntrancePointAdded]);
  useEffect(() => {
    currentFloorRef.current = currentFloor;
  }, [currentFloor]);

  useEffect(() => {
    MapInitilaze();

    polygonList
      .filter((f) => f.properties.floor == 0)
      .map((polygon) => {
        ShowPolygon(polygon, drawnItemsRef.current!);
      });

    entrancePoints
      .filter((f) => f.properties.floor == 0)
      .map((entrancePoint) => {
        ShowEntrancePoint(entrancePoint, drawnItemsRef.current!);
      });

      advancedPoints
      .filter((f) => f.properties.floor == 0)
      .map((advancedPoint) => {
        ShowAdvancedPoint(advancedPoint, drawnItemsRef.current!);
      });

    pathList
      .filter((f) => f.properties.floor == 0)
      .map((path) => {
        ShowPath(path, drawnItemsRef.current!);
      });


  }, []);

  function MapInitilaze() {
    const map = L.map('map', {
      minZoom: 10,
      maxZoom: 25,
    }).setView([39.090142, 33.088293], 17);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    const drawnItemsGroup = new L.FeatureGroup();
    const drawnItemsRouteGroup = new L.FeatureGroup();

    drawnItemsRef.current = drawnItemsGroup;
    drawnItemsRouteRef.current = drawnItemsRouteGroup;

    dispatch(setDrawnItems(drawnItemsGroup));
    dispatch(setDrawnItemsRoute(drawnItemsRouteGroup));

    map.addLayer(drawnItemsGroup);
    map.addLayer(drawnItemsRouteGroup);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItemsGroup,
      },
      draw: {
        // polyline: true,
        // polygon: true,
        rectangle: false,
        circle: false,
        // marker: true,
        // circlemarker: true,
      },
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (event) => {
      const createEvent = event as L.DrawEvents.Created;
      const layer = createEvent.layer as CustomLayer;
      const layerType = createEvent.layerType;
      if (layer.toGeoJSON == null) {
        alert('Layer Type Support');
        return;
      }
      const _id = e7();

      let geoJson: geojson.Feature<geojson.Geometry>;
      geoJson = layer.toGeoJSON();

      layer.customProperties = {
        id: _id,
        floor: currentFloorRef.current!.index,
        typeOfData: layerType,
      };

      switch (layerType) {
        case 'marker':
          if (polygonListRef.current != null && polygonListRef.current.length > 0 && isEntrancePointAddedRef.current == false) {
            CreateEntrancePoint(geoJson as EntrancePointGeoJson, layer, _id);
          } else {
            alert('Before adding a entrance point, you must add an building point');
          }
          break;
        case 'circlemarker':
          CreateAdvancedPoint(geoJson as AdvancedPointGeoJson, layer, _id);
          break;
        case 'polygon':
          if (polygonListRef.current != null && polygonListRef.current.length > 0 && isEntrancePointAddedRef.current == false) {
            alert('Before adding a polygon, you must add an entrance point');
          } else {
            CreatePolygon(geoJson as PolygonGeoJson, layer, _id);
          }
          break;
        case 'polyline':
          CreatePath(geoJson as LineStringGeoJson, layer, _id);
          break;
        default:
          alert('GeoJson Type Not Supported');
          break;
      }
    });

    map.on(L.Draw.Event.EDITED, function (event) {
      const editeEvent = event as L.DrawEvents.Edited;
      var layers = editeEvent.layers;

      layers.eachLayer(function (_layer) {
        const layer = _layer as CustomLayer;

        if (layer.customProperties?.typeOfData == 'polygon') {
          UpdatePolygon(layer);
        } else if (layer.customProperties?.typeOfData == 'polyline') {
          UpdatePath(layer);
        } else if (layer.customProperties?.typeOfData == 'marker') {
          UpdateEntrancePoint(layer);
        } else if (layer.customProperties?.typeOfData == 'circlemarker') {
          UpdateAdvancedPoint(layer);
        } else {
          alert('Does not support this type of data for update unsuported Type');
          return;
        }
      });
    });

    return () => {
      map.remove(); // Bileşen unmount edildiğinde haritayı temizle
    };
  }

  // ######################################## EDIT METHODS ########################################
  //#region
  function UpdatePath(layer: CustomLayer) {
    let path = pathListRef.current!.find((p) => p.properties.id == layer.customProperties!.id);
    if (path == null) {
      alert('Line to update not founded');
      return;
    }

    if (!(layer instanceof L.Polyline)) {
      alert('Layer is not a polyline!');
      return;
    }

    const latlngs = layer.getLatLngs();
    if (Array.isArray(latlngs)) {
      const newCoordinates: geojson.Position[] = [];
      (latlngs as L.LatLng[]).forEach((item: L.LatLng) => newCoordinates.push([item.lng, item.lat]));
      dispatch(setPathCoordinates({ pathId: path.properties.id!, coordinates: newCoordinates }));
    } else {
      alert('Informatinons could not be updated');
    }
  }

  function UpdateAdvancedPoint(layer: CustomLayer) {
    let advancedPoint = advancedPointsRef.current!.find((p) => p.properties.id == layer.customProperties!.id);
    if (advancedPoint == null) {
      alert('Advanced Point could not found for update');
      return;
    }

    if (!(layer instanceof L.Marker)) {
      alert('Layer is not a marker!');
      return;
    }

    let latlng = layer.getLatLng();
    dispatch(setAdvancedPointCoordinates({ id: advancedPoint.properties.id, coordinates: [latlng.lng, latlng.lat] }));
  }

  function UpdateEntrancePoint(layer: CustomLayer) {
    const entrancePoint = entrancePointsRef.current!.find((p) => p.properties.id == layer.customProperties!.id);
    if (entrancePoint == null) {
      alert('Entrance point could not founded for update');
      return;
    }

    const polygon = polygonListRef.current!.find((p) => p.properties.id == entrancePoint.properties.polygonId);
    if (polygon == null) {
      alert('Polygon could not founded for update entrance point');
      return;
    }

    if (!(layer instanceof L.Marker)) {
      alert('Layer is not a marker!');
      return;
    }

    const latlng = layer.getLatLng();
    if (latlng == null) {
      alert('Informatinons could not be updated unsuported Type');
      return;
    }

    dispatch(setEntrancePointCordsOfPolygon({ id: entrancePoint.properties.polygonId!, coordinates: [latlng.lng, latlng.lat] }));
    dispatch(setEntrancePointCoordinates({ id: entrancePoint.properties.id, coordinates: [latlng.lng, latlng.lat] }));
  }

  function UpdatePolygon(layer: CustomLayer) {
    if (!(layer instanceof L.Polygon)) {
      alert('Layer is not a polygon!');
      return;
    }
    const latlngs = layer.getLatLngs();
    if (Array.isArray(latlngs) && Array.isArray(latlngs[0])) {
      const newCoordinates: geojson.Position[][] = [[]];
      (latlngs[0] as L.LatLng[]).forEach((item) => {
        newCoordinates[0].push([item.lng, item.lat]);
      });
      dispatch(setPolygonCoordinates({ polygonId: (layer as CustomLayer).customProperties!.id, coordinates: newCoordinates }));
    } else {
      alert('Informatinons could not be updated unsuported Type');
    }
  }
  //#endregion
  // ######################################## EDIT METHODS ########################################

  // ######################################## CREATE METHODS ########################################
  //#region
  function CreatePath(geoJson: LineStringGeoJson, layer: CustomLayer, _id: string) {
    drawnItemsRef.current!.addLayer(layer);
    (geoJson as LineStringGeoJson).properties = {
      layerId: (layer as any)._leaflet_id,
      id: _id,
      floor: currentFloorRef.current!.index,
      name: 'Yol',
      popupContent: `Yol Bilgisi, Kat:${currentFloorRef.current!.index} ID:${_id}`,
    };

    dispatch(addPath(geoJson as LineStringGeoJson));
  }

  function CreatePolygon(geoJson: PolygonGeoJson, layer: CustomLayer, _id: string) {
    drawnItemsRef.current!.addLayer(layer);
    geoJson.properties = {
      layerId: (layer as any)._leaflet_id,
      id: _id,
      floor: currentFloorRef.current!.index,
      name: 'Bina',
      popupContent: `Bina Bilgisi, Kat:${currentFloorRef.current!.index} ID:${_id}`,
    };
    dispatch(addPolygon(geoJson as PolygonGeoJson));
    dispatch(setEntranceAdded(false));

    setPolygonId(_id);
    setShowPolyEdit(true);
  }

  function CreateEntrancePoint(geoJson: EntrancePointGeoJson, layer: CustomLayer, _id: string) {
    drawnItemsRef.current!.addLayer(layer);
    var lastPolygon = polygonListRef.current![polygonListRef.current!.length - 1];
    geoJson.properties = {
      layerId: (layer as any)._leaflet_id,
      id: _id,
      floor: currentFloorRef.current!.index,
      name: 'Bina Girisi',
      isEntrance: true,
      polygonId: lastPolygon.properties.id,
    };
    dispatch(setEntrancePoinOfPolygon(geoJson as EntrancePointGeoJson));
    dispatch(addEntrancePoint(geoJson as EntrancePointGeoJson));
    dispatch(setEntranceAdded(true));
  }

  function CreateAdvancedPoint(geoJson: AdvancedPointGeoJson, layer: CustomLayer, _id: string) {
    drawnItemsRef.current!.addLayer(layer);
    geoJson.properties = {
      layerId: (layer as any)._leaflet_id,
      id: _id,
      floor: 404, //currentFloorRef.current!.index,
      name: 'Gelişmiş Nokta',
      popupContent: `Gelişmiş Nokta Bilgisi, Kat:${currentFloorRef.current!.index} ID:${_id}`,
    };
    dispatch(addAdvancedPoint(geoJson as AdvancedPointGeoJson));

    setAdvPointId(_id);
    setShowAdvPointEdit(true);
  }
  //#endregion
  // ######################################## CREATE METHODS ########################################

  return (
    <>
      <div id="map" style={{ width: '100%', height: '90vh' }}></div>

      <ModalPolygonInfo isShowing={showPolyEdit} showModal={setShowPolyEdit} polygonId={polygonId} />
      <ModalAdvencedPointInfo isShowing={showAdvPointEdit} showModal={setShowAdvPointEdit} advancedPointId={advPointId} />
    </>
  );
}

export default Map;
