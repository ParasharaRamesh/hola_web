const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
const MapboxDraw = require('@mapbox/mapbox-gl-draw');
const MapboxGeocoder = require('@mapbox/mapbox-gl-geocoder');
mapboxgl.accessToken = 'pk.eyJ1IjoibXJhaHVsMTYiLCJhIjoiY2puM2Y2cmZlMDE4MjNwb3g1eTJlZDYwdyJ9.Ylg3AQgXmnTxXwldSaVn9w';
let map;
let userCoordinates;
navigator.geolocation.getCurrentPosition(function (position) {
    userCoordinates = [position.coords.longitude, position.coords.latitude];
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v9',
        center: userCoordinates,
        zoom: 22
    });

    setMapElements(map);
});


function setupMapboxDraw() {
    return new MapboxDraw({
        displayControlsDefault: false,
        controls: {
            line_string: true,
            trash: true
        },
        styles: [
            // ACTIVE (being drawn)
            // line stroke
            {
                "id": "gl-draw-line",
                "type": "line",
                "filter": ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
                "layout": {
                    "line-cap": "round",
                    "line-join": "round"
                },
                "paint": {
                    "line-color": "#3b9ddd",
                    "line-dasharray": [0.2, 2],
                    "line-width": 4,
                    "line-opacity": 0.7
                }
            },
            // vertex point halos
            {
                "id": "gl-draw-polygon-and-line-vertex-halo-active",
                "type": "circle",
                "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
                "paint": {
                    "circle-radius": 10,
                    "circle-color": "#FFF"
                }
            },
            // vertex points
            {
                "id": "gl-draw-polygon-and-line-vertex-active",
                "type": "circle",
                "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
                "paint": {
                    "circle-radius": 6,
                    "circle-color": "#3b9ddd",
                }
            },
        ]
    });
}

function updateRoute(draw) {
    removeRoute(); // overwrite any existing layers
    let data = draw.getAll();
    let lastFeature = data.features.length - 1;
    let coords = data.features[lastFeature].geometry.coordinates;
    let newCoords = coords.join(';');
    getMatch(newCoords);
}

function getMatch(source, dest) {
    let routeCoords = source.join(',') + ';' + dest.join(',');
    // https://www.mapbox.com/api-documentation/#directions
    let url = 'https://api.mapbox.com/directions/v5/mapbox/driving/' + routeCoords + '?geometries=geojson&steps=true&&access_token=' + mapboxgl.accessToken;
    let req = new XMLHttpRequest();
    req.responseType = 'json';
    req.open('GET', url, true);
    req.onload  = function() {
        let jsonResponse = req.response;
        let distance = jsonResponse.routes[0].distance * 0.001; // convert to km
        let duration = jsonResponse.routes[0].duration / 60; // convert to minutes
        // add results to info box
        document.getElementById('calculated-line').innerHTML = 'Distance: ' + distance.toFixed(2) + ' km<br>Duration: ' + duration.toFixed(2) + ' minutes';
        let coords = jsonResponse.routes[0].geometry;
        // add the route to the map
        addRoute(coords);
    };
    req.send();
}

function addRoute (coords) {
    // check if the route is already loaded
    if (map.getSource('route')) {
        map.removeLayer('route');
        map.removeSource('route')
    } else{
        map.addLayer({
            "id": "route",
            "type": "line",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": {},
                    "geometry": coords
                }
            },
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": "#3f51b5",
                "line-width": 8,
                "line-opacity": 1
            },
            "maxzoom": 22
        });
    }
}

function removeRoute () {
    if (map.getSource('route')) {
        map.removeLayer('route');
        map.removeSource('route');
        document.getElementById('calculated-line').innerHTML = '';
    }
}

function setMapElements(map) {
    const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    });
    map.addControl(geolocate);

    let geocoder = setGeocoder();
    map.on('load', function () {
        doOnLoadTasks(map, geolocate, geocoder);
    });

    map.addControl(setupMapboxDraw());
}

function setGeocoder() {
    let geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken
    });

    document.getElementById('geocoder').appendChild(geocoder.onAdd(map));
    return geocoder;
}

function doOnLoadTasks(map, geolocate, geocoder) {
    geolocate.trigger();

    map.addSource('single-point', {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": []
        }
    });

    map.addLayer({
        "id": "point",
        "source": "single-point",
        "type": "circle",
        "paint": {
            "circle-radius": 10,
            "circle-color": "#3f51b5"
        }
    });

    // Listen for the `result` event from the MapboxGeocoder that is triggered when a user
    // makes a selection and add a symbol that matches the result.
    geocoder.on('result', function (ev) {
        console.log(ev.result);
        console.log(map);
        map.getSource('single-point').setData(ev.result.geometry);
        getMatch(userCoordinates, ev.result.geometry.coordinates);
        showFareEstimatesPane();
    });

    markCabLocations(map);
}


function markCabLocations(map) {
    map.loadImage("icons/car-hatchback.png", function (error, image) {
        if (error) throw error;
        map.addImage("custom-marker", image);
        /* Style layer: A style layer ties together the source and image and specifies how they are displayed on the map. */
        map.addLayer({
            id: "markers",
            type: "symbol",
            /* Source: A data source specifies the geographic coordinate where the image marker gets placed. */
            source: {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: [{
                        "type": "Feature",
                        "geometry": {"type": "Point", "coordinates": [77.542373, 12.934848]}
                    }, {
                        "type": "Feature",
                        "geometry": {"type": "Point", "coordinates": [77.534692, 12.936273]}
                    }, {
                        "type": "Feature",
                        "geometry": {"type": "Point", "coordinates": [77.542652, 12.939402]}
                    }, {
                        "type": "Feature",
                        "geometry": {"type": "Point", "coordinates": [77.541282, 12.938578]}
                    }, {
                        "type": "Feature",
                        "geometry": {"type": "Point", "coordinates": [77.538975, 12.939864]}
                    }]
                }
            },
            layout: {
                "icon-image": "custom-marker",
                // "icon-rotate": 90,
            }
        });
    });
}

function showFareEstimatesPane() {
    document.getElementById("map").classList.add("reduce-width");
    document.getElementById("geocoder").classList.add("reduce-width");
    document.getElementById("estimates-container").classList.add("show");
}
