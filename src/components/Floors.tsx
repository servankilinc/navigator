import { Button, ListGroup, Stack } from 'react-bootstrap';
import { FaCirclePlus, FaTrash } from 'react-icons/fa6';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { addFloor, removeFloor } from '../redux/reducers/storageSlice';
import { setCurrentFloor } from '../redux/reducers/appSlice';
import { ShowPolygon } from '../services/polygonService';
import { ShowEntrancePoint } from '../services/entrancePointService';
import { ShowAdvancedPoint } from '../services/advancedPointService';
import { ShowPath } from '../services/pathService';
import CustomLayer from '../models/Features/CustomLayer';
import Floor from '../models/Floor';
import e7 from '../scripts/idGenerator';
import { ShowRoute } from '../services/navigationService';
import { ShowThreeDModel } from '../services/threeDModelService';

function Floors() {
  const drawnItems = useAppSelector((state) => state.mapReducer.drawnItems);
  const drawnItemsRoute = useAppSelector((state) => state.mapReducer.drawnItemsRoute);

  const currentFloor = useAppSelector((state) => state.appReducer.currentFloor);

  const floorList = useAppSelector((state) => state.storageReducer.floorList);
  const polygonList = useAppSelector((state) => state.storageReducer.polygons);
  const pathList = useAppSelector((state) => state.storageReducer.paths);
  const entrancePointList = useAppSelector((state) => state.storageReducer.entrancePoints);
  const advancedPointList = useAppSelector((state) => state.storageReducer.advancedPoints);
  const routeList = useAppSelector((state) => state.storageReducer.routeList);
  const threeDModelList = useAppSelector((state) => state.storageReducer.threeDModels);
  
  const dispath = useAppDispatch();

  function AddNewFloor(count: number): void {
    if (count == 1) {
      const indexArr = floorList.map((f) => f.index);
      const newIndex = Math.max(...indexArr) + 1;
      const id = e7();
      dispath(addFloor(new Floor(newIndex, id, `Kat ${newIndex}`)));
    }
    else {
      const indexArr = floorList.map((f) => f.index);
      const newIndex = Math.min(...indexArr) - 1;
      const id = e7();
      dispath(addFloor(new Floor(newIndex, id, `Kat ${newIndex}`)));
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

    drawnItemsRoute!.eachLayer(function (layer) {
      drawnItemsRoute!.removeLayer(layer);
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
      
    threeDModelList
      .filter((f) => f.properties.floor == nextFloor.index)
      .map((path) => {
        ShowThreeDModel(path, drawnItems!);
      });

    routeList
      .filter((f) => f.floor == nextFloor.index)
      .map((route) => {
        ShowRoute(route.path, drawnItemsRoute!);
      });
  }

  function HandleRemoveFloor(floorIndex: number): void{
    if(floorList.length <= 1) return;
    dispath(removeFloor({floorIndex: floorIndex}));
    if(floorIndex == currentFloor?.index){
      const nextFirstFloor = floorList.find(f => f.index != floorIndex)?.index;
      SwipeFloor(nextFirstFloor!);
    }
  }
  function ButtonRemove({floorIndex}: {floorIndex: number}): React.JSX.Element {
    const indexArr = floorList.map((f) => f.index);
    const minIndex = Math.max(...indexArr);
    const maxIndex = Math.min(...indexArr);
    if(floorIndex == minIndex || floorIndex == maxIndex){
      return(<Button onClick={() => HandleRemoveFloor(floorIndex)} variant="danger" size="sm" className='py-0 px-1'><FaTrash size={12} /></Button>)
    }
    return(<></>);
  }

  return (
    <ListGroup className="shadow" style={{maxHeight: '400px', overflow: 'auto'}}>
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
                <Stack direction='horizontal' gap={3}>
                  <span className='me-auto'>{floor.name}</span>
                  <ButtonRemove floorIndex={floor.index}/>
                </Stack>
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
