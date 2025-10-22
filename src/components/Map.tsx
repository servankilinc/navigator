import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import * as geojson from 'geojson';
import 'leaflet-draw';
import e7 from '../scripts/idGenerator';
import CustomLayer from '../models/Features/CustomLayer';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import EntrancePointGeoJson from '../models/Features/EntrancePointGeoJson';
import AdvancedPointGeoJson from '../models/Features/AdvancedPointGeoJson';
import PolygonGeoJson from '../models/Features/PolygonGeoJson';
import LineStringGeoJson from '../models/Features/LineStringGeoJson';
import { setDrawnItems, setDrawnItemsRoute, setMap } from '../redux/reducers/mapSlice';
import Floor from '../models/Floor';
import ModalPolygonInfo from './ModalPolygonInfo';
import ModalAdvencedPointInfo from './ModalAdvencedPointInfo';
import { CreateAdvancedPoint, ShowAdvancedPoint, UpdateAdvancedPoint } from '../services/advancedPointService';
import { CreateEntrancePoint, ShowEntrancePoint, UpdateEntrancePoint } from '../services/entrancePointService';
import { CreatePolygon, ShowPolygon, UpdatePolygon } from '../services/polygonService';
import { CreatePath, ShowPath, UpdatePath } from '../services/pathService';
import { showAlertError } from '../redux/reducers/alertSlice';

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

  useEffect(() => { polygonListRef.current = polygonList; }, [polygonList]);
  useEffect(() => { isEntrancePointAddedRef.current = isEntrancePointAdded; }, [isEntrancePointAdded]);
  useEffect(() => { currentFloorRef.current = currentFloor; }, [currentFloor]);

  useEffect(() => {
    MapInitilaze();

    polygonList.filter((f) => f.properties.floor == 0).map((polygon) => {
      ShowPolygon(polygon, drawnItemsRef.current!);
    });

    entrancePoints.filter((f) => f.properties.floor == 0).map((entrancePoint) => {
      ShowEntrancePoint(entrancePoint, drawnItemsRef.current!);
    });

    advancedPoints.filter((f) => f.properties.floor == 0).map((advancedPoint) => {
      ShowAdvancedPoint(advancedPoint, drawnItemsRef.current!);
    });

    pathList.filter((f) => f.properties.floor == 0).map((path) => {
      ShowPath(path, drawnItemsRef.current!);
    });
  }, []);

  function MapInitilaze() {
    const map = L.map('map', {
      minZoom: 10,
      maxZoom: 25,
    }).setView([37.944467, 32.561392], 17);
    
    dispatch(setMap(map));
    //https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; GORA YAZILIM',
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
        rectangle: false,
        circle: false,
      },
    });

    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED,  (event: L.LeafletEvent): void => {
      try {
        CreateHandler(event);
      }
      catch (error) {
        dispatch(showAlertError({ message: (error as Error).message }));
      }
    });

    map.on(L.Draw.Event.EDITED, (event: L.LeafletEvent): void => {
      try {
        EditHandler(event);
      }
      catch (error) {
        dispatch(showAlertError({ message: (error as Error).message }));
      }
    });

    return () => {
      map.remove(); // Bileşen unmount edildiğinde haritayı temizle
    };
  }

  
  const CreateHandler = (event: L.LeafletEvent): void => {
    const createEvent = event as L.DrawEvents.Created;
    const layer = createEvent.layer as CustomLayer;
    const layerType = createEvent.layerType;
    if (layer.toGeoJSON == null) throw new Error('Layer Type Support');

    const _id = e7();

    let geoJson: geojson.Feature<geojson.Geometry>;
    geoJson = layer.toGeoJSON();

    layer.customProperties = {
      id: _id,
      floor: currentFloorRef.current!.index,
      typeOfData: layerType,
    };

    if (layerType == 'marker') {
      if ((polygonListRef.current != null && polygonListRef.current.length > 0 && isEntrancePointAddedRef.current == false) == false) throw new Error('Before adding a entrance point, you have to add an building point');
      CreateEntrancePoint(geoJson as EntrancePointGeoJson, layer, _id, currentFloorRef.current?.index!, drawnItemsRef.current!);
    }
    else if (layerType == 'circlemarker') {
      CreateAdvancedPoint(geoJson as AdvancedPointGeoJson, layer, _id, currentFloorRef.current?.index!, drawnItemsRef.current!);

      setAdvPointId(_id);
      setShowAdvPointEdit(true);
    }
    else if (layerType == 'polygon') {
      if (polygonListRef.current != null && polygonListRef.current.length > 0 && isEntrancePointAddedRef.current == false) throw new Error('Before adding a polygon, you have to add an entrance point');

      CreatePolygon(geoJson as PolygonGeoJson, layer, _id, currentFloorRef.current?.index!, drawnItemsRef.current!);

      setPolygonId(_id);
      setShowPolyEdit(true);
    }
    else if (layerType == 'polyline') {
      CreatePath(geoJson as LineStringGeoJson, layer, _id, currentFloorRef.current?.index!, drawnItemsRef.current!);
    }
    else {
      throw new Error('GeoJson Type Not Supported');
    }
  };

  const EditHandler = (event: L.LeafletEvent): void => {
    const editeEvent = event as L.DrawEvents.Edited;
    var layers = editeEvent.layers;

    layers.eachLayer(function (_layer) {
      const layer = _layer as CustomLayer;

      if (layer.customProperties?.typeOfData == 'polygon') {
        UpdatePolygon(layer);
      }
      else if (layer.customProperties?.typeOfData == 'polyline') {
        UpdatePath(layer, drawnItemsRef.current!);
      }
      else if (layer.customProperties?.typeOfData == 'marker') {
        UpdateEntrancePoint(layer);
      }
      else if (layer.customProperties?.typeOfData == 'circlemarker') {
        UpdateAdvancedPoint(layer);
      }
      else {
        throw new Error('Does not support this type of data for update unsuported Type');
      }
    });
  };
  
  return (
    <>
      <div id="map" style={{ width: '100%', height: '90vh' }}></div>

      <ModalPolygonInfo isShowing={showPolyEdit} showModal={setShowPolyEdit} polygonId={polygonId} />
      <ModalAdvencedPointInfo isShowing={showAdvPointEdit} showModal={setShowAdvPointEdit} advancedPointId={advPointId} />
    </>
  );
}

export default Map;
