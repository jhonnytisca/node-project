/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var componentForm = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    country: 'long_name',
    postal_code: 'short_name'
};

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 19.4176577, lng: -99.09686},
        zoom: 13
    });
    var input = /** @type {!HTMLInputElement} */(
            document.getElementById('pac-input'));

    var types = document.getElementById('type-selector');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29)
    });

    autocomplete.addListener('place_changed', fillInAddress);
    autocomplete.addListener('place_changed', function () {
        infowindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace();


        console.log("LAT: " + place.geometry.location.lat());
        console.log("LONG: " + place.geometry.location.lng());
        console.log("PLACE ID: " + place.place_id);

        document.getElementById('lat').value = place.geometry.location.lat();
        document.getElementById('long').value = place.geometry.location.lng();
        document.getElementById('idPlace').value = place.place_id;


        if (!place.geometry) {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);  // Why 17? Because it looks good.
        }
        marker.setIcon(/** @type {google.maps.Icon} */({
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        }));
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        var address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }

        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        infowindow.open(map, marker);
    });

    // Sets a listener on a radio button to change the filter type on Places
    // Autocomplete.  
    function fillInAddress() {
        // Get the place details from the autocomplete object.
        var place = autocomplete.getPlace();

        for (var component in componentForm) {
            document.getElementById(component).value = '';
        }

        // Get each component of the address from the place details
        // and fill the corresponding field on the form.
        for (var i = 0; i < place.address_components.length; i++) {
            var addressType = place.address_components[i].types[0];
            if (componentForm[addressType]) {
                var val = place.address_components[i][componentForm[addressType]];
                document.getElementById(addressType).value = val;
            }
        }
    }


}


function getHouseMap(colonia) {
    var map = new google.maps.Map(document.getElementById('map'), {zoom: 15});
    var geocoder = new google.maps.Geocoder;

    console.log("GET HOUSE MAP");
    if (colonia === "" || colonia === undefined || colonia === null) {
        var colonia = 'Mexico';

    }

    console.dir(colonia);

    geocoder.geocode({'address': colonia}, function (results, status) {
        if (status === 'OK') {
            map.setCenter(results[0].geometry.location);

            var cityCircle = new google.maps.Circle({
                strokeColor: '#4C0262',
                strokeOpacity: 0.8,
                strokeWeight: 3,
                fillColor: '#4C0262',
                fillOpacity: 0.2,
                map: map,
                center: map.center,
                radius: 1000
            });


        } else {
            console.log('Geocode was not successful for the following reason: ' +
                    status);
        }
    });


    return map;
}


function getMapLat(lati, longi) {

    var latlng = {lat: parseFloat(lati), lng: parseFloat(longi)};

    var map = new google.maps.Map(document.getElementById('map'), {
        center: latlng,
        zoom: 18});

    var marker = new google.maps.Marker({
        position: latlng,
        map: map,
        icon: {
            url: "img/marker_blue.png",
            scaledSize: new google.maps.Size(50, 50)
        }
    });

    return map;
}


function initMapBuscador(viviendas) {

    var markers = [];

    var map = new google.maps.Map(document.getElementById('mapBuscador'), {
        center: {lat: 19.4176577, lng: -99.09686},
        zoom: 13
    });


    var infoWindowGeo = new google.maps.InfoWindow({map: map});

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindowGeo.setPosition(pos);
            infoWindowGeo.setContent('Location found.');
            map.setCenter(pos);
        }, function () {
            handleLocationError(true, infoWindowGeo, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindowGeo, map.getCenter());
    }

    //Autocompletar
    var input = /** @type {!HTMLInputElement} */(
            document.getElementById('pac-input'));

    var types = document.getElementById('type-selector');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29),
        icon: {
            url: "img/marker_red.png",
            scaledSize: new google.maps.Size(30, 30)
        }
    });

    autocomplete.addListener('place_changed', fillInAddress);
    autocomplete.addListener('place_changed', function () {
        infowindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace();


        console.log("LAT: " + place.geometry.location.lat());
        console.log("LONG: " + place.geometry.location.lng());
        console.log("PLACE ID: " + place.place_id);

        document.getElementById('lat').value = place.geometry.location.lat();
        document.getElementById('long').value = place.geometry.location.lng();
        document.getElementById('idPlace').value = place.place_id;


        if (!place.geometry) {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);  // Why 17? Because it looks good.
        }
        marker.setIcon(/** @type {google.maps.Icon} */({
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        }));
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        var address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }
        
        eventFire(document.getElementById('buscarBoton'), 'click');
        
        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        infowindow.open(map, marker);
    });

    // Sets a listener on a radio button to change the filter type on Places
    // Autocomplete.
