const $ = require("jquery");
const config = require("./config");
const utils = require("./utils");
const customMarkerStyle = require("./marker_style").getCustomMarkerStyle();
const simulate = require('guidance-sim').simulate;
const simulatorConfig = require("./simulator_config").getSimulatorConfig();
const haversine = require('haversine');


function addCarsLayer(locations) {
    customMarkerStyle.id = "cars-in-location-marker";
    let features = customMarkerStyle.source.data.features;
    let feature = features[0];
    features.pop();
    locations.forEach(function (location) {
        feature = JSON.parse(JSON.stringify(feature));
        feature.geometry.coordinates = location;
        features.push(feature);
    });

    let uiObj = this;
    uiObj.map.loadImage("icons/car-hatchback.png", function (error, image) {
        if (error) throw error;
        uiObj.map.addImage("car-marker", image);
        customMarkerStyle.layout["icon-image"] = "car-marker";
        uiObj.map.addLayer(customMarkerStyle);
    });
}


function removeCarsInLocation() {
    this.map.removeLayer("cars-in-location-marker");
}


function fetchRoute(sourceLoc, destLoc) {
    let url = "https://api.mapbox.com/directions/v5/mapbox/driving/";
    let data = {
        "geometries": "geojson",
        "steps": true,
        "access_token": config.accessToken
    };
    url += sourceLoc.join() + ";" + destLoc.join();
    let obj = this;
    $.when(utils.sendRequest("GET", url, data, 'application/x-www-form-urlencoded', false))
        .done(function (response) {
            obj.route = response;
        });
}


function setCarDetails(carDetailsResponse) {
    let {car, carDriver} = carDetailsResponse;
    $('#ride-car-type').text(["Hatch", "Sedan", "Minivan"][car.carType - 1]);
    $('#ride-car-model-name').text(car.carModel);
    $('#ride-car-model-license').text(car.carLicense);
    $('#ride-driver-name').text(carDriver.name);
    let $rideRating = $('#ride-driver-rating');
    let ratingContent = $rideRating.html();
    $rideRating.html(carDriver.rating.toFixed(1) + ratingContent);

    $.each($('.review'), function (i, elem) {
        $(elem).text(carDriver.feedbacks[i]);
    });

    document.getElementById("button-call").onclick = function () {
        window.location.href = 'tel:' + carDriver.phone.toString();
    };
}

