import { Button, ListGroup } from 'react-bootstrap';
import { FaCirclePlus } from 'react-icons/fa6';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { addFloor, addGraph } from '../redux/reducers/storageSlice';
import { setCurrentFloor } from '../redux/reducers/appSlice';
import { ShowPolygon } from '../services/polygonService';
import { ShowEntrancePoint } from '../services/entrancePointService';
import { ShowAdvancedPoint } from '../services/advancedPointService';
import { ShowPath } from '../services/pathService';
import CustomLayer from '../models/Features/CustomLayer';
import Floor from '../models/Floor';
import Graph from '../models/Graph';
import e7 from '../scripts/idGenerator';

function Floors() {
  const drawnItems = useAppSelector((state) => state.mapReducer.drawnItems);

  const currentFloor = useAppSelector((state) => state.appReducer.currentFloor);

  const floorList = useAppSelector((state) => state.storageReducer.floorList);
  const polygonList = useAppSelector((state) => state.storageReducer.polygons);
  const pathList = useAppSelector((state) => state.storageReducer.paths);
  const entrancePointList = useAppSelector((state) => state.storageReducer.entrancePoints);
  const advancedPointList = useAppSelector((state) => state.storageReducer.advancedPoints);

  const dispath = useAppDispatch();

  function AddNewFloor(count: number): void {
    if (count == 1) {
      let indexArr = floorList.map((f) => f.index);
      let newIndex = Math.max(...indexArr) + 1;
      let id = e7();

      let floorObj = new Floor(newIndex, id, `Kat ${newIndex}`);
      let graphObj = new Graph(newIndex);

      dispath(addGraph(graphObj));
      dispath(addFloor(floorObj));
    } else {
      let indexArr = floorList.map((f) => f.index);
      let newIndex = Math.min(...indexArr) - 1;
      let id = e7();

      let floorObj = new Floor(newIndex, id, `Kat ${newIndex}`);
      let graphObj = new Graph(newIndex);

      dispath(addGraph(graphObj));
      dispath(addFloor(floorObj));
    }
  }

  function SwipeFloor(floorIndex: number): void {
    const nextFloor = floorList.find((f) => f.index == floorIndex)!;

    dispath(setCurrentFloor(nextFloor));

    drawnItems!.eachLayer(function (layer) {
      if ((layer as CustomLayer).customProperties?.floor != nextFloor.index) {
        drawnItems!.removeLayer(layer);
      }
    });
    
    polygonList
      .filter((f) => f.properties.floor == nextFloor.index)
      .map((polygon) => {
        ShowPolygon(polygon, drawnItems!);
      });

    entrancePointList
      .filter((f) => f.properties.floor == nextFloor.index)
      .map((entrancePoint) => {
        ShowEntrancePoint(entrancePoint, drawnItems!);
      });

    advancedPointList
      .filter((f) => f.properties.floor == nextFloor.index)
      .map((advancedPoint) => {
        ShowAdvancedPoint(advancedPoint, drawnItems!);
      });

    pathList
      .filter((f) => f.properties.floor == nextFloor.index)
      .map((path) => {
        ShowPath(path, drawnItems!);
      });

  }

  return (
    <ListGroup className="shadow">
      <ListGroup.Item className="bg-light text-primary fw-bold">Kat Listesi</ListGroup.Item>
      <ListGroup.Item className="p-0">
        <Button variant="light" onClick={() => AddNewFloor(1)}>
          <FaCirclePlus size={14} color="gray" />
        </Button>
      </ListGroup.Item>
      <ListGroup.Item className="p-0 border-0">
        {floorList != null &&
          drawnItems != null &&
          floorList.map((floor) => {
            const active = currentFloor != null && floor.id == currentFloor.id;
            return (
              <ListGroup.Item key={floor.id} onClick={() => SwipeFloor(floor.index)} className={`fw-light text-start`} active={active}>
                {floor.name}
              </ListGroup.Item>
            );
          })}
      </ListGroup.Item>
      <ListGroup.Item className="p-0">
        <Button variant="light" onClick={() => AddNewFloor(-1)}>
          <FaCirclePlus size={14} color="gray" />
        </Button>
      </ListGroup.Item>
    </ListGroup>
  );
}

export default Floors;