//    function setupClickListener(id, types) {
//        var radioButton = document.getElementById(id);
//        radioButton.addEventListener('click', function () {
//            autocomplete.setTypes(types);
//        });
//    }

//    setupClickListener('changetype-all', []);
    document.getElementById('buscarBoton').addEventListener('click', reloadMarkers);

    loadMarkers();

    function fillInAddress() {
        // Get the place details from the autocomplete object.
        var place = autocomplete.getPlace();

        for (var component in componentForm) {
            document.getElementById(component).value = '';
        }

        // Get each component of the address from the place details
        // and fill the corresponding field on the form.
        for (var i = 0; i < place.address_components.length; i++) {
            var addressType = place.address_components[i].types[0];
            if (componentForm[addressType]) {
                var val = place.address_components[i][componentForm[addressType]];
                document.getElementById(addressType).value = val;
            }
        }
    }


    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                'Error: The Geolocation service failed.' :
                'Error: Your browser doesn\'t support geolocation.');
    }

    // LOAD MARKERS
    function loadMarkers() {
        console.log("LOAD MARKERS");
        
        if(viviendasGlobal.length>0)
            viviendas=viviendasGlobal;
        
        if (viviendas !== 0) {
//        var infowindow2 = new google.maps.InfoWindow();
            var infoPrecio = new google.maps.InfoWindow();
            var i;

            var cadenaPrecio = '';
            var contentStrArray = setPlantillaArray(viviendas);

            for (i = 0; i < viviendas.length; i++) {
                if (viviendas[i].rentaCuarto) {
                    cadenaPrecio = "Costos desde: $" + viviendas[i].recamaras[0].precio + ".°° MXN";

                } else {
                    cadenaPrecio = "Costo: $" + viviendas[i].precio + ".°° MXN";
                }


                markers[i] = new google.maps.Marker({
                    position: new google.maps.LatLng(viviendas[i].latitud, viviendas[i].longitud),
                    map: map,
                    title: cadenaPrecio,
                    icon: {
                        url: "img/marker_blue.png",
                        scaledSize: new google.maps.Size(40, 40)
                    }
                });


            }

            if (markers.length > 0) {

//                infoPrecio.setContent('1000');
//                infoPrecio.open(map, marker2);


                var infowindow2 = new google.maps.InfoWindow();
                var j = 0;
                markers.forEach(function (marker) {

                    google.maps.event.addListener(marker, 'click', (function (marker, j) {
                        return function () {
                            infowindow2.setContent(contentStrArray[j]);
                            infowindow2.open(map, marker);
                        };
                    })(marker, j));
                    j = j + 1;
                });
            }

        }

    }


    function reloadMarkers() {

        console.log("Checa esto global");
        console.dir(viviendasGlobal);

        // Loop through markers and set map to null for each
        for (var i = 0; i < markers.length; i++) {

            markers[i].setMap(null);
        }


        // Reset the markers array
        markers = [];

        // Call set markers to re-add markers
        loadMarkers(viviendasGlobal);
    }
    /**************************************************************************************/



}


