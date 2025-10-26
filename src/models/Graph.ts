import Edge from "./Edge";
import GraphBaseModel from "./GraphBaseModel";
import Node from "./Node"; 
import { Graph as gGraph } from "graphlib";

export default class Graph {
    floor: number;
    edges: Edge[];
    nodes: Node[];
    graphGraphLib: gGraph;

    constructor(floor: number) {
        this.floor = floor;
        this.edges = [];
        this.nodes = [];
        this.graphGraphLib = new gGraph();
    }

    addEdge(edge: Edge): void {
        this.edges.push(edge);
        this.graphGraphLib.setEdge(edge.source, edge.target, edge.weight);
    }

    addNode(node: Node): void {
        this.nodes.push(node);
        this.graphGraphLib.setNode(node.id.toString());
    }

    toBaseModel(): GraphBaseModel{
        let _baseModel = new GraphBaseModel(this.floor);
        _baseModel.edges = this.edges;
        _baseModel.nodes = this.nodes;
        return _baseModel;
    }
}