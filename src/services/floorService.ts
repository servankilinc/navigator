import { Graph as gGraph } from 'graphlib';
import { autoInjectable, container } from 'tsyringe';
import e7 from '../../utils/idGenerator';
import UISynchronizerService from './UISynchronizerUISynchronizerService';
import { appStates, drawnItems, floorList, graphList, paths, polygons } from '../app';
import PathService from './pathService';
import PolygonService from './polygonService';
import CustomLayer from '../../models/Features/CustomLayer';
import Floor from '../../models/Floor';
import Graph from '../../models/Graph';

interface IFloorService {
  AddNewFloor(count: number): void;
  SwipeFloor(floorIndex: number): void;
}

@autoInjectable()
export default class FloorService implements IFloorService {
  private pathService: PathService;
  private polygonService: PolygonService;
  private uiSynchronizerService: UISynchronizerService;

  constructor() {
    this.pathService = container.resolve(PathService);
    this.polygonService = container.resolve(PolygonService);
    this.uiSynchronizerService = container.resolve(UISynchronizerService);
  }

  AddNewFloor(count: number): void {
    if (count == 0) {
      let floorObj: Floor = {
        index: 0,
        id: e7(),
        name: 'Giriş Katı',
      };

      let graphObj = new Graph(0);

      graphList.push(graphObj);
      floorList.push(floorObj);
      appStates.currentFloor = floorObj;
    } 
    else if (count == +1) {
      let indexArr = floorList.map((f) => f.index);
      let newIndex = Math.max(...indexArr) + 1;

      let floorObj: Floor = {
        index: newIndex,
        id: e7(),
        name: `Kat ${newIndex}`,
      };

      let graphObj = new Graph(newIndex);

      graphList.push(graphObj);
      floorList.push(floorObj);
    } else {
      let indexArr = floorList.map((f) => f.index);
      let newIndex = Math.min(...indexArr) - 1;

      let floorObj: Floor = {
        index: newIndex,
        id: e7(),
        name: `Kat ${newIndex}`,
      };

      let graphObj = new Graph(newIndex);

      graphList.push(graphObj);
      floorList.push(floorObj);
    }

    this.uiSynchronizerService.floor();
  }

  SwipeFloor(floorIndex: number): void {
    const nextFloor = floorList.find((f) => f.index == floorIndex);
    if (nextFloor == null) {
      alert('Next floor could not found for swipe processing');
      return;
    }
    appStates.currentFloor = nextFloor;
    polygons.map((p) => {
      if (p.properties.floor == nextFloor.index) {
        this.polygonService.AddPolygonToMap(p.properties.id);
      }
    });
    paths.map((p) => {
      if (p.properties.floor == nextFloor.index) {
        this.pathService.AddPathToMap(p.properties.id);
      }
    });

    drawnItems.eachLayer(function (layer) {
      if ((layer as CustomLayer).customProperties !== undefined) {
        if ((layer as CustomLayer).customProperties?.floor != nextFloor.index) {
          drawnItems.removeLayer(layer);
        }
      } else {
        alert('Layer is not a custom layer for removing layer on swipe floor');
      }
    });

    this.uiSynchronizerService.floor();
    this.uiSynchronizerService.path();
    this.uiSynchronizerService.polygon();
  }
}
