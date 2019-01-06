// @flow

import { version } from '../../package.json'; console.log('version', version);
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoibWVtdWFsZXhhIiwiYSI6ImNqcWM1ZWVhYjFnbDc0MXFnaDZtOHdtMDQifQ.EzgH-TCFq8z7X9CSPQAjHQ';

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v10', // stylesheet location
    //style: 'mapbox://styles/memualexa/cjqc648u5fpd32roaeqrzbrda',
    center: [101, 16], // starting position [lng, lat]
    pitch: 55,
    bearing: 0, //bearing: -17.6,
    zoom: 13 // starting zoom
});

// Add geolocate control to the map.
map.addControl(new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true
}));

class NullIslandLayer {
  constructor() {
    // $FlowFixMe
    this.id = 'null-island';
    // $FlowFixMe
    this.type = 'custom';
    // $FlowFixMe
    this.renderingMode = '2d';
  }
  
  onAdd(map, gl) {
    const vertexSource = `
      uniform mat4 u_matrix;
      void main() {
        gl_Position = u_matrix * vec4(0.5, 0.5, 0.0, 1.0);
        gl_PointSize = 20.0;
    }`;

    const fragmentSource = `
      void main() {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }`;
      
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexSource);
    gl.compileShader(vertexShader);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(fragmentShader);
    // $FlowFixMe
    this.program = gl.createProgram();
    // $FlowFixMe
    gl.attachShader(this.program, vertexShader);
    // $FlowFixMe
    gl.attachShader(this.program, fragmentShader);
    // $FlowFixMe
    gl.linkProgram(this.program);
  }
  
  render(gl, matrix) {
    // $FlowFixMe
    gl.useProgram(this.program);
    // $FlowFixMe
    gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "u_matrix"), false, matrix);
    console.log(new Date(), matrix);
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}
 
// The 'building' layer in the mapbox-streets vector source contains building-height
// data from OpenStreetMap.
map.on('load', function() {
  
    // Insert the layer beneath any symbol layer.
    var layers = map.getStyle().layers;

    var labelLayerId;
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === 'symbol' && layers[i].layout['text-field']) {
            labelLayerId = layers[i].id;
            break;
        }
    }

    map.addLayer({
        'id': '3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
            'fill-extrusion-color': '#aaa',

            // use an 'interpolate' expression to add a smooth transition effect to the
            // buildings as the user zooms in
            'fill-extrusion-height': [
                "interpolate", ["linear"], ["zoom"],
                15, 0,
                15.05, ["get", "height"]
            ],
            'fill-extrusion-base': [
                "interpolate", ["linear"], ["zoom"],
                15, 0,
                15.05, ["get", "min_height"]
            ],
            'fill-extrusion-opacity': .6
        }
    }, labelLayerId);
    
    map.addLayer(new NullIslandLayer());
});
