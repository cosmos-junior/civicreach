declare module 'leaflet-heatmap' {
  import * as L from 'leaflet';

  namespace HeatmapModule {
    interface HeatmapLatLngTuple extends Array<number> {
      0: number; // latitude
      1: number; // longitude
      2?: number; // intensity (optional)
    }

    interface HeatmapOptions extends L.LayerOptions {
      radius?: number;
      blur?: number;
      maxZoom?: number;
      minOpacity?: number;
      gradient?: {
        [key: number]: string;
      };
    }

    class HeatLayer extends L.Layer {
      constructor(data: HeatmapLatLngTuple[], options?: HeatmapOptions);
      setData(data: HeatmapLatLngTuple[]): this;
      addData(data: HeatmapLatLngTuple[]): this;
    }
  }

  function HeatmapLayer(data?: HeatmapModule.HeatmapLatLngTuple[], options?: HeatmapModule.HeatmapOptions): HeatmapModule.HeatLayer;

  export = HeatmapLayer;
}

declare namespace L {
  function heatLayer(data?: any[], options?: any): any;
}
