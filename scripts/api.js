const utils = require("./utils");

function API() {

}

API.prototype.getCarsInLocation = function (carsInLocationRequest) {

    return utils.sendRequest("POST", "http://localhost:8000/hola/v1/carsinlocation/", carsInLocationRequest);

};

module.exports = {
    API: API
};