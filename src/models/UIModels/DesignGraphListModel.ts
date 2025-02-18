import Edge from "../Edge";
import Node from "../Node";
import { Graph as gGraph } from "graphlib";

export interface DesignGraphModel {
  floor: number;
  edges: Edge[];
  nodes: Node[];
  gGraph: gGraph;
  
}
export default interface DesignGraphListModel {
  updateModels: DesignGraphModel[];
}