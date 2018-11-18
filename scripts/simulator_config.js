const simulatorConfig = {
    "style": "mapbox://styles/mapbox/light-v9",
    "route": null,
    "zoom": 18,
    "pitch": 60,
    "time": "00m00s",
    "spacing": "acceldecel",
    "speed": "50x",
    "maneuvers": [
        {
            "type": [
                "depart",
                "arrive"
            ],
            "modifier": [],
            "buffer": 0.10,
            "zoom": 19,
            "pitch": 10,
            "speed": "5x"
        },
        {
            "type": [
                "turn"
            ],
            "modifier": [
                "left",
                "right"
            ],
            "buffer": 0.10,
            "zoom": 18.3,
            "pitch": 50
        }
    ]
};

module.exports.getSimulatorConfig = function () {
    return JSON.parse(JSON.stringify(simulatorConfig));
};