import Edge from './Edge';
import Graph from './Graph';
import Node from './Node';

export default class GraphBaseModel {
  floor: number;
  edges: Edge[];
  nodes: Node[];

  constructor(floor: number = 0) {
    this.floor = floor;
    this.edges = [];
    this.nodes = [];
  }

  mapToGraph(): Graph {
    let _graph = new Graph(this.floor);
    _graph.nodes = this.nodes;
    _graph.edges = this.edges;

    this.edges.forEach((edge) => {
      _graph.graphGraphLib.setNode(edge.source);
      _graph.graphGraphLib.setNode(edge.target);
      _graph.graphGraphLib.setEdge(edge.source, edge.target, edge.weight);
    });
    return _graph;
  }
}
