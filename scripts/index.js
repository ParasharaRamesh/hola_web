const secret = require("./config");
const $ = require("jquery");

// TODO: Uncomment for map related features
/*const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
const MapboxDirections = require('@mapbox/mapbox-gl-directions');
const customDirectionsStyle = require("./directions_style").customDirectionsStyle;
mapboxgl.accessToken = secret.accessToken;*/

let holaMap = {
    map: null,
    userCoordinates: null,
    geolocate: null,
    geocoder: null,
    directions: null,
};

navigator.geolocation.getCurrentPosition(function (position) {
    holaMap.userCoordinates = [position.coords.longitude, position.coords.latitude];
    // noinspection JSUnresolvedFunction
    // TODO: Uncomment for map related features
    /*holaMap.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v9',
        center: holaMap.userCoordinates,
        zoom: 13
    });

    initMapElements();*/

    showRightPane();
    initFareEstimatesPane();
});

function initMapElements() {
    let map = holaMap.map;
    initGeolocateControl();
    map.addControl(holaMap.geolocate);

    initMapboxDirections();
    map.addControl(holaMap.directions, 'top-left');

    // FIXME: Move somewhere else
    document.getElementsByClassName('mapboxgl-ctrl-top-left')[0]
        .classList.add("mapboxgl-ctrl-top-left--override-center");

    map.on('load', function () {
        doOnLoadTasks();
    });
}

function initGeolocateControl() {
    // noinspection JSUnresolvedFunction
    holaMap.geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true
    });
}

function initMapboxDirections() {
    holaMap.directions = new MapboxDirections({
        accessToken: mapboxgl.accessToken,
        styles: customDirectionsStyle,
        profile: 'mapbox/driving',
        interactive: false,
        controls: {
            instructions: false,
            profileSwitcher: false
        }
    });
}

function doOnLoadTasks() {
    holaMap.geolocate.trigger();

    markCabLocations();

    holaMap.directions.on('route', () => {
        showFareEstimatesPane();
    });
}


function markCabLocations() {
    let map = holaMap.map;
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

function showRightPane() {
    document.getElementById("map").classList.add("reduce-width");
    document.getElementById("right-pane").classList.add("show");
}

function initFareEstimatesPane() {
    let estimateCards = document.getElementsByClassName('estimates-card');
    for (let i = 0; i < estimateCards.length; i++) {
        let estimateCard = estimateCards[i];
        estimateCard.onclick = function() {
            estimateCard.getElementsByClassName("booking-spinner")[0].classList.add("is-active");
            estimateCard.classList.add("active");
            for (let j = 0; j < estimateCards.length; j++) {
                if(i !== j) {
                    estimateCards[j].classList.add("hidden");
                }
            }
            setTimeout(() => {
                $('#estimates-container').hide(100, function () {
                    $('#ride-details-container').show(100);
                });
            }, 3000);
        };
    }
}
