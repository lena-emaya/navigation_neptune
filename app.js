mapboxgl.accessToken = 'pk.eyJ1IjoibGVuYWVtYXlhIiwiYSI6ImNpa3VhbXE5ZjAwMXB3eG00ajVyc2J6ZTIifQ.kmZ4yVcNrupl4H8EonM3aQ';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/lenaemaya/cjgxn4w4y001o2roa01rkjr3t', //hosted style id
    center: [-122.381290, 37.738768], // starting position
    zoom: 15.5,
    pitch: 25,
    bearing: 0,
    length: 0
     // starting zoom
});
var state = {
  animation: false,
  passedPoint: false,
  distance: 0,
  speed: 60, //in ms interval
  increment: 0.002,
  point: [-122.417611, 37.78],
  pitch: 70,
  bearing: 0,
  length: 0,
  zoom: 16
}
var routeLine, nextPoint, maneuverPoints;
var interval;
var animationControl = d3.select("#animationControl"),
    maneuverIndicateName = d3.select("#maneuverIndicateName"),
    maneuverIndicateArrow = d3.select("#maneuverIndicateArrow"),
    maneuverIndicateDistance = d3.select("#maneuverIndicateDistance"),
    maneuverIndicateDistanceMeasure = d3.select("#maneuverIndicateDistanceMeasure"),
    topPanel = d3.select("#topPanel");

var routeStyleSimple = {
  "id": "route",
  "after": "road-shields-black",
  "type": "line",
  "filter": ["==", "type", "route"],
  "source": "route",
  "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
  "paint": {
    "line-color": "#D659FF",
    "line-opacity": 1,
    "line-width": {
          "stops": [
            [7, 1.8],
            [8, 1.9],
            [9, 2.4],
            [10, 2.5],
            [12, 3],
            [14, 5],
            [18, 20]
          ]},
  }
};
// var routeStyleTraffic = {
//   "id": "routeTraffic",
//   "after": "road-label-small",
//   "type": "line",
//   "filter": ["==", "type", "traffic"],
//   "source": "route",
//   "layout": {
//     "line-cap": "round"
//   },
//   "paint": {
//     "line-opacity": 1,
//     "line-color": {
//       "property": "speed",
//       "type": "interval",
//       "stops": [
//         [10, "#000fff"],
//         [20, "#000fff"],
//         [30, "#000fff"],
//         [40, "#000fff"]
//       ]
//     },
//     "line-width": {
//       "stops": [
//         [7, 1.8],
//         [8, 1.9],
//         [9, 2.4],
//         [10, 3],
//         [12, 5],
//         [14, 9],
//         [18, 35]
//       ]
//     },
//   }
// };
// var routeStyleTrafficCase = {
//   "id": "routeTrafficCase",
//   "after": "road-label-small",
//   "type": "line",
//   "filter": ["==", "type", "traffic"],
//   "source": "route",
//   "layout": {
//     "line-cap": "round"
//   },
//   "paint": {
//     "line-color":  "#FFFFFF",
//     "line-opacity": 0.5,
//     "line-width": {
//       "stops": [
//         [7, 3.8],
//         [8, 3.9],
//         [9, 4.4],
//         [10, 5],
//         [12, 7],
//         [14, 11],
//         [18, 39]
//       ]
//     },
//   }
// };
var pointerStyleBg = {
  "id": "pointerBg",
  "type": "circle",
  "source": "point",
  "paint": {
    "circle-color": "#80F1F7",
    "circle-opacity": 0.35,
    "circle-radius": 22
  }
};

var pointerStyleBg2 = {
  "id": "pointerBg2",
  "type": "circle",
  "source": "point",
  "paint": {
    "circle-color": "#D659FF",
    "circle-opacity": 0.55,
    "circle-radius": 14
  }
};