function initMapBuscadorMob(viviendas) {

    var markers = [];

    var map = new google.maps.Map(document.getElementById('mapBuscadorMob'), {
        center: {lat: 19.4176577, lng: -99.09686},
        zoom: 13,
        mapTypeControl: false
    });


    var infoWindowGeo = new google.maps.InfoWindow({map: map});

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            infoWindowGeo.setPosition(pos);
            infoWindowGeo.setContent('Location found.');
            map.setCenter(pos);
        }, function () {
            handleLocationError(true, infoWindowGeo, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindowGeo, map.getCenter());
    }

    //Autocompletar
    var input = /** @type {!HTMLInputElement} */(
            document.getElementById('pac-input'));

    var types = document.getElementById('type-selector');
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(types);

    var autocomplete = new google.maps.places.Autocomplete(input);
    autocomplete.bindTo('bounds', map);

    var infowindow = new google.maps.InfoWindow();
    var marker = new google.maps.Marker({
        map: map,
        anchorPoint: new google.maps.Point(0, -29),
        icon: {
            url: "img/marker_red.png",
            scaledSize: new google.maps.Size(30, 30)
        }
    });

    autocomplete.addListener('place_changed', fillInAddress);
    autocomplete.addListener('place_changed', function () {
        infowindow.close();
        marker.setVisible(false);
        var place = autocomplete.getPlace();


        console.log("LAT: " + place.geometry.location.lat());
        console.log("LONG: " + place.geometry.location.lng());
        console.log("PLACE ID: " + place.place_id);

        document.getElementById('lat').value = place.geometry.location.lat();
        document.getElementById('long').value = place.geometry.location.lng();
        document.getElementById('idPlace').value = place.place_id;


        if (!place.geometry) {
            window.alert("Autocomplete's returned place contains no geometry");
            return;
        }

        // If the place has a geometry, then present it on a map.
        if (place.geometry.viewport) {
            map.fitBounds(place.geometry.viewport);
        } else {
            map.setCenter(place.geometry.location);
            map.setZoom(17);  // Why 17? Because it looks good.
        }
        marker.setIcon(/** @type {google.maps.Icon} */({
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(35, 35)
        }));
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);

        var address = '';
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }
        
        eventFire(document.getElementById('buscarBoton'), 'click');
        
        infowindow.setContent('<div><strong>' + place.name + '</strong><br>' + address);
        infowindow.open(map, marker);
    });

    // Sets a listener on a radio button to change the filter type on Places
    // Autocomplete.
//    function setupClickListener(id, types) {
//        var radioButton = document.getElementById(id);
//        radioButton.addEventListener('click', function () {
//            autocomplete.setTypes(types);
//        });
//    }

//    setupClickListener('changetype-all', []);
    document.getElementById('buscarBoton').addEventListener('click', reloadMarkers);

    loadMarkers();

    function fillInAddress() {
        // Get the place details from the autocomplete object.
        var place = autocomplete.getPlace();

        for (var component in componentForm) {
            document.getElementById(component).value = '';
        }

        // Get each component of the address from the place details
        // and fill the corresponding field on the form.
        for (var i = 0; i < place.address_components.length; i++) {
            var addressType = place.address_components[i].types[0];
            if (componentForm[addressType]) {
                var val = place.address_components[i][componentForm[addressType]];
                document.getElementById(addressType).value = val;
            }
        }
    }


    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infoWindow.setPosition(pos);
        infoWindow.setContent(browserHasGeolocation ?
                'Error: The Geolocation service failed.' :
                'Error: Your browser doesn\'t support geolocation.');
    }

    // LOAD MARKERS
    function loadMarkers() {
        console.log("LOAD MARKERS");
        
        if(viviendasGlobal.length>0)
            viviendas=viviendasGlobal;
        
        if (viviendas !== 0) {
//        var infowindow2 = new google.maps.InfoWindow();
            var infoPrecio = new google.maps.InfoWindow();
            var i;

            var cadenaPrecio = '';
            var contentStrArray = setPlantillaArray(viviendas);

            for (i = 0; i < viviendas.length; i++) {
                if (viviendas[i].rentaCuarto) {
                    cadenaPrecio = "Costos desde: $" + viviendas[i].recamaras[0].precio + ".°° MXN";

                } else {
                    cadenaPrecio = "Costo: $" + viviendas[i].precio + ".°° MXN";
                }


                markers[i] = new google.maps.Marker({
                    position: new google.maps.LatLng(viviendas[i].latitud, viviendas[i].longitud),
                    map: map,
                    title: cadenaPrecio,
                    icon: {
                        url: "img/marker_blue.png",
                        scaledSize: new google.maps.Size(40, 40)
                    }
                });


            }

            if (markers.length > 0) {

//                infoPrecio.setContent('1000');
//                infoPrecio.open(map, marker2);


                var infowindow2 = new google.maps.InfoWindow();
                var j = 0;
                markers.forEach(function (marker) {

                    google.maps.event.addListener(marker, 'click', (function (marker, j) {
                        return function () {
                            infowindow2.setContent(contentStrArray[j]);
                            infowindow2.open(map, marker);
                        };
                    })(marker, j));
                    j = j + 1;
                });
            }

        }

    }


    function reloadMarkers() {

        console.log("Checa esto global");
        console.dir(viviendasGlobal);

        // Loop through markers and set map to null for each
        for (var i = 0; i < markers.length; i++) {

            markers[i].setMap(null);
        }


        // Reset the markers array
        markers = [];

        // Call set markers to re-add markers
        loadMarkers(viviendasGlobal);
    }
    /**************************************************************************************/



}