function startRide() {
    let obj = this;
    simulatorConfig.route = obj.route;
    // simulatorConfig.route = {"routes":[{"geometry":{"coordinates":[[77.541048,12.937529],[77.539914,12.937787],[77.539778,12.93655],[77.538974,12.933815],[77.53444,12.936352],[77.534163,12.936686],[77.533823,12.937666],[77.531522,12.941401],[77.529986,12.944155],[77.529327,12.944778],[77.527976,12.945327],[77.528216,12.945547],[77.529073,12.946026],[77.530462,12.946605]],"type":"LineString"},"legs":[{"summary":"Hoskerehalli Road, Outer Ring Road","weight":729.5,"duration":419.1,"steps":[{"intersections":[{"out":0,"entry":[true],"bearings":[285],"location":[77.541048,12.937529]},{"out":2,"in":0,"entry":[false,true,true],"bearings":[105,195,285],"location":[77.54087,12.937577]},{"out":2,"in":0,"entry":[false,true,true],"bearings":[105,195,285],"location":[77.540638,12.937638]}],"driving_side":"left","geometry":{"coordinates":[[77.541048,12.937529],[77.54087,12.937577],[77.540638,12.937638],[77.540058,12.937789],[77.539914,12.937787]],"type":"LineString"},"mode":"driving","maneuver":{"bearing_after":285,"bearing_before":0,"location":[77.541048,12.937529],"type":"depart","instruction":"Head west on Venkatesh Murthy Road"},"weight":66.7,"duration":33.2,"name":"Venkatesh Murthy Road","distance":126.8},{"intersections":[{"out":1,"in":0,"entry":[false,true,false],"bearings":[90,180,300],"location":[77.539914,12.937787]},{"out":1,"in":0,"entry":[false,true,true],"bearings":[0,195,285],"location":[77.539788,12.936645]},{"out":1,"in":0,"entry":[false,true,true],"bearings":[15,195,285],"location":[77.539726,12.936401]},{"out":1,"in":0,"entry":[false,true,true],"bearings":[15,195,285],"location":[77.539648,12.93618]},{"out":2,"in":0,"entry":[false,true,true],"bearings":[15,105,195],"location":[77.539197,12.934609]}],"driving_side":"left","geometry":{"coordinates":[[77.539914,12.937787],[77.539906,12.937537],[77.539855,12.937232],[77.539788,12.936645],[77.539778,12.93655],[77.539726,12.936401],[77.539648,12.93618],[77.539489,12.935733],[77.539217,12.934694],[77.539197,12.934609],[77.539037,12.933924]],"type":"LineString"},"mode":"driving","maneuver":{"bearing_after":181,"bearing_before":268,"location":[77.539914,12.937787],"modifier":"left","type":"turn","instruction":"Turn left onto Hoskerehalli Road"},"weight":86.6,"duration":62.400000000000006,"name":"Hoskerehalli Road","distance":441.7},{"intersections":[{"out":2,"in":0,"entry":[false,true,true,false],"bearings":[15,120,210,300],"location":[77.539037,12.933924]},{"out":2,"in":0,"entry":[false,false,true],"bearings":[30,120,300],"location":[77.538974,12.933815]},{"out":3,"in":1,"entry":[true,false,true,true],"bearings":[45,150,210,330],"location":[77.53339,12.938367]},{"out":2,"in":0,"entry":[false,true,true],"bearings":[150,285,330],"location":[77.533162,12.938719]},{"out":2,"in":0,"entry":[false,false,true],"bearings":[150,240,330],"location":[77.533107,12.938807]},{"out":2,"in":0,"entry":[false,true,true],"bearings":[150,315,330],"location":[77.532437,12.939897]},{"out":2,"in":0,"entry":[false,false,true],"bearings":[150,165,330],"location":[77.531522,12.941401]},{"out":2,"in":1,"entry":[true,false,true],"bearings":[45,150,330],"location":[77.530389,12.943445]}],"driving_side":"left","geometry":{"coordinates":[[77.539037,12.933924],[77.538974,12.933815],[77.538227,12.934242],[77.536817,12.935058],[77.534704,12.936162],[77.534579,12.93624],[77.53444,12.936352],[77.534322,12.936459],[77.534238,12.936568],[77.534163,12.936686],[77.534106,12.936826],[77.534057,12.936997],[77.533892,12.937523],[77.533823,12.937666],[77.533765,12.937766],[77.533657,12.93794],[77.53339,12.938367],[77.533162,12.938719],[77.533107,12.938807],[77.532693,12.939471],[77.532437,12.939897],[77.531522,12.941401],[77.53052,12.943246],[77.530389,12.943445],[77.529986,12.944155]],"type":"LineString"},"mode":"driving","maneuver":{"bearing_after":208,"bearing_before":192,"location":[77.539037,12.933924],"modifier":"right","type":"end of road","instruction":"Turn right onto Outer Ring Road (ORR)"},"ref":"ORR","weight":254.49999999999997,"duration":202.3,"name":"Outer Ring Road (ORR)","distance":1577.7},{"intersections":[{"out":1,"in":0,"entry":[false,true,true],"bearings":[150,315,330],"location":[77.529986,12.944155]},{"out":2,"in":0,"entry":[false,true,true],"bearings":[120,180,300],"location":[77.529111,12.944888]},{"out":3,"in":1,"entry":[false,false,true,true],"bearings":[60,105,225,285],"location":[77.528172,12.945248]}],"driving_side":"left","geometry":{"coordinates":[[77.529986,12.944155],[77.529777,12.944335],[77.529635,12.944509],[77.529562,12.944594],[77.529459,12.944686],[77.529327,12.944778],[77.529111,12.944888],[77.528861,12.945014],[77.528619,12.945096],[77.528332,12.945194],[77.528172,12.945248],[77.527976,12.945327]],"type":"LineString"},"mode":"driving","maneuver":{"bearing_after":310,"bearing_before":330,"location":[77.529986,12.944155],"modifier":"slight left","type":"off ramp","instruction":"Take the ramp onto Outer Ring Road (ORR)"},"ref":"ORR","weight":131.8,"duration":77.19999999999999,"name":"Outer Ring Road (ORR)","distance":259},{"intersections":[{"out":0,"in":1,"entry":[true,false,false,true],"bearings":[45,105,225,300],"location":[77.527976,12.945327]},{"out":0,"in":2,"entry":[true,true,false,false],"bearings":[60,120,225,300],"location":[77.528216,12.945547]},{"out":0,"in":1,"entry":[true,false,false],"bearings":[75,240,255],"location":[77.529073,12.946026]}],"driving_side":"left","geometry":{"coordinates":[[77.527976,12.945327],[77.528216,12.945547],[77.528538,12.945749],[77.529073,12.946026],[77.529603,12.946228],[77.530204,12.946489],[77.530462,12.946605]],"type":"LineString"},"mode":"driving","maneuver":{"bearing_after":46,"bearing_before":291,"location":[77.527976,12.945327],"modifier":"right","type":"turn","instruction":"Turn right onto Mysore Road (NH275)"},"ref":"NH275","weight":189.9,"duration":44,"name":"Mysore Road (NH275)","distance":306.7},{"intersections":[{"in":0,"entry":[true],"bearings":[245],"location":[77.530462,12.946605]}],"driving_side":"left","geometry":{"coordinates":[[77.530462,12.946605],[77.530462,12.946605]],"type":"LineString"},"mode":"driving","maneuver":{"bearing_after":0,"bearing_before":65,"location":[77.530462,12.946605],"modifier":"left","type":"arrive","instruction":"You have arrived at your destination, on the left"},"ref":"NH275","weight":0,"duration":0,"name":"Mysore Road (NH275)","distance":0}],"distance":2712}],"weight_name":"routability","weight":729.5,"duration":419.1,"distance":2712}],"waypoints":[{"name":"Venkatesh Murthy Road","location":[77.541048,12.937529]},{"name":"Mysore Road","location":[77.530462,12.946605]}],"code":"Ok","uuid":"cjog4whx6004n3pldbqhjp6r5"};
    let simulator = simulate(obj.map, simulatorConfig);
    simulator.on('end', function () {
        obj.completeRide(obj.destLoc);
    });
    $('#virtual-car').show();
}