var pointerStyle = {
  "id": "pointer",
  "type": "circle",
  "source": "point",
  "paint": {
    "circle-color": "#AE36EF",
    "circle-opacity": 1,
    "circle-radius": 7
  }
};
// var maneuverStyle = {
//   "id": "maneuver",
//   "type": "circle",
//   "source": "route",
//   // "layout": {
//   //   "visibility": "none"
//   // },
//   "filter": ["==", "type", "maneuver"],
//   "paint": {
//     "circle-color": "#F766FF",
//     "circle-opacity": 1,
//     "circle-radius": 9
//   }
// };


var maneuverStyle = {
    "id": "maneuver",
    "type": "symbol",
    "source": "route",
    "filter": ["==", "type", "maneuver"],
    "layout": {
      //'visibility': 'none',
        "text-size": {
            "base": 1,
            "stops": [
                [11,0],
                [12.9, 0],
                [13, 9],
                [15,12],
                [22,15]
            ]
        },
        "icon-offset": [
            62,-25
        ],
        "icon-image": "popup5",
        "icon-rotation-alignment": "viewport",
        "text-max-angle": 30,
        // "symbol-spacing": {
        //     "base": 1,
        //     "stops": [
        //         [0,100],
        //         [22,1000]
        //     ]
        // },
        "text-font": [
            "Roboto Bold",
            "Arial Unicode MS Bold"
        ],
        "symbol-placement": "point",
        "text-justify": "left",
        'text-allow-overlap': true,
        "text-padding": 5,
        "text-offset": [5,-2.25],
        "text-rotation-alignment": "viewport",
        "icon-allow-overlap": true,
        //"icon-text-fit": 'height',
        'icon-text-fit-padding': [
          5,5,5,5
        ],
        // "icon-size": {
        //     "base": 1.25,
        //     "stops": [
        //         [12, 0],
        //         [22, 0.9]
        //     ]
        // },
        "text-field": '{name}',
        "text-letter-spacing": 0
    },
    "paint": {
        "text-color": '#fff',
        "text-translate": [
            0,
            0
        ]
    }
};




toggleAnimation = () => {
  if(!state.animation) {
    interval = setInterval(moveNext, state.speed);
    state.animation = true;
    animationControl.attr("class", "stop");
    map.addLayer(maneuverStyle);
  } else {
    clearInterval(interval);
    state.animation = false;
    animationControl.attr("class", "play");
    map.removeLayer(maneuverStyle);
  }
}
moveNext = () => {
  state.distance += state.increment;
  if((state.distance-state.increment) > state.length) {
    state.distance = 0;
    resetManeuverPoints();
  }
  state.point = turf.along(routeLine, state.distance, 'kilometers');
  state.bearing = turf.bearing(state.point, turf.along(routeLine, (state.distance+state.increment), 'kilometers'));
  //      map.setPitch
  map.easeTo({
      center: state.point.geometry.coordinates,
      bearing: state.bearing,
      pitch: state.pitch,
      zoom: state.zoom
  });
  var nearest = turf.nearest(state.point, {type: "FeatureCollection", features: maneuverPoints.features.filter(f=>!f.properties.passed)});
  var maneuverDistance = turf.distance(state.point, nearest, "kilometers");
  maneuverIndicateDistance.text(formatter(maneuverDistance));
  maneuverIndicateDistanceMeasure.text(formatterM(maneuverDistance));
  maneuverIndicateName.text(nearest.properties.name);
  maneuverIndicateArrow.attr("class", nearest.properties.arrow);
  if(maneuverDistance < state.increment*2) {
    maneuverPoints.features.forEach(f=>{
      if(f.properties.id === nearest.properties.id) {
        f.properties.passed = true;
      }
    });
  }
  map.getSource("point").setData({type: "FeatureCollection", features: [state.point]});
}
resetManeuverPoints = () => {
  maneuverPoints.features.forEach((f,i)=>{
    f.properties['passed'] = false;
    f.properties['id'] = i;
  });
}
formatter = (v) => {
  var r;
  if(v>0) r = Math.floor(v*1000);
  if(v>0.1) r = Math.floor(v*100)*10;
  if(v>1) r = Math.floor(v*10)/10;
  if(v>10) r = Math.floor(v);
  return r;
}
formatterM = (v) => {
  var r;
  if(v>0) r ="m";
  if(v>1) r = "km";
  if(v>10) r = "km";
  return r;
}
map.on('click', function(e) {
     // set bbox as 5px reactangle area around clicked point
     var bbox = [[e.point.x - 5, e.point.y - 5], [e.point.x + 5, e.point.y + 5]];
     var features = map.queryRenderedFeatures(bbox, { layers: ['maneuver'] });
     console.log(features);
  });