var placeSearch, autocomplete;
function busquedaAvanzadaAuto() {
    // Create the autocomplete object, restricting the search to geographical
    // location types.
    autocomplete = new google.maps.places.Autocomplete(
            /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
            {types: ['geocode']});

    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    autocomplete.addListener('place_changed', fillInAddress);

    function fillInAddress() {
        // Get the place details from the autocomplete object.
        var place = autocomplete.getPlace();

        console.log("LAT: " + place.geometry.location.lat());
        console.log("LONG: " + place.geometry.location.lng());
        console.log("PLACE ID: " + place.place_id);

        document.getElementById('lat').value = place.geometry.location.lat();
        document.getElementById('long').value = place.geometry.location.lng();
        document.getElementById('idPlace').value = place.place_id;



        for (var component in componentForm) {
            document.getElementById(component).value = '';
        }

        // Get each component of the address from the place details
        // and fill the corresponding field on the form.
        for (var i = 0; i < place.address_components.length; i++) {
            var addressType = place.address_components[i].types[0];
            if (componentForm[addressType]) {
                var val = place.address_components[i][componentForm[addressType]];
                document.getElementById(addressType).value = val;
            }
        }
    }

}

function setPlantillaArray(viviendas) {
    var plantillaArray = new Array();
    var cadenaPrecio = "";




    for (var i = 0; i < viviendas.length; i++) {

        if (viviendas[i].rentaCuarto) {
            cadenaPrecio = "<b>Costos desde:</b> $" + viviendas[i].recamaras[0].precio + ".°° MXN";

        } else {
            cadenaPrecio = "<b>Costo:</b> $" + viviendas[i].precio + ".°° MXN";
        }

        var contentString = '<div id="content">' +
                '<h3 id="firstHeading" class="firstHeading">' + viviendas[i].titulo + '</h3>' +
                '<div id="bodyContent">' +
                '<p><b>' + viviendas[i].direccionGenerica + '</b> - ' + viviendas[i].direccion + '</p>' +
                '<a href="/#/consultarVivienda/' + viviendas[i].idVivienda + '"><img class="uk-background-cover casacard" src="../../../uploads/' + viviendas[i].portada + '" width="200px"></a>' +
                '<p>' + cadenaPrecio + '</p>' +
                '</div>' +
                '</div>';

        plantillaArray.push(contentString);
    }


    return plantillaArray;
}

function eventFire(el, etype){
  if (el.fireEvent) {
    el.fireEvent('on' + etype);
  } else {
    var evObj = document.createEvent('Events');
    evObj.initEvent(etype, true, false);
    el.dispatchEvent(evObj);
  }
}


 