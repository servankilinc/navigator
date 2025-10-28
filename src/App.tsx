import React, { useEffect } from 'react';
import { Button, Col, Row, Stack } from 'react-bootstrap';
import { FaFileArrowUp } from 'react-icons/fa6';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import './styles/App.css';
import { setCurrentFloor } from './redux/reducers/appSlice';
import { addFloor, setAdvancedPointList, setEntrancePointList, setFloorList, setGraphList, setPathList, setPolygonList } from './redux/reducers/storageSlice';
import e7 from './scripts/idGenerator';
import Map from './components/Map';
import Floors from './components/Floors';
import Polygons from './components/Polygons';
import AdvancedPoints from './components/AdvancedPoints';
import NavigationController from './components/NavigationController';
import AlertSuccess from './components/alerts/AlertSuccess';
import AlertError from './components/alerts/AlertError';
import ImageController from './components/ImageController';
import Floor from './models/Floor';
import Graph from './models/Graph';
import Paths from './components/Paths';
import AdvancedPointGeoJson from './models/Features/AdvancedPointGeoJson';
import EntrancePointGeoJson from './models/Features/EntrancePointGeoJson';
import PolygonGeoJson from './models/Features/PolygonGeoJson';
import LineStringGeoJson from './models/Features/LineStringGeoJson';
import { showAlertError, showAlertSuccess } from './redux/reducers/alertSlice';
import SketchModel from './models/UIModels/SketchModel';
import { FindIntersections } from './services/pathService';
import { DesignGraph } from './services/graphService';
import GraphBaseModel from './models/GraphBaseModel';

function App(): React.JSX.Element {
  const dispatch = useAppDispatch();

  const currentFloor = useAppSelector((state) => state.appReducer.currentFloor);

  const advancedPointList = useAppSelector((state) => state.storageReducer.advancedPoints);
  const entrancePointList = useAppSelector((state) => state.storageReducer.entrancePoints);
  const floorList = useAppSelector((state) => state.storageReducer.floorList);
  const graphList = useAppSelector((state) => state.storageReducer.graphList);
  const pathList = useAppSelector((state) => state.storageReducer.paths);
  const polygonList = useAppSelector((state) => state.storageReducer.polygons);

  const sketchList = useAppSelector((state) => state.mapReducer.sketchList);

  useEffect(() => {
    FetchData();
  }, []);

  async function FetchData() {
    try {
      const res_advancedPoint = await fetch(`${import.meta.env.VITE_API_URL}/api/advancedPoint`);
      const res_entrancePoint = await fetch(`${import.meta.env.VITE_API_URL}/api/entrancePoint`);
      const res_floor = await fetch(`${import.meta.env.VITE_API_URL}/api/floor`);
      const res_graph = await fetch(`${import.meta.env.VITE_API_URL}/api/graph`);
      const res_path = await fetch(`${import.meta.env.VITE_API_URL}/api/path`);
      const res_polygon = await fetch(`${import.meta.env.VITE_API_URL}/api/polygon`);

      const data_advancedPoint: AdvancedPointGeoJson[] = await res_advancedPoint.json();
      const data_entrancePoint: EntrancePointGeoJson[] = await res_entrancePoint.json();
      const data_floor: Floor[] = await res_floor.json();
      const data_graph: GraphBaseModel[] = await res_graph.json();
      const data_path: LineStringGeoJson[] = await res_path.json();
      const data_polygon: PolygonGeoJson[] = await res_polygon.json();

      if (data_floor == null || data_floor.length <= 0) {
        dispatch(showAlertSuccess({ message: 'Sunucu Tarafında Bilgi Bulunmaıyor!' }));
        SetDefaultData();
        return;
      }

      dispatch(setAdvancedPointList(data_advancedPoint));
      dispatch(setEntrancePointList(data_entrancePoint));
      dispatch(setFloorList(data_floor));
      // if(data_graph && data_graph.length > 0) dispatch(setGraphList(data_graph.map(d => d.mapToGraph())));
      if (data_graph && data_graph.length > 0) {
        const _graphList: Graph[] = [];
        data_graph.forEach(pd => {
          let _graph = new Graph(pd.floor);
          _graph.nodes = pd.nodes;
          _graph.edges = pd.edges;
      
          pd.edges.forEach((edge) => {
            _graph.graphGraphLib.setNode(edge.source);
            _graph.graphGraphLib.setNode(edge.target);
            _graph.graphGraphLib.setEdge(edge.source, edge.target, edge.weight);
          });
          _graphList.push(_graph);
        })
        dispatch(setGraphList(_graphList));
      }
      dispatch(setPathList(data_path));
      dispatch(setPolygonList(data_polygon));

      dispatch(showAlertSuccess({ message: 'Veriler başarıyal getirildi.' }));

      // ilk kattan başat
      dispatch(setCurrentFloor(data_floor.some((f) => f.index == 0) ? data_floor.find((f) => f.index == 0)! : data_floor[0]!));
    } catch (error) {
      dispatch(showAlertError({ message: 'Veriler getirilirken hata oluştu.' }));
      SetDefaultData();
    }
  }

  function SetDefaultData() {
    var id = e7();
    let floorObj = new Floor(0, id, 'Kat 0');

    dispatch(addFloor(floorObj));
    dispatch(setCurrentFloor(floorObj));
  }

  async function SendAllData() {
    try {
      FindIntersections();
      DesignGraph();

      await fetch(`${import.meta.env.VITE_API_URL}/api/advancedPoint/UpdateAll`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(advancedPointList) });
      await fetch(`${import.meta.env.VITE_API_URL}/api/entrancePoint/UpdateAll`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(entrancePointList) });
      await fetch(`${import.meta.env.VITE_API_URL}/api/floor/UpdateAll`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(floorList) });
      await fetch(`${import.meta.env.VITE_API_URL}/api/graph/UpdateAll`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(graphList.map(d => d.toBaseModel())) });
      await fetch(`${import.meta.env.VITE_API_URL}/api/path/UpdateAll`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pathList) });
      await fetch(`${import.meta.env.VITE_API_URL}/api/polygon/UpdateAll`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(polygonList) });
      if (sketchList != null) {
        let sketchCreateModels = sketchList.map((d) => new SketchModel(d));
        await fetch(`${import.meta.env.VITE_API_URL}/api/sketch/UpdateAll`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sketchCreateModels) });
      }
      dispatch(showAlertSuccess({ message: 'Veriler Başarıyla Kaydedildi.' }));
    } 
    catch (error) {
      dispatch(showAlertError({ message: 'Veriler Kaydedilirken Bir Sorun Oluştu.' }));
    }
  }

  return (
    <>
      <Row>
        <Col lg={2}>
          <Stack gap={4}>
            <Floors />
            <Polygons />
            <Paths />
          </Stack>
        </Col>
        <Col lg={8}>{currentFloor != null && <Map />}</Col>
        <Col lg={2}>
          <Stack gap={4}>
            <ImageController />
            <AdvancedPoints />
            <NavigationController />
            <Button variant="primary" className="shadow" onClick={SendAllData}>
              Bilgileri Kaydet
              <FaFileArrowUp />
            </Button>
          </Stack>
        </Col>
      </Row>
      <AlertSuccess />
      <AlertError />
    </>
  );
}

export default App;
