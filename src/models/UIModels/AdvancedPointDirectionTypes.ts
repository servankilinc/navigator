interface direction{
  id: string;
  name: string;
  icon: string;
}

export enum AdvancedPointDirectionTypesEnums {
  up = '1',
  down = '2',
  twoWay = '3',
}

export default class AdvancedPointDirectionTypes
{
  up: direction = {id: AdvancedPointDirectionTypesEnums.up, name: "up", icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M318 177.5c3.8-8.8 2-19-4.6-26l-136-144C172.9 2.7 166.6 0 160 0s-12.9 2.7-17.4 7.5l-136 144c-6.6 7-8.4 17.2-4.6 26S14.4 192 24 192l72 0 0 288c0 17.7 14.3 32 32 32l64 0c17.7 0 32-14.3 32-32l0-288 72 0c9.6 0 18.2-5.7 22-14.5z"/></svg>`};
  down: direction = { id: AdvancedPointDirectionTypesEnums.down, name: "down", icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 512"><path d="M145.6 7.7C141 2.8 134.7 0 128 0s-13 2.8-17.6 7.7l-104 112c-6.5 7-8.2 17.2-4.4 25.9S14.5 160 24 160l56 0 0 192-56 0c-9.5 0-18.2 5.7-22 14.4s-2.1 18.9 4.4 25.9l104 112c4.5 4.9 10.9 7.7 17.6 7.7s13-2.8 17.6-7.7l104-112c6.5-7 8.2-17.2 4.4-25.9s-12.5-14.4-22-14.4l-56 0 0-192 56 0c9.5 0 18.2-5.7 22-14.4s2.1-18.9-4.4-25.9l-104-112z"/></svg>` };
  twoWay: direction = { id: AdvancedPointDirectionTypesEnums.twoWay, name: "toway", icon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M2 334.5c-3.8 8.8-2 19 4.6 26l136 144c4.5 4.8 10.8 7.5 17.4 7.5s12.9-2.7 17.4-7.5l136-144c6.6-7 8.4-17.2 4.6-26s-12.5-14.5-22-14.5l-72 0 0-288c0-17.7-14.3-32-32-32L128 0C110.3 0 96 14.3 96 32l0 288-72 0c-9.6 0-18.2 5.7-22 14.5z"/></svg>` }
}