function showRatingDialog() {
    let obj = this;
    let dialog = document.querySelector('dialog');
    // let showDialogButton = document.querySelector('#show-dialog');
    if (! dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
    }
    // showDialogButton.addEventListener('click', function() {
    dialog.showModal();
    // });
    dialog.querySelector('#rating-submit').addEventListener('click', function() {
        obj.rateRide();
    });
}


function UI(map) {
    this.map = map;
    this.route = null;
    this.tripId = null;
    this.sourceLoc = null;
    this.destLoc = null;
}

UI.prototype.login = function () {
    let username = $('#login-username').val();
    let userpass = $('#login-userpass').val();
    let request = {
        username: username,
        password: userpass,
    };
    let url = config.restURLs.baseURL + config.restURLs.login;
    $.when(utils.sendRequest("POST", url, request, 'application/json', false))
        .done(function (response) {
            console.log("Logged In!");
            window.localStorage.setItem('key', response.key);
            window.localStorage.setItem('username', username);
            // $('#login').removeClass('show');
            // console.log("Have to show map");
            // $('#map').addClass('show');
            window.location.reload(true);
        });
};

UI.prototype.logout = function () {
    console.log("ui.logout");
    let url = config.restURLs.baseURL + config.restURLs.logout;
    $.when(utils.sendRequest("POST", url, {}))
        .done(function () {
            window.localStorage.clear();
            window.location.reload(true);
        });
};

