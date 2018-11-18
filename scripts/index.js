const secret = require("./config");
const $ = require("jquery");
const UI = require("./ui").UI;
let ui = new UI();

// TODO: Uncomment for map related features
const mapboxgl = require('mapbox-gl/dist/mapbox-gl.js');
const MapboxDirections = require('@mapbox/mapbox-gl-directions');
const customDirectionsStyle = require("./directions_style").customDirectionsStyle;
mapboxgl.accessToken = secret.accessToken;

let holaMap = {
    map: null,
    userCoordinates: null,
    destinationCoordinates: null,
    geolocate: null,
    geocoder: null,
    directions: null,
    route: null,
};

checkLogIn();


function checkLogIn() {
    initMap();
    if(window.localStorage.getItem('key')) {
        // Logged in
        $('#map').addClass('show');
        initLogout();
        $('#drawer-title').text(window.localStorage.getItem('username'));
    }
    else {
        console.log("Not logged in");
        $('#login').addClass('show');
        initLogin();
    }
}


function initLogin() {
    document.getElementById('button-login').onclick = function() { ui.login(); };
}


function initLogout() {
    document.getElementById('nav-logout').onclick = function() { ui.logout(); };
}

function initMap() {
    // noinspection JSUnresolvedFunction
    navigator.geolocation.getCurrentPosition(function (position) {
        holaMap.userCoordinates = [position.coords.longitude, position.coords.latitude];

        holaMap.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/light-v9',
            center: holaMap.userCoordinates,
            zoom: 13
        });

        initMapElements();

        initFareEstimatesPane();
    });
}


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

    holaMap.geolocate.on('geolocate', function (position) {
        console.log("ongeolocate", position);
        holaMap.userCoordinates = [position.coords.longitude, position.coords.latitude];
        holaMap.directions.setOrigin(holaMap.userCoordinates);
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
    ui.map = holaMap.map;
    holaMap.geolocate.trigger();

    ui.markCarsInLocation(holaMap.userCoordinates);

    holaMap.directions.on('route', function(response) {
        console.log("onroute", response);
        if(!holaMap.route) {
            let destinationObj = holaMap.directions.getDestination();
            holaMap.destinationCoordinates = destinationObj.geometry.coordinates;
            console.log("destinationCoords", holaMap.destinationCoordinates);
            ui.updateFareEstimates(holaMap.userCoordinates, holaMap.destinationCoordinates);
            showRightPane();
            holaMap.route = response;
            ui.route = holaMap.route;
        }
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
            ui.map = holaMap.map;
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
                let fareAmt = estimateCard.getElementsByClassName("car-type-fare-amount")[0].textContent;
                console.log(i + 1, fareAmt, holaMap.userCoordinates, holaMap.destinationCoordinates);
                ui.bookRide(i + 1, fareAmt, holaMap.userCoordinates, holaMap.destinationCoordinates);
            }, 3000);
        };
    }
}
