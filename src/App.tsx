import React, { useEffect } from 'react';
import { Button, Col, Row, Stack } from 'react-bootstrap';
import { FaFileArrowUp } from 'react-icons/fa6';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import './styles/App.css';
import { setCurrentFloor } from './redux/reducers/appSlice';
import { addFloor, addGraph, setAdvancedPointList, setEntrancePointList, setFloorList, setGraphList, setPathList, setPolygonList } from './redux/reducers/storageSlice';
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
      const res_advancedPoint = await fetch('http://localhost:5000/api/advancedPoint');
      const res_entrancePoint = await fetch('http://localhost:5000/api/entrancePoint');
      const res_floor = await fetch('http://localhost:5000/api/floor');
      const res_graph = await fetch('http://localhost:5000/api/graph');
      const res_path = await fetch('http://localhost:5000/api/path');
      const res_polygon = await fetch('http://localhost:5000/api/polygon');

      const data_advancedPoint: AdvancedPointGeoJson[] = await res_advancedPoint.json();
      const data_entrancePoint: EntrancePointGeoJson[] = await res_entrancePoint.json();
      const data_floor: Floor[] = await res_floor.json();
      const data_graph: Graph[] = await res_graph.json();
      const data_path: LineStringGeoJson[] = await res_path.json();
      const data_polygon: PolygonGeoJson[] = await res_polygon.json();

      if(data_floor == null || data_floor.length <= 0){
        dispatch(showAlertSuccess({ message: 'Sunucu Tarafında Bilgi Bulunmaıyor!' }));
        SetDefaultData();
        return;
      }

      dispatch(setAdvancedPointList(data_advancedPoint));
      dispatch(setEntrancePointList(data_entrancePoint));
      dispatch(setFloorList(data_floor));
      dispatch(setGraphList(data_graph));
      dispatch(setPathList(data_path));
      dispatch(setPolygonList(data_polygon));

      dispatch(showAlertSuccess({ message: 'Veriler başarıyal getirildi.' }));

      dispatch(setCurrentFloor(data_floor.some((f) => f.index == 0) ? data_floor.find((f) => f.index == 0)! : data_floor[0]!));
    } catch (error) {
      dispatch(showAlertError({ message: 'Veriler getirilirken hata oluştu.' }));
      SetDefaultData();
    }
  }

  function SetDefaultData() {
    var id = e7();
    let floorObj = new Floor(0, id, 'Kat 0');
    let graphObj = new Graph(0);

    dispatch(addGraph(graphObj));
    dispatch(addFloor(floorObj));
    dispatch(setCurrentFloor(floorObj));
  }

  async function SendAllData() {
    try {
      await fetch('http://localhost:5000/api/advancedPoint/UpdateAll', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(advancedPointList)});
      await fetch('http://localhost:5000/api/entrancePoint/UpdateAll', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(entrancePointList)});
      await fetch('http://localhost:5000/api/floor/UpdateAll', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(floorList)});
      await fetch('http://localhost:5000/api/graph/UpdateAll', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(graphList)});
      await fetch('http://localhost:5000/api/path/UpdateAll', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(pathList)});
      await fetch('http://localhost:5000/api/polygon/UpdateAll', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(polygonList)});
      if(sketchList != null) {
        let sketchCreateModels = sketchList.map(d => new SketchModel(d));
        await fetch('http://localhost:5000/api/sketch/UpdateAll', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(sketchCreateModels)});
      }
      dispatch(showAlertSuccess({ message: 'Veriler Başarıyla Kaydedildi.' }));
    } catch (error) {
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
