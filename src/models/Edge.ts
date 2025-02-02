export default class Edge {
    source: string;
    sourceCoordinate: [number, number];
    target: string;
    targetCoordinate: [number, number];
    weight: number;

    constructor(source: string, sourceCoordinate: [number, number], target: string, targetCoordinate: [number, number], weight: number) {
        this.source = source;
        this.sourceCoordinate = sourceCoordinate;
        this.target = target;
        this.targetCoordinate = targetCoordinate;
        this.weight = weight;
    }
}
