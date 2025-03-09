
export default class SetRotationSketchModel {
  id!: string;
  rotation!: number;
  constructor(id: string, rotation: number) {
    this.id = id;
    this.rotation = rotation%360;
  }
}