map.on('load', ()=> {
  d3.json('https://raw.githubusercontent.com/urbica/navigation/master/data/route.geojson?' + Math.random(), json => {
//             const routeSrc = json.routes[0];
    routeLine = json.features[0];
    maneuverPoints = { type: "FeatureCollection", features: json.features.filter((f)=> f.properties.type === "maneuver") }
    resetManeuverPoints(); //reset maneuver points flag
    state.length = turf.lineDistance(routeLine, 'kilometers');
    state.point = turf.along(routeLine, state.distance, 'kilometers');
    map.addSource("route", { type: "geojson", data: "https://raw.githubusercontent.com/urbica/navigation/master/data/route.geojson" });
    map.addSource("point", { type: "geojson", data: {type: "FeatureCollection", features: [state.point]} });
    //map.addLayer(maneuverStyle);
    var style = map.getStyle();
    //console.log(style);

    style.layers.forEach(l=>{ console.log(l.id);});

    var afterId = style.layers.length;
    style.layers.forEach((l, i) => {
    //  console.log(l.id);
      if (l.id=='road-label-small') afterId=i;
       });
    console.log(afterId);
    //style.layers.splice(afterId, 0, pointerStyleBg);
    //style.layers.splice(afterId, 0,routeStyleSimple);
    //  style.layers.splice(afterId, 0, routeStyleTraffic);
    //  style.layers.splice(afterId, 0, routeStyleTrafficCase);
    //style.layers.splice(afterId, 0, maneuverStyle);
    map.setStyle(style);

    map.addLayer(routeStyleSimple,'road-shields-black');
    map.addLayer(pointerStyleBg);
    map.addLayer(pointerStyleBg2);
    map.addLayer(pointerStyle);
    //map.addLayer(maneuverStyle);
    // map.addLayer(routeStyleTraffic);
    animationControl.attr("class", "play");
    animationControl.on('click', toggleAnimation); //bind

    //map.on('click', toggleLabels);

    //starting
    //toggleLabels();

  trafficLayers.forEach(l => {
      map.setLayoutProperty(l, "visibility", labelsVisibility ? 'visible' : 'none');
      map.setPaintProperty(l, "line-opacity", 0);
    });

    // var lrs = map.getStyle();
    // lrs.layers.forEach(l=>{ console.log(l.id);})

 });
});

var labelLayers = ['road-label-large', 'road-label-medium', 'road-label-small', 'housenum-label','rail-label-major','rail-label-minor'];
var trafficLayers = ['traffic-main','traffic-link', 'traffic-primary', 'traffic-small'];

var labelsVisibility = false;



toggleLabels = () => {

  topPanel.style("top", labelsVisibility ? "0px" : "-100px");

  labelLayers.forEach(l => {
    map.setLayoutProperty(l, "visibility", labelsVisibility ? 'visible' : 'none');
  });

  trafficLayers.forEach(l => {
    map.setPaintProperty(l, "line-opacity", labelsVisibility ? 1 : 0);
  });


  labelsVisibility = !labelsVisibility;

}

d3.select("#closeBtn").on('click', toggleLabels);
topPanel.on('click', toggleLabels);

//request for example
//https://api.mapbox.com/directions/v5/mapbox/driving-traffic/-122.381405%2C37.738277%3B-122.45771097983936%2C37.78540378184813.json?geometries=polyline&alternatives=true&steps=true&overview=full&access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA
