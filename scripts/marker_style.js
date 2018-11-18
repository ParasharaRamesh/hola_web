const style = {
    id: "",
    type: "symbol",
    /* Source: A data source specifies the geographic coordinate where the image marker gets placed. */
    source: {
        type: "geojson",
        data: {
            type: "FeatureCollection",
            features: [{
                "type": "Feature",
                "geometry": {"type": "Point", "coordinates": []}
            }]
        }
    },
    layout: {
        "icon-image": "",
        // "icon-rotate": 90,
    }
};

module.exports.getCustomMarkerStyle = function () {
    return JSON.parse(JSON.stringify(style));
};