var map = L.map('mapid', { 
	dragging: !L.Browser.mobile,
	tap: !L.Browser.mobile
}).setView([20.287, 85.8445], 12);

L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaXRzYXR1bGtyIiwiYSI6ImNrZWliY2M5bDFpYTcycm43ejNla2dkdGkifQ.Z4Bnlezvmp2qqtbjAkp7tQ', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1
}).addTo(map);


// control that shows state info on hover
var info = L.control();

info.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};

info.update = function(props) {
    this._div.innerHTML = '<h4>BMC Covid Data</h4>' +
        (
            props ?
            'Ward: <b>' + props.wardno + '</b><br />' +
            'Zone: <b>' + props.municipalzone + '</b><br />' +
            'Active as of 31st Aug: <b>' + props.positive + '</b><br />' +
            'New Cases: <b>' + props.new_positive + '</b><br />' +
            'Recovered: <b>' + props.cured + '</b><br />' +
            'Recent Recovery: <b>' + props.new_cured + '</b><br />' :
            'Hover over a ward'
        );
};

info.addTo(map);


// get color depending on population density value
function getColor(d) {
    return d > 350 ? '#CA0B00' :
        d > 300 ? '#d04c67' :
        d > 250 ? '#f18c8d' :
        d > 200 ? '#fda694' :
        d > 150 ? '#FD8D3C' :
        d > 100 ? '#fdff29' :
        d > 50 ? '#e1ff8b' :
        '#26bd00';
}

function style(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: '#ccc',
        dashArray: '1',
        fillOpacity: 0.7,
        fillColor: getColor(feature.properties.positive)
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    var myIcon = L.divIcon({
        className: 'ward-details-container',
        html: 'W' + feature.properties.sno
    });
    
    L.marker([feature.properties.latitudei, feature.properties.longitudei], {icon: myIcon}).addTo(map);

    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

geojson = L.geoJson(statesData, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

map.attributionControl.addAttribution('Covid data &copy; <a href="https://twitter.com/bmcbbsr">BMC</a>');

var myIcon = L.divIcon({
    className: 'my-div-icon',
    html: 'Ward 11111111111'
});
// you can set .my-div-icon styles in CSS
L.marker([20.287, 85.8445], {icon: myIcon}).addTo(map);

var legend = L.control({
    position: 'bottomright'
});

legend.onAdd = function(map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 50, 100, 150, 200, 250, 300, 350],
        labels = [],
        from, to;

    for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
            '<i style="background:' + getColor(from + 1) + '"></i> ' +
            from + (to ? '&ndash;' + to : '+'));
    }

    div.innerHTML = labels.join('<br><br>');
    return div;
};

legend.addTo(map);

function handlePermission(map) {
  navigator.permissions.query({name:'geolocation'}).then(function(result) {
    if (result.state == 'granted') {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(currentPosition);
        }
        report(result.state);
    } else if (result.state == 'prompt') {
          report(result.state);
          navigator.geolocation.getCurrentPosition(currentPosition);
    } else if (result.state == 'denied') {
        report(result.state);
    }
    result.onchange = function() {
        report(result.state);
    }
  });
}

function report(state) {
  console.log('Permission ' + state);
}

function currentPosition(position) {
    var latlng = L.latLng(position.coords.latitude, position.coords.longitude)

    L.marker([position.coords.latitude, position.coords.longitude]).addTo(map)
        .bindPopup("<b>Hey buddy!</b><br />You are here.").openPopup();
}
handlePermission();