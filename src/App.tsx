import React, { useEffect } from 'react';
import { Col, Row, Stack } from 'react-bootstrap';
import Map from './components/Map';
import Floors from './components/Floors';
import Polygons from './components/Polygons';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { setCurrentFloor } from './redux/reducers/appSlice';
import { addFloor, addGraph } from './redux/reducers/storageSlice';
import './App.css';
import Floor from './models/Floor';
import e7 from './scripts/idGenerator';
import Graph from './models/Graph';
import Paths from './components/Paths';
import AdvancedPoints from './components/AdvancedPoints';
import NavigationController from './components/NavigationController';

function App() : React.JSX.Element {
  const currentFloor = useAppSelector((state) => state.appReducer.currentFloor);

  const dispath = useAppDispatch();

  useEffect(() => {
    var id = e7();
    let floorObj = new Floor(0, id, 'Giriş Katı');
    let graphObj = new Graph(0);

    dispath(addGraph(graphObj));
    dispath(addFloor(floorObj));
    dispath(setCurrentFloor(floorObj));
  }, []);

  return (
    // <Container>
      <Row>
        <Col lg={2} md={3} xs={4}>
          <Stack gap={4}>
            <Floors />
            <Polygons />
            <Paths />
          </Stack>
        </Col>
        <Col lg={8} md={6} xs={4}>
          {
            currentFloor != null &&
            <Map />
          }
        </Col>
        <Col lg={2} md={3} xs={4}>
          <Stack gap={4}>
            <AdvancedPoints />
            <NavigationController />
          </Stack>
        </Col>
      </Row>
    // </Container>
  );
}

export default App;