UI.prototype.markCarsInLocation = function (userLoc) {
    let request = {
        geoLocation: {
            latitude: userLoc[1],
            longitude: userLoc[0],
        }
    };
    let url = config.restURLs.baseURL + config.restURLs.carsInLocation;
    let obj = this;
    $.when(utils.sendRequest("POST", url, request))
        .done(function (response) {
            console.log("markCarsInLocation", response);
            let locations = [];
            response.carStatuses.forEach(function (carStatus) {
                locations.push([carStatus.geoLocation.longitude, carStatus.geoLocation.latitude]);
            });
            utils.showToast(locations.length + " cars in location");
            addCarsLayer.call(obj, locations);
        });
};


UI.prototype.updateFareEstimates = function (sourceLoc, destLoc) {
    let request = {
        sourceLocation: { latitude: sourceLoc[1], longitude: sourceLoc[0], },
        destinationLocation: { latitude: destLoc[1], longitude: destLoc[0], },
    };
    this.sourceLoc = sourceLoc;
    this.destLoc = destLoc;
    let url = config.restURLs.baseURL + config.restURLs.fareEstimates;
    let obj = this;
    $.when(utils.sendRequest("POST", url, request))
        .done(function (response) {
            let spans = $(".car-type-fare-amount");
            // noinspection JSUnresolvedVariable
            response.estimatesForCarTypes.forEach(function (estimate, index) {
                $(spans[index]).text(estimate.tripPrice.toFixed(2));
            });
            utils.showToast("Distance: " + haversine(sourceLoc, destLoc, {format: "[lon,lat]"}).toFixed(1) + " km");
            fetchRoute.call(obj, sourceLoc, destLoc);
        });
};


UI.prototype.bookRide = function (carType, fareAmt, sourceLoc, destLoc) {
    let request = {
        carType: carType,
        tripPrice: fareAmt,
        sourceLocation: { latitude: sourceLoc[1], longitude: sourceLoc[0], },
        destinationLocation: { latitude: destLoc[1], longitude: destLoc[0], },
    };
    let url = config.restURLs.baseURL + config.restURLs.scheduleTrip;
    let obj = this;
    $.when(utils.sendRequest("POST", url, request))
        .done(function (response) {
            obj.tripId = response.trip.tripId;
            obj.updateCarDetails(response.trip.carId);
        });
};

UI.prototype.updateCarDetails = function(carId) {
    let request = {
        carId: carId
    };
    let url = config.restURLs.baseURL + config.restURLs.cardetails;
    let obj = this;
    $.when(utils.sendRequest("POST", url, request))
        .done(function (response) {
            console.log("car details called!");
            setCarDetails.call(obj, response);
            removeCarsInLocation.call(obj);
            document.getElementsByClassName('mapboxgl-ctrl-directions')[0].classList.add('hidden');
            utils.showToast("You will reach your destination in around " +
                (obj.route.routes[0].duration / 50).toFixed(1) + " seconds");
            startRide.call(obj);
        });
};

UI.prototype.setPaymentType = function (paymentType) {
    this.paymentType = paymentType;
};

UI.prototype.cancelRide = function () {

};

UI.prototype.completeRide = function (finishLoc) {
    let request = {
        tripId: this.tripId,
        paymentMode: 2,
        finishLocation: { latitude: finishLoc[1], longitude: finishLoc[0], },
        completeTripOption: 1,
    };
    let url = config.restURLs.baseURL + config.restURLs.completetrip;
    let obj = this;
    $.when(utils.sendRequest("POST", url, request))
        .done(function (response) {
            console.log("completeRide", response);
            showRatingDialog.call(obj);
        });
};

UI.prototype.rateRide = function () {
    let request = {
        tripId: this.tripId,
        rating: parseInt($("input[name=star]:checked").val()),
        feedback: $('#rating-feedback').val(),
    };
    let url = config.restURLs.baseURL + config.restURLs.ratetrip;
    $.when(utils.sendRequest("POST", url, request))
        .done(function (response) {
            console.log(response);
            window.location.reload(true);
        });
};

module.exports = {
    UI: UI
};

