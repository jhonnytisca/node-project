var app = angular.module("rotwApp");
var viviendasGlobal = [];

app.controller('consumirViviendasCtrl', function ($scope, $http, $location, viviendaService, pagerService, CONSTANT) {
    var pantalla = pantallaCarga();
    var vm = this;
    vm.pager = {};
    vm.setPage = setPage;

    $http.get(CONSTANT.URLWSVIVIENDAS).
            then(function (response) {
                var listaViviendas = [];
                response.data.forEach(function (element) {

                    if (isNaN(element)) {
                        listaViviendas.push(element);
                    }

                });

                $scope.viviendas = listaViviendas;

                console.dir(listaViviendas);
                initPagination();
                pantalla.finish();

            }, function (error) {

                console.info("----------ERROR SERVICIO-----------------");
                console.info(error);
                pantalla.finish();
            }
            );


    $scope.loadDetalle = function (idViviendaView) {
        viviendaService.sendId(idViviendaView);
        console.info("LOAD DETALLE " + idViviendaView);
        $location.path("/consultarVivienda/" + idViviendaView);

    };

    $scope.setPage = function (page) {

        setPage(page);

    };

    //Paginacion
    function initPagination() {
        // initialize to page 1
        console.log("INIT PAGINATION");
        vm.setPage(1);
    }

    function setPage(page) {
        if (page < 1 || page > vm.pager.totalPages) {
            return;
        }

        // get pager object from service
        vm.pager = pagerService.GetPager($scope.viviendas.length, page);
        $scope.pager = vm.pager;

        // get current page of items
        vm.items = $scope.viviendas.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
        $scope.itemsPage = vm.items;
//             console.log("PAGE "+page+" VM ITEMS: "+vm.items);
    }


});

app.controller('altaViviendaCtrl', function ($scope, $http, $location, $window, usuarioService, CONSTANT) {
    var pantalla = pantallaCarga();

    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 4) {
        $location.path("/inicio");
        pantalla.finish();
    }


    $scope.master = {};
    $scope.tituloTouched = false;
    $scope.m2Touched = false;
    $scope.precioTouched = false;

    $scope.reset = function () {
        $scope.vivienda = angular.copy($scope.master);
        $scope.tituloTouched = false;
        $scope.m2Touched = false;
        $scope.precioTouched = false;
    };



    $scope.user = parseInt(usuarioService.parseId());



    var ob = new Object();
    var ob1 = new Object();


    console.info("ENTRO AGREGAR VIVIENDA");
    pantalla.finish();

    $window.map = initMap();


    $scope.crea = function (form, vivienda) {

        desactivaBoton();

        console.dir(form);
        console.dir(vivienda);

        ob1.idEstatusVivienda = "1";
        if (vivienda.tipoVivienda !== undefined) {
            ob.idTipoVivienda = vivienda.tipoVivienda;
        }
        vivienda.estatusVivienda = ob1;
        vivienda.tipoVivienda = ob;

        vivienda.direccionGenerica = document.getElementById('administrative_area_level_1').value;
        vivienda.direccion = document.getElementById('route').value;
        vivienda.delimitador = document.getElementById('idPlace').value;
        vivienda.latitud = document.getElementById('lat').value;
        vivienda.longitud = document.getElementById('long').value;


        console.log("FECHA INICIO::: " + vivienda.fechaInicio);
        console.log("SCOPE DIRECCION " + vivienda.direccion + " " + vivienda.latitud + " " + vivienda.longitud + " ");


        if (document.getElementById("hiddenInicio").value === undefined || document.getElementById("hiddenInicio").value === "") {
            vivienda.fechaInicio = new Date();
        } else {

            vivienda.fechaInicio = new Date(document.getElementById("hiddenInicio").value);
        }


        vivienda.direccionC = "0,0";
        vivienda.precio = parseFloat(vivienda.precio);
        vivienda.idResponsable = parseInt(usuarioService.parseId());
        vivienda.m2 = parseFloat(vivienda.m2);
        vivienda.portada = pathACList[0];
        if (document.getElementById("myonoffswitch2").checked) {
            vivienda.rentaCuarto = false;
        } else {
            vivienda.rentaCuarto = true;
        }

        if (document.getElementById("myonoffswitch3").checked) {
            vivienda.isRoomie = false;
        } else {
            vivienda.isRoomie = true;
        }
        console.log("Lista de imagenes:: " + pathACList);
        console.log("Portada " + pathACList[0]);

        ob.idTipoVivienda = vivienda.idTipoVivienda;

        vivienda.tipoVivienda = ob;

        if (vivienda.rentaCuarto) {
            console.log("Info Rooms: " + getAllRooms());
            vivienda.recamaras = getAllRooms();
            vivienda.precio = 0;
        }
        if (!vivienda.rentaCuarto) {

            console.log("VIV PRECIO" + vivienda.precio);
            if (vivienda.precio === 0 || isNaN(vivienda.precio)) {

                notificar('<i class="uk-icon-warning"></i>  El precio debe ser mayor a 0.', 'warning');
                activaBoton();
                return false;
            }

        }

        var servicios = getChosenServices();
        var amenidades = getChosenFeatures();
        var caracVivienda = getChosenCharac();
        var requisitos = getChosenRequire();


        console.dir(servicios);
        console.dir(amenidades);
        console.dir(caracVivienda);


        if (vivienda.idTipoVivienda === undefined || vivienda.idTipoVivienda === '') {

            notificar('<i class="uk-icon-warning"></i>  Elegir Tipo de Vivienda.', 'warning');
            activaBoton();
            return false;
        }

        if (vivienda.rangoEdad === undefined || vivienda.rangoEdad === '') {

            notificar('<i class="uk-icon-warning"></i>  Elegir Rango Edad.', 'warning');
            activaBoton();
            return false;
        }

        if (vivienda.precio === 'NaN') {

            notificar('<i class="uk-icon-warning"></i>  El precio debe ser un número.', 'warning');
            activaBoton();
            return false;
        }

        if (vivienda.m2 === 'NaN') {

            notificar('<i class="uk-icon-warning"></i>  Los metros deben ser un número.', 'warning');
            activaBoton();
            return false;
        }



        if (vivienda.direccion === undefined || vivienda.direccion === '') {

            notificar('<i class="uk-icon-warning"></i>  Debe ingresar una dirección.', 'warning');
            activaBoton();
            return false;
        }

        if (document.getElementById('street_number').value === undefined || document.getElementById('street_number').value === '' ||
                document.getElementById('locality').value === undefined || document.getElementById('locality').value === '' ||
                document.getElementById('country').value === undefined || document.getElementById('country').value === '' ||
                document.getElementById('administrative_area_level_1').value === undefined || document.getElementById('administrative_area_level_1').value === '' ||
                document.getElementById('route').value === undefined || document.getElementById('route').value === '') {

            notificar('<i class="uk-icon-warning"></i>  Debe ingresar una dirección válida (Calle, No., Ciudad, Estado, País).', 'warning');
            activaBoton();
            return false;
        }

        if (vivienda.portada === undefined || vivienda.portada.length === 0) {

            notificar('<i class="uk-icon-warning"></i>  Debe añadir al menos una foto.', 'warning');
            activaBoton();
            return false;
        }

        if (caracVivienda === undefined || caracVivienda.length === 0) {

            notificar('<i class="uk-icon-warning"></i>  Debe añadir al menos característica.', 'warning');
            activaBoton();
            return false;
        }

        if (servicios === undefined || servicios.length === 0) {

            notificar('<i class="uk-icon-warning"></i>  Debe añadir al menos un servicio.', 'warning');
            activaBoton();
            return false;
        }

        if (amenidades === undefined || amenidades.length === 0) {

            notificar('<i class="uk-icon-warning"></i>  Debe añadir al menos una amenidad ó área común.', 'warning');
            activaBoton();
            return false;
        }

        if (vivienda.rentaCuarto) {

            if (!validaCuartos(vivienda.recamaras)) {
                notificar('<i class="uk-icon-warning"></i> Información de recamara incompleta.', 'warning');
                activaBoton();
                return false;
            }
        }

        var jsonString = JSON.stringify(vivienda);


        $http.post(CONSTANT.URLWSVIVIENDAS, jsonString).
                then(function (response) {

                    console.info("AGREGA VIVIENDA:");

                    var objMongo = new Object();

                    console.log(response);
                    console.log(response.data.idVivienda);
                    objMongo.idHouse = response.data.idVivienda;


                    objMongo.ageRate = vivienda.rangoEdad;
                    objMongo.isRoomie = vivienda.isRoomie;
                    objMongo.noRec = vivienda.noRec;
                    objMongo.noBan = vivienda.noBan;
                    objMongo.min_months = vivienda.minima;

                    objMongo.services = servicios;
                    objMongo.features = amenidades;
                    objMongo.characteristics = caracVivienda;

                    if (requisitos !== undefined && requisitos.length !== 0) {
                        objMongo.requirements = requisitos;
                    }



                    if (vivienda.rentaCuarto) {
                        var indice = 0;
                        objMongo.rooms = [];
                        response.data.recamaras.forEach(function (element) {
                            var objMongoRooms = new Object();
                            console.log("Cuarto Creado");
                            console.dir(element);
                            objMongoRooms.id_room = element.idCuarto;
                            objMongoRooms.furniture = vivienda.recamaras[indice].furnitureAux;
                            objMongoRooms.images = getRoomPics(imgList, indice);
                            objMongo.rooms.push(objMongoRooms);
                            indice = indice + 1;
                        });
                    }
                    //parsea paths

                    var pathArray = [];

                    if (pathACList.length > 0) {
                        pathACList.forEach(function (element) {
                            var objPath = new Object();
                            objPath.path = element;
                            pathArray.push(objPath);
                        });

                        objMongo.images = pathArray;
                    }
                    console.log("Imagenes a subir: " + objMongo.images);

                    $http.post('/api/house', objMongo)
                            .success(function (data) {

                                console.info("AGREGA VIVIENDA EN MONGO");
                                $location.path("/misViviendas");
                                notificar('<i class="uk-thumbs-up"></i>  Agregar vivienda exitoso', 'success');

                            })
                            .error(function (data) {
                                console.log('Error MONGO: ' + data);
                                notificar('<i class="uk-icon-warning"></i>  Problema al registrar vivienda M', 'danger');
                                activaBoton();

                            });

                }, function (error) {

                    console.info("-----------------ERROR SERVICIO------------------------");
                    console.info(error);
                    notificar('<i class="uk-icon-warning"></i>  Problema al registrar vivienda S', 'danger');
                    activaBoton();
                });


    };

});


app.controller('addCuartoCtrl', function ($scope, $http, $location, $window, usuarioService, viviendaService, CONSTANT) {
    var pantalla = pantallaCarga();

    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 4) {
        $location.path("/inicio");
        pantalla.finish();
    }

    $scope.user = parseInt(usuarioService.parseId());


    console.log("RECIBO VIVIENDA ADD " + viviendaService.getId());
    var idVivienda = viviendaService.getId();
    if (viviendaService.getId() === undefined) {
        $location.path("/inicio");
        pantalla.finish();
    }

    $scope.master = {};
    $scope.tituloTouched = false;

    $scope.reset = function () {
        $scope.cuarto = angular.copy($scope.master);
        $scope.tituloTouched = false;

    };

    console.info("ENTRO AGREGAR Cuarto");
    pantalla.finish();

    $scope.crea = function (form, cuarto) {
        var vivienda = new Object();
        vivienda.idVivienda = idVivienda;


        console.log("CREA CUARTO?");
        desactivaBoton();

        if (cuarto === undefined)
        {
            notificar('<i class="uk-icon-warning"></i>  Cuarto incompleto, llene el registro.', 'warning');
            activaBoton();
            return false;
        }
        console.dir(form);

        var elementsFurniture = getChosenFurnitureSingle();

        console.dir(elementsFurniture);
        var fechaInicio = new Date();
        if (document.getElementById("hiddenInicioC").value === undefined || document.getElementById("hiddenInicioC").value === "") {
            fechaInicio = new Date();
        } else {

            fechaInicio = new Date(document.getElementById("hiddenInicioC").value);
        }

        cuarto.portada = document.getElementById("pathHidden").value;
        cuarto.fechaInicio = fechaInicio;
        console.dir(cuarto);


        if (cuarto.titulo === undefined || cuarto.titulo === '')
        {
            notificar('<i class="uk-icon-warning"></i>  Falta título cuarto.', 'warning');
            activaBoton();
            return false;
        }
        if (cuarto.descripcion === undefined || cuarto.descripcion === '')
        {
            notificar('<i class="uk-icon-warning"></i>  Falta descripción cuarto.', 'warning');
            activaBoton();
            return false;
        }
        if (cuarto.precio === 'NaN' || cuarto.precio === undefined || cuarto.precio === '')
        {
            notificar('<i class="uk-icon-warning"></i>  Falta precio cuarto.', 'warning');
            activaBoton();
            return false;
        }
        if (cuarto.portada === undefined || cuarto.portada.length === 0)
        {
            notificar('<i class="uk-icon-warning"></i>  Debe añadir una foto del cuarto', 'warning');
            activaBoton();
            return false;
        }
        if (cuarto.m2 === 'NaN' || cuarto.m2 === undefined || cuarto.m2 === '')
        {
            notificar('<i class="uk-icon-warning"></i>  Faltan metros cuadrados de cuarto.', 'warning');
            activaBoton();
            return false;
        }

        if (elementsFurniture === undefined || elementsFurniture.length === 0) {

            notificar('<i class="uk-icon-warning"></i>  Debe añadir al menos una característica', 'warning');
            activaBoton();
            return false;
        }


        cuarto.idVivienda = vivienda;

        var jsonString = JSON.stringify(cuarto);


        $http.post(CONSTANT.URLWSCUARTOS, jsonString).
                then(function (response) {

                    console.info("AGREGA Cuarto en vivienda:");

                    var objMongo = new Object();
                    objMongo.id_room = response.data.idCuarto;
                    objMongo.furniture = elementsFurniture;
                    objMongo.images = getRoomPics(imgList, 0);


                    $http.put('/api/house/room/' + idVivienda, objMongo)
                            .success(function (data) {

                                console.info("AGREGA VIVIENDA EN MONGO");
                                $location.path("/misViviendas");
                                notificar('<i class="uk-thumbs-up"></i>  Agregar cuarto exitoso', 'success');

                            })
                            .error(function (data) {
                                console.log('Error MONGO: ' + data);
                                notificar('<i class="uk-icon-warning"></i>  Problema al registrar cuarto M', 'danger');
                                activaBoton();

                            });


                }, function (error) {

                    console.info("-----------------ERROR SERVICIO------------------------");
                    console.info(error);
                    notificar('<i class="uk-icon-warning"></i>  Problema al registrar vivienda S', 'danger');
                    activaBoton();
                });



    };

});



app.controller('editCuartoCtrl', function ($scope, $http, $location, $window, usuarioService, viviendaService, CONSTANT) {
    var pantalla = pantallaCarga();

    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 4 || viviendaService.getCuartoId() === undefined) {
        $location.path("/inicio");
        pantalla.finish();
    }

    $scope.user = parseInt(usuarioService.parseId());


    $scope.master = {};
    $scope.tituloTouched = false;

    $scope.reset = function () {
        $scope.cuarto = angular.copy($scope.master);
        $scope.tituloTouched = false;

    };

    console.info("ENTRO AGREGAR Cuarto");
    pantalla.finish();


    var idCuartoPre = viviendaService.getCuartoId();

    var cuartoPromise = viviendaService.getCuartoById(idCuartoPre);
    cuartoPromise.then(function (result) {
        $scope.cuarto = result;
        console.info("REGRESA Cuarto Promise:  " + result);
    });

    $scope.edita = function (form, cuarto) {

        console.log("EDITA CUARTO?");
        desactivaBoton();

        if (cuarto === undefined)
        {
            notificar('<i class="uk-icon-warning"></i>  Cuarto incompleto, llene el registro.', 'warning');
            activaBoton();
            return false;
        }

        if (cuarto.titulo === undefined || cuarto.titulo === '')
        {
            notificar('<i class="uk-icon-warning"></i>  Falta título cuarto.', 'warning');
            activaBoton();
            return false;
        }
        if (cuarto.descripcion === undefined || cuarto.descripcion === '')
        {
            notificar('<i class="uk-icon-warning"></i>  Falta descripción cuarto.', 'warning');
            activaBoton();
            return false;
        }
        if (cuarto.precio === 'NaN' || cuarto.precio === undefined || cuarto.precio === '')
        {
            notificar('<i class="uk-icon-warning"></i>  Falta precio cuarto.', 'warning');
            activaBoton();
            return false;
        }

        if (cuarto.m2 === 'NaN' || cuarto.m2 === undefined || cuarto.m2 === '')
        {
            notificar('<i class="uk-icon-warning"></i>  Faltan metros cuadrados de cuarto.', 'warning');
            activaBoton();
            return false;
        }




        var jsonString = JSON.stringify(cuarto);


        $http.put(CONSTANT.URLWSCUARTOS, jsonString).
                then(function (response) {

                    console.info("Modifica Cuarto en vivienda:");

                    $location.path("/misViviendas");
                    notificar('<i class="uk-thumbs-up"></i>  Editar Cuarto exitoso', 'success');


                }, function (error) {

                    console.info("-----------------ERROR SERVICIO------------------------");
                    console.info(error);
                    notificar('<i class="uk-icon-warning"></i>  Problema al editar Cuarto S', 'danger');
                    activaBoton();
                });



    };

});


app.controller('editCuartoCaracCtrl', function ($scope, $http, $location, usuarioService, viviendaService, CONSTANT) {
    var pantalla = pantallaCarga();

    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 4 || viviendaService.getCuartoId() === undefined) {
        $location.path("/inicio");
        pantalla.finish();
    }

    $scope.master = {};

    $scope.user = parseInt(usuarioService.parseId());

    var idCuartoPre = viviendaService.getCuartoId();
    console.log("recibe id cuarto: " + idCuartoPre);
    var cuartoPromise = viviendaService.getCaracByRoomId(idCuartoPre);
    cuartoPromise.then(function (result) {
        $scope.cuarto = result;
        console.info("REGRESA Cuarto Promise:  " + result.furniture);

        precargarCheckbox($scope.cuarto.furniture, "prestaClass");
    });

    console.info("ENTRO Editar Carac Cuarto");
    pantalla.finish();


    $scope.edita = function (form, cuarto) {

        desactivaBoton();

        var elementsFurniture = getChosenFurnitureSingle();
        console.dir(elementsFurniture);

        if (elementsFurniture === undefined || elementsFurniture.length === 0) {

            notificar('<i class="uk-icon-warning"></i>  Debe añadir al menos una característica', 'warning');
            activaBoton();
            return false;
        }

        var objMongo = new Object();

        objMongo.furniture = elementsFurniture;


        $http.put('/api/house/furniture/' + idCuartoPre, objMongo)
                .success(function (data) {

                    console.info("UPDATE VIVIENDA EN MONGO");
                    $location.path("/misViviendas");
                    notificar('<i class="uk-thumbs-up"></i>  Editar características cuarto exitoso', 'success');

                })
                .error(function (data) {
                    console.log('Error MONGO: ' + data);
                    notificar('<i class="uk-icon-warning"></i>  Problema al actualizar vivienda M', 'danger');
                    activaBoton();

                });




    }

});

app.controller('editCuartoImagesCtrl', function ($scope, $http, $location, usuarioService, viviendaService, CONSTANT) {

    var pantalla = pantallaCarga();

    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 4 || viviendaService.getCuartoId() === undefined) {
        $location.path("/inicio");
        pantalla.finish();
    }

    $scope.user = parseInt(usuarioService.parseId());


    $scope.master = {};
    $scope.tituloTouched = false;

    $scope.reset = function () {
        $scope.cuarto = angular.copy($scope.master);
        $scope.tituloTouched = false;

    };

    console.info("ENTRO AGREGAR Cuarto");
    pantalla.finish();


    var idCuartoPre = viviendaService.getCuartoId();

    var cuartoPromise = viviendaService.getCuartoById(idCuartoPre);
    cuartoPromise.then(function (result) {
        $scope.cuarto = result;
        console.info("REGRESA Cuarto Promise:  " + result);
    });

    $scope.edita = function (form, cuarto) {

        console.log("EDITA CUARTO?");
        desactivaBoton();
        cuarto.portada = document.getElementById("pathHidden").value;
        console.dir(cuarto);


        if (cuarto.portada === undefined || cuarto.portada.length === 0)
        {
            notificar('<i class="uk-icon-warning"></i>  Debe añadir una foto del cuarto', 'warning');
            activaBoton();
            return false;
        }
        if (cuarto === undefined)
        {
            notificar('<i class="uk-icon-warning"></i>  Cuarto incompleto, llene el registro.', 'warning');
            activaBoton();
            return false;
        }



        var jsonString = JSON.stringify(cuarto);


        $http.put(CONSTANT.URLWSCUARTOS, jsonString).
                then(function (response) {

                    console.info("Modifica Cuarto en vivienda:");

                    $location.path("/misViviendas");
                    notificar('<i class="uk-thumbs-up"></i>  Editar Cuarto exitoso', 'success');


                }, function (error) {

                    console.info("-----------------ERROR SERVICIO------------------------");
                    console.info(error);
                    notificar('<i class="uk-icon-warning"></i>  Problema al editar Cuarto S', 'danger');
                    activaBoton();
                });



    };

});


app.controller('editViviendaCtrl', function ($scope, $http, $location, usuarioService, viviendaService, CONSTANT) {
    var pantalla = pantallaCarga();

    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 4 || viviendaService.getId() === undefined) {
        $location.path("/inicio");
        pantalla.finish();
    }

    $scope.master = {};

    $scope.m2Touched = false;
    $scope.precioTouched = false;

    console.info("LLEGA PARAMETRO A EDITAR " + viviendaService.getId());
    var idViviendaPre = viviendaService.getId();

    var viviendaPromise = viviendaService.getById(idViviendaPre);
    viviendaPromise.then(function (result) {
        $scope.vivienda = result;
        console.info("REGRESA Vivienda Promise:  " + result);
    });

    $scope.reset = function () {
        //$scope.vivienda = angular.copy($scope.master);
        $scope.m2Touched = false;
        $scope.precioTouched = false;
    };

    $scope.user = parseInt(usuarioService.parseId());

    var ob = new Object();
    var ob1 = new Object();

    pantalla.finish();
    $scope.edita = function (form, vivienda) {

        desactivaBoton();

        console.dir(form);
        console.dir(vivienda);

        if (vivienda.precio === 'NaN') {

            notificar('<i class="uk-icon-warning"></i>  El precio debe ser un número.', 'warning');
            activaBoton();
            return false;
        }

        if (vivienda.m2 === 'NaN') {

            notificar('<i class="uk-icon-warning"></i>  Los metros deben ser un número.', 'warning');
            activaBoton();
            return false;
        }


        var jsonString = JSON.stringify(vivienda);


        $http.put(CONSTANT.URLWSVIVIENDAS, jsonString).
                then(function (response) {

                    console.info("Actualiza VIVIENDA:");
                    notificar('<i class="uk-thumbs-up"></i>  Actualización exitosa', 'success');
                    $location.path("/misViviendas");
                    activaBoton();
                }, function (error) {

                    console.info("-----------------ERROR SERVICIO------------------------");
                    console.info(error);
                    notificar('<i class="uk-icon-warning"></i>  Problema al actualizar vivienda S', 'danger');
                    activaBoton();
                });


    };

});

app.controller('editViviendaCaracCtrl', function ($scope, $http, $location, usuarioService, viviendaService, CONSTANT) {
    var pantalla = pantallaCarga();

    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 4 || viviendaService.getId() === undefined) {
        $location.path("/inicio");
        pantalla.finish();
    }

    $scope.master = {};

    $scope.user = parseInt(usuarioService.parseId());

    console.info("LLEGA PARAMETRO A EDITAR " + viviendaService.getId());
    var idViviendaPre = viviendaService.getId();

    var viviendaPromise = viviendaService.getCaracById(idViviendaPre);
    viviendaPromise.then(function (result) {
        $scope.vivienda = result;
        console.info("REGRESA Vivienda Promise:  " + result);
        console.log($scope.vivienda.characteristics);

        precargarCheckbox($scope.vivienda.characteristics, "caracClass");
        precargarCheckbox($scope.vivienda.services, "serviciosClass");
        precargarCheckbox($scope.vivienda.features, "amenidadesClass");

    });


    console.info("ENTRO Editar Carac VIVIENDA");
    pantalla.finish();


    $scope.edita = function (form, vivienda) {

        desactivaBoton();

        var servicios = getChosenServices();
        var amenidades = getChosenFeatures();
        var caracVivienda = getChosenCharac();

        console.dir(servicios);
        console.dir(amenidades);
        console.dir(caracVivienda);


        if (caracVivienda === undefined || caracVivienda.length === 0) {

            notificar('<i class="uk-icon-warning"></i>  Debe añadir al menos característica.', 'warning');
            activaBoton();
            return false;
        }

        if (servicios === undefined || servicios.length === 0) {

            notificar('<i class="uk-icon-warning"></i>  Debe añadir al menos un servicio.', 'warning');
            activaBoton();
            return false;
        }

        if (amenidades === undefined || amenidades.length === 0) {

            notificar('<i class="uk-icon-warning"></i>  Debe añadir al menos una amenidad ó área común.', 'warning');
            activaBoton();
            return false;
        }


        var objMongo = new Object();


        objMongo.services = servicios;
        objMongo.features = amenidades;
        objMongo.characteristics = caracVivienda;


        $http.put('/api/house/' + $scope.vivienda.id_house, objMongo)
                .success(function (data) {

                    console.info("UPDATE VIVIENDA EN MONGO");
                    $location.path("/misViviendas");
                    notificar('<i class="uk-thumbs-up"></i>  Editar características vivienda exitoso', 'success');

                })
                .error(function (data) {
                    console.log('Error MONGO: ' + data);
                    notificar('<i class="uk-icon-warning"></i>  Problema al actualizar vivienda M', 'danger');
                    activaBoton();

                });




    }

});

app.controller('editViviendaImagesCtrl', function ($scope, $http, $location, usuarioService, viviendaService, CONSTANT) {
    var pantalla = pantallaCarga();

    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 4 || viviendaService.getId() === undefined) {
        $location.path("/inicio");
        pantalla.finish();
    }

    $scope.master = {};

    $scope.user = parseInt(usuarioService.parseId());

    console.info("LLEGA PARAMETRO A EDITAR " + viviendaService.getId());
    var idViviendaPre = viviendaService.getId();

    var viviendaPromise = viviendaService.getCaracById(idViviendaPre);
    viviendaPromise.then(function (result) {
        $scope.vivienda = result;
        console.info("REGRESA Vivienda Promise:  " + result);


    });


    console.info("ENTRO Editar Images VIVIENDA");

    pantalla.finish();

    $scope.edita = function (form, vivienda) {

        desactivaBoton();

        var newImages = [];
        var updatedImg = getUpdatedImg();

        console.dir(updatedImg);

        if (updatedImg.length > 0) {

            newImages.concat(updatedImg);

            updatedImg.forEach(function (element) {

                newImages.push(element.path);
            });
            console.log("C1");
        }

        if (pathACList !== undefined && pathACList.length > 0) {

            pathACList.forEach(function (element) {

                newImages.push(element);
            });
            console.log("C2");
        }


        console.dir(newImages);

        if (newImages === undefined || newImages.length === 0) {

            notificar('<i class="uk-icon-warning"></i>  Debe añadir o dejar al menos una foto.', 'warning');
            activaBoton();
            return false;
        }

        if (newImages.length >= 5) {

            notificar('<i class="uk-icon-warning"></i>  No puedes agregar más de 5 fotos. Intenta de nuevo.', 'warning');
            activaBoton();
            $location.path("/misViviendas");
            return false;
        }

        var objMongo = new Object();

        var pathArray = [];

        if (newImages.length > 0) {
            newImages.forEach(function (element) {
                var objPath = new Object();
                objPath.path = element;
                pathArray.push(objPath);
            });

            objMongo.images = pathArray;
        }
        console.log("Imagenes a subir: " + objMongo.images);
        activaBoton();

        $http.put('/api/house/images/' + $scope.vivienda.id_house, objMongo)
                .success(function (data) {

                    console.info("UPDATE VIVIENDA EN MONGO");
                    $location.path("/misViviendas");
                    notificar('<i class="uk-thumbs-up"></i>  Actualizar imágenes vivienda exitoso', 'success');

                })
                .error(function (data) {
                    console.log('Error MONGO: ' + data);
                    notificar('<i class="uk-icon-warning"></i>  Problema al actualizar vivienda M', 'danger');
                    activaBoton();

                });

    };

});

app.controller('consultarViviendaCtrl', function ($scope, $http, $routeParams, $window, $location, $rootScope, viviendaService, usuarioService, metaService, CONSTANT, EMAIL) {
    var pantalla = pantallaCarga();

    $scope.userSes = usuarioService.getSessionUser();


    console.log("USER SES");
    console.dir($scope.userSes);

    if ($routeParams.id !== undefined) {
        viviendaService.sendId($routeParams.id);
    }
    if ($scope.userSes !== undefined) {
        alreadyRoomie();
    }

    console.info("LLEGA PARAMETRO  " + viviendaService.getId());
    if (viviendaService.getId() === undefined) {
        $location.path("/inicio");
    }

    $scope.fechaApp = new Date();
    $scope.today = new Date();
    $scope.precioApp = "";
    $scope.idCuartoApp = "";


    $http.get(CONSTANT.URLWSVIVIENDAS + viviendaService.getId()).
            then(function (response) {
                $scope.vivienda = response.data;
                console.info("CONSULTA UN REGISTRO VIVIENDA:::: " + response.data.titulo);

                //$window.map = getHouseMap($scope.vivienda.direccion);
                $window.map = getMapLat($scope.vivienda.latitud, $scope.vivienda.longitud);


                //META desc url title image
                $rootScope.metaservice = metaService;
                $rootScope.metaservice.set($scope.vivienda.detalle, window.location.href, $scope.vivienda.titulo, $scope.vivienda.portada);


                //CONSULTA INFO Responsable
                $http.get(CONSTANT.URLWSUSUARIOS + response.data.idResponsable).
                        then(function (response) {
                            
                            console.log("RESPONSIBLE DATA");
                            $scope.responsable = response.data;
                             
                             console.dir($scope.responsable = response.data);
                            var hostPromise = usuarioService.getUserCharac($scope.responsable.idUsuario);
                            hostPromise.then(function (result) {
                                $scope.host = result.data;
                                console.dir($scope.host);


                                if ($scope.host.rates !== undefined && $scope.host.rates.length > 0) {

                                    $scope.promedioHost = (avgRate($scope.host.rates)).toFixed(2);
                                    $scope.redondeadoHost = Math.round($scope.promedioHost);
                                } else {

                                    $scope.promedioHost = "S/N";
                                    $scope.redondeadoHost = "S/N";
                                }

                                console.log("CALIF:  " + $scope.redondeadoHost);



                            });





                        }, function (error) {

                            console.info("------------------ERROR SERVICIO USUARIO-----------------------");
                            console.info(error);
                        }
                        );


                var objMongo = new Object();
                $http.get('/api/house/' + viviendaService.getId(), objMongo)
                        .success(function (data) {

                            $scope.house = data;


                            if (data.rates !== undefined && data.rates.length > 0) {

                                $scope.promedio = (avgRate(data.rates)).toFixed(2);
                                $scope.redondeado = Math.round($scope.promedio);
                            } else {

                                $scope.promedio = "S/N";
                                $scope.redondeado = "S/N";
                            }


                            if ($scope.house.rates.length > 0) {
                                if ($scope.house.rates.length > 6) {

                                    $scope.calif = $scope.house.rates.slice(0, 6);
                                } else {

                                    $scope.calif = $scope.house.rates;
                                }
                            }

                            //Merge1
                            for (var i = 0; i < $scope.vivienda.recamaras.length; i++) {
                                for (var j = 0; j < $scope.house.rooms.length; j++) {

                                    if ($scope.vivienda.recamaras[i].idCuarto === $scope.house.rooms[j].id_room) {
                                        $scope.vivienda.recamaras[j].isRoomFull = isRoomFull($scope.house.living, $scope.house.rooms[j].id_room);
                                        $scope.vivienda.recamaras[i].muebles = $scope.house.rooms[j].furniture;

                                        break;
                                    }

                                }
                            }

                            console.info("GET ROOMIES de HOUSE " + data.living);

                            var livingAux = [];
                            var usernameStr = "";

                            var idLivingStr = "";

                            if ($scope.house.living.length > 0 && !$scope.vivienda.rentaCuarto) {

                                $scope.isHouseFull = true;

                            }
                            data.living.forEach(function (element) {
                                console.log(element);


                                if (idLivingStr === "") {
                                    idLivingStr = element.id_living;
                                } else {
                                    idLivingStr = element.id_living + "-" + idLivingStr;
                                }

                            });

                            console.log("LIVING STR" + idLivingStr);

                            if (idLivingStr !== "") {
                                $http.get(CONSTANT.URLWSUSUARIOSIN + idLivingStr).
                                        then(function (response) {
                                            //livingAux.push(response.data);
                                            console.info("CONSULTA UN REGISTRO USUARIO LIVING:::: " + response.data);
                                            //livingAux = response.data;

                                            response.data.forEach(function (element, idx, array) {

                                                if (isNaN(element)) {

                                                    element.edad = calcularEdad(element.fechaNac);
                                                    livingAux.push(element);


                                                }

                                                if (idx === array.length - 1) {
                                                    console.log("Last callback call at index " + idx + " with value " + element);

                                                    var objMongoUser = new Object();
                                                    $http.get('/api/usersBy/' + idLivingStr, objMongoUser)
                                                            .success(function (data) {
                                                                console.log("Caracteristicas de roomies");
                                                                console.dir(data);

                                                                mergeUserArrays(data);
                                                            });

                                                }

                                                console.log("USERS MERGEADOS");
                                                console.dir(livingAux);
                                                //recargaBandera("MR");

                                            });
                                        }, function (error) {

                                            console.info("-----------------ERROR IN USUARIOS------------------------");
                                            console.info(error);
                                        }
                                        );
                            }
                            console.log("TERMINAMOS DE PROCESAR");
                            console.dir(data.images);
                            $scope.roomies = livingAux;




                        });

            }, function (error) {

                console.info("-----------------------------------------");
                console.info(error);
            }
            );


    pantalla.finish();

    $scope.cargaDatosApp = function (precio, idCuarto) {
        console.log("CARAG DATOS");
        console.dir($scope.userSes);

        if ($scope.userSes.completo === false) {

            notificar('<i class="uk-icon-home"></i>  Completa tu perfil para poder aplicar', 'warning');
            $location.path("/complementRoomie");


        } else if ($scope.userSes.completo === true) {
            console.log("Carga " + precio + " " + idCuarto);
            $scope.precioApp = precio;
            $scope.idCuartoApp = idCuarto;
            $scope.mesesEstadia = "";
            $scope.fechaApp = "";
        }
    };



    $scope.aplica = function (precio, idCuarto) {
        console.info("APLICA a vivienda:  ");

        console.log(precio + " " + idCuarto);
        if ($scope.fechaApp === undefined || $scope.fechaApp === "") {
            notificar('<i class="uk-icon-home"></i>  Fecha de inicio no válida!', 'warning');
            return;
        }

        if ($scope.mesesEstadia === undefined || $scope.mesesEstadia === "") {
            notificar('<i class="uk-icon-home"></i>  Introduzca número de meses de estadía', 'warning');
            return;
        }

        if ($scope.alreadyRoomie) {
            notificar('<i class="uk-icon-home"></i>  Ya tienes asignado un hogar. Para volver a aplicar a otras opciones, termina tu contrato con tu actual anfitrión', 'warning');
        } else if (!$scope.alreadyRoomie) {
            if (alreadyAspirant()) {

                if (idCuarto !== undefined) {
                    notificar('<i class="uk-icon-home"></i>  ¡Ya has aplicado a esta vivienda!', 'warning');
                } else {

                    notificar('<i class="uk-icon-home"></i>  ¡Ya has aplicado a esta vivienda!', 'warning');
                }

            } else {
                var objMongo = new Object();

                objMongo.idAsp = $scope.userSes.idUsuario;
                objMongo.price = precio;
                objMongo.startAt = $scope.fechaApp;
                objMongo.months = $scope.mesesEstadia;

                if (idCuarto !== undefined || idCuarto !== '') {
                    objMongo.idCuarto = idCuarto;
                    console.log("Por cuarto " + idCuarto);
                }



                $http.put('/api/house/aspirant/' + viviendaService.getId(), objMongo)
                        .success(function (data) {

                            console.info("ACTUALIZA ASPIRANTE EN MONGO");

                            notificar('<i class="uk-icon-home"></i>  ¡Tu aplicación está en proceso!', 'success');


                            var notificacion = new Object();

                            notificacion.id_sender = $scope.userSes.idUsuario;
                            notificacion.content = "Solicitud de " + $scope.userSes.nombreUsuario;
                            notificacion.link = "misViviendas";

                            usuarioService.creaNotificacion($scope.responsable.idUsuario, notificacion);


                            /********************************************************CORREO********************************************************************************/
                            var correo = new Object();
                            correo.asunto = "A " + $scope.userSes.nombreUsuario + " le interesa tu vivienda";
                            correo.destinatarios = ["support@roomiesoftheworld.com", $scope.responsable.correoElectronico];
                            correo.plantilla = EMAIL.APLICACION_RECIBIDA;

                            var parametrosCorreo = new Object();
                            parametrosCorreo.nombreAnfitrion = $scope.responsable.nombre + " " + $scope.responsable.primerApellido;
                            parametrosCorreo.nombreRoomie = $scope.userSes.nombreUsuario;

                            correo.parametros = parametrosCorreo;


                            usuarioService.enviarCorreo(correo);
                            /********************************************************FIN CORREO*****************************************************************************/


                            $location.path("/misAplicaciones");



                        })
                        .error(function (data) {
                            console.log('Error MONGO: ' + data);
                            notificar('<i class="uk-icon-home"></i>  ¡Error al aplicar!', 'danger');
                        });

            }
        }


    };


    function alreadyAspirant() {

        var hasApplication = false;


        if ($scope.house.aspirants.length > 0) {
            for (var i = 0; i < $scope.house.aspirants.length; i++) {
                console.dir($scope.house.aspirants);
                console.dir($scope.house.aspirants[i]);

                if ($scope.house.aspirants[i].id_aspirant === $scope.userSes.idUsuario) {
                    hasApplication = true;
                    break;
                }

            }
        }


        return hasApplication;
    }

    function alreadyRoomie() {

        $http.get('/api/myHome/' + $scope.userSes.idUsuario)
                .success(function (data) {

                    if (data === null || data === "null") {

                        $scope.alreadyRoomie = false;

                    } else {

                        $scope.alreadyRoomie = true;

                    }
                })
                .error(function (data) {
                    console.log('Error MONGO: ' + data);

                });

        // return isRoomie;
    }

    //Usuario 
    $scope.loadParams = function (idCuartoView) {

        console.info("LOAD PARAMS Cuarto " + idCuartoView);
        viviendaService.sendId(idCuartoView);

        console.log();
        $scope.idCuartoChosen = idCuartoView;


    };


    $scope.loadDetalleCuarto = function (idCuartoView) {
        viviendaService.sendCuartoId(idCuartoView);
        console.info("LOAD DETALLE Cuarto" + idCuartoView);
        $location.path("/consultarCuarto/" + idCuartoView);

    };


    $scope.irLogin = function () {
        cerrarModal();
        $location.path("/login");

    };

    function mergeUserArrays(mongoArray) {

        for (var i = 0; i < $scope.roomies.length; i++) {


            for (var j = 0; j < mongoArray.length; j++) {

                if ($scope.roomies[i].idUsuario === mongoArray[j].id_user) {
                    $scope.roomies[i].caracter = mongoArray[j].characteristics;
                    break;
                }

            }

        }
    }

});


app.controller('consultarCuartoCtrl', function ($scope, $http, $routeParams, $location, viviendaService, usuarioService, CONSTANT, EMAIL) {
    var pantalla = pantallaCarga();

    $scope.userSes = usuarioService.getSessionUser();

    if ($routeParams.id !== undefined) {
        viviendaService.sendId($routeParams.id);
    }
    if ($scope.userSes !== undefined) {
        alreadyRoomie();
    }

    console.info("LLEGA PARAMETRO  " + viviendaService.getCuartoId());
    if (viviendaService.getCuartoId() === undefined) {
        $location.path("/inicio");
    }

    $http.get(CONSTANT.URLWSCUARTOS + viviendaService.getCuartoId()).
            then(function (response) {
                $scope.cuarto = response.data;
                $scope.isRoomFull = false;

                //CONSULTA INFO Responsable
                $http.get(CONSTANT.URLWSUSUARIOS + response.data.idVivienda.idResponsable).
                        then(function (response) {
                            $scope.responsable = response.data;
                        }, function (error) {

                            console.info("------------------ERROR SERVICIO USUARIO-----------------------");
                            console.info(error);
                        }
                        );


                var objMongo = new Object();
                $http.get('/api/house/' + response.data.idVivienda.idVivienda, objMongo)
                        .success(function (data) {
                            //recorre House
                            $scope.house = data;
                            data.rooms.forEach(function (element) {
                                console.log(element.id_room);
                                if (element.id_room === viviendaService.getCuartoId()) {
                                    $scope.room = element;


                                    data.living.forEach(function (eleliving) {
                                        console.log(eleliving.id_room);
                                        if (eleliving.id_room === element.id_room) {
                                            $scope.isRoomFull = true;
                                        }

                                    });
                                }

                            });





                        });

            }, function (error) {

                console.info("-----------------------------------------");
                console.info(error);
            }
            );


    pantalla.finish();


    $scope.cargaDatosApp = function (precio, idCuarto) {
        if ($scope.userSes.completo === false) {

            notificar('<i class="uk-icon-home"></i>  Completa tu perfil para poder aplicar', 'warning');
            $location.path("/complementRoomie");


        } else if ($scope.userSes.completo === true) {
            console.log("Carga " + precio + " " + idCuarto);
            $scope.precioApp = precio;
            $scope.idCuartoApp = idCuarto;
            $scope.mesesEstadia = "";
            $scope.fechaApp = "";

        }
    };

    $scope.aplica = function (precio, idCuarto) {
        console.info("APLICA a cuarto:  ");

        if ($scope.alreadyRoomie) {
            notificar('<i class="uk-icon-home"></i>  Ya tienes asignado un hogar. Para volver a aplicar a otras opciones, termina tu contrato con tu actual anfitrión', 'warning');
        } else if (!$scope.alreadyRoomie) {
            if (alreadyAspirant()) {

                if (idCuarto !== undefined) {
                    notificar('<i class="uk-icon-home"></i>  ¡Ya has aplicado a esta vivienda!', 'warning');
                } else {

                    notificar('<i class="uk-icon-home"></i>  ¡Ya has aplicado a esta vivienda!', 'warning');
                }

            } else {
                var objMongo = new Object();

                objMongo.idAsp = $scope.userSes.idUsuario;
                objMongo.price = precio;
                objMongo.startAt = $scope.fechaApp;
                objMongo.months = $scope.mesesEstadia;

                if (idCuarto !== undefined) {
                    objMongo.idCuarto = idCuarto;
                    objMongo.price = precio;
                    console.log("Por cuarto " + idCuarto);
                    console.log("precio " + precio);

                }



                $http.put('/api/house/aspirant/' + $scope.house.id_house, objMongo)
                        .success(function (data) {

                            console.info("ACTUALIZA ASPIRANTE EN MONGO");

                            notificar('<i class="uk-icon-home"></i>  ¡Tu aplicación está en proceso!', 'success');




                            /********************************************************CORREO********************************************************************************/
                            var correo = new Object();
                            correo.asunto = "A " + $scope.userSes.nombreUsuario + " le interesa tu cuarto";
                            correo.destinatarios = ["support@roomiesoftheworld.com", $scope.responsable.correoElectronico];
                            correo.plantilla = EMAIL.APLICACION_RECIBIDA;

                            var parametrosCorreo = new Object();
                            parametrosCorreo.nombreAnfitrion = $scope.responsable.nombre + " " + $scope.responsable.primerApellido;
                            parametrosCorreo.nombreRoomie = $scope.userSes.nombreUsuario;
                            correo.parametros = parametrosCorreo;


                            usuarioService.enviarCorreo(correo);
                            /********************************************************FIN CORREO*****************************************************************************/





                            $location.path("/misAplicaciones");

                        })
                        .error(function (data) {
                            console.log('Error MONGO: ' + data);
                            notificar('<i class="uk-icon-home"></i>  ¡Error al aplicar!', 'danger');
                        });

            }
        }







    };

    $scope.irLogin = function () {
        cerrarModal();
        $location.path("/login");

    };



    function alreadyRoomie() {

        $http.get('/api/myHome/' + $scope.userSes.idUsuario)
                .success(function (data) {

                    if (data === null || data === "null") {

                        $scope.alreadyRoomie = false;

                    } else {

                        $scope.alreadyRoomie = true;

                    }
                })
                .error(function (data) {
                    console.log('Error MONGO: ' + data);

                });

        // return isRoomie;
    }
    function alreadyAspirant() {

        var hasApplication = false;


        if ($scope.house.aspirants.length > 0) {
            for (var i = 0; i < $scope.house.aspirants.length; i++) {
                console.dir($scope.house.aspirants);
                console.dir($scope.house.aspirants[i]);

                if ($scope.house.aspirants[i].id_aspirant === $scope.userSes.idUsuario) {
                    hasApplication = true;
                    break;
                }

            }
        }


        return hasApplication;
    }

    //Usuario 
    $scope.loadParams = function (idCuartoView) {

        console.info("LOAD PARAMS Cuarto " + idCuartoView);
        viviendaService.sendId(idCuartoView);

        console.log();
        $scope.idCuartoChosen = idCuartoView;



    };

});


app.controller('consultarViviendasByResponsableCtrl', function ($scope, $http, $location, viviendaService, usuarioService, contractService, CONSTANT) {
    var pantalla = pantallaCarga();

    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 4) {
        $location.path("/inicio");
        pantalla.finish();
    }

    console.log("ENTRO A MIS VIVIENDAS");
    pantalla.finish();
    $http.get(CONSTANT.URLWSVIVIENDASBYRESPONSABLE + usuarioService.parseId()).
            then(function (response) {

                var listaViviendas = [];
                var housestr = "";

                response.data.forEach(function (element) {

                    if (isNaN(element)) {
                        listaViviendas.push(element);


                        if (housestr === "") {
                            housestr = element.idVivienda;
                        } else {
                            housestr = element.idVivienda + "-" + housestr;
                        }

                    }

                });



                $http.get('/api/housesStr/' + housestr)
                        .success(function (data) {

                            listaViviendas = mergeHouseArrays(listaViviendas, data);

                            $scope.viviendas = listaViviendas;

                        })
                        .error(function (data) {
                            console.log('Error MONGO: ' + data);

                        });





            }, function (error) {

                console.info("------------------ERROR-----------------------");
                console.info(error);
            }
            );


    $scope.loadDetalle = function (idViviendaView) {
        console.info("Ver SEND " + idViviendaView);
        viviendaService.sendId(idViviendaView);

        $location.path("/consultarVivienda/" + idViviendaView);

    };

    $scope.loadDetalleManage = function (idViviendaView) {
        console.info("Ver SEND " + idViviendaView);
        viviendaService.sendId(idViviendaView);

        $location.path("/manageVivienda");

    };

    $scope.loadDetallePrecio = function (idViviendaView) {
        console.info("EDITAR SEND " + idViviendaView);
        viviendaService.sendId(idViviendaView);

        $location.path("/editVivienda");

    };

    $scope.loadDetalleCarac = function (idViviendaView) {
        console.info("EDITAR SEND " + idViviendaView);
        viviendaService.sendId(idViviendaView);

        $location.path("/editViviendaCarac");

    };


    $scope.loadDetalleImages = function (idViviendaView) {
        console.info("EDITAR SEND " + idViviendaView);
        viviendaService.sendId(idViviendaView);

        $location.path("/editViviendaImages");

    };


    $scope.loadAddCuarto = function (idViviendaView) {
        viviendaService.sendId(idViviendaView);
        console.info("LOAD DETALLE " + idViviendaView);
        $location.path("/addCuarto");

    };


    function mergeHouseArrays(wsArray, mongoArray) {

        for (var i = 0; i < wsArray.length; i++) {


            for (var j = 0; j < mongoArray.length; j++) {


                if (wsArray[i].idVivienda === mongoArray[j].id_house) {
                    wsArray[i].common = mongoArray[j];

                    if (mongoArray[j].rates !== undefined && mongoArray[j].rates.length > 0) {

                        wsArray[i].promedio = (avgRate(mongoArray[j].rates)).toFixed(2);
                        wsArray[i].redondeado = Math.round(wsArray[i].promedio);
                    } else {

                        wsArray[i].promedio = "S/N";
                        wsArray[i].redondeado = "S/N";
                    }

                    break;
                }

            }

        }

        return wsArray;
    }



});

app.controller('consultarMiHogarCtrl', function ($scope, $http, $window, $location, $route, viviendaService, usuarioService, CONSTANT, EMAIL) {
    var pantalla = pantallaCarga();

    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 3) {
        $location.path("/inicio");
        pantalla.finish();
    }

    console.log("ENTRO A MI HOGAR");
    pantalla.finish();

    var objMongoMyHome = new Object();
    $http.get('/api/myHome/' + $scope.userSes.idUsuario, objMongoMyHome)
            .success(function (data) {

                console.dir(data);
                if (data === null || data === "null") {
                    $location.path("/perfil");
                    notificar('<i class="uk-icon-warning"></i>  Aún no tienes un hogar designado', 'warning');

                } else {
                    $scope.house = data;

                    $scope.promedio = (avgRate(data.rates)).toFixed(2);
                    $scope.redondeado = Math.round($scope.promedio);
                    $scope.noCheckIn = false;

                    $http.get(CONSTANT.URLWSVIVIENDAS + data.id_house).
                            then(function (response) {
                                $scope.vivienda = response.data;
                                console.info("CONSULTA UN REGISTRO VIVIENDA:::: " + response.data.titulo);

                                $window.map = getMapLat($scope.vivienda.latitud, $scope.vivienda.longitud);
                                //$window.map = getHouseMap($scope.vivienda.direccion);
                                //CONSULTA INFO Responsable
                                $http.get(CONSTANT.URLWSUSUARIOS + response.data.idResponsable).
                                        then(function (response) {
                                            $scope.responsable = response.data;

                                        }, function (error) {

                                            console.info("------------------ERROR SERVICIO USUARIO-----------------------");
                                            console.info(error);
                                        }
                                        );

                                //Merge1
                                for (var i = 0; i < $scope.vivienda.recamaras.length; i++) {
                                    for (var j = 0; j < $scope.house.rooms.length; j++) {

                                        if ($scope.vivienda.recamaras[i].idCuarto === $scope.house.rooms[j].id_room) {
                                            $scope.vivienda.recamaras[i].muebles = $scope.house.rooms[j].furniture;
                                            break;
                                        }

                                    }
                                }

                                if ($scope.vivienda.rentaCuarto) {

                                    console.info("GET ROOMIES de HOUSE " + $scope.house.living);

                                    var livingAux = [];
                                    var usernameStr = "";

                                    var idLivingStr = "";

                                    $scope.house.living.forEach(function (element) {
                                        console.log(element);

                                        if (element.id_room !== undefined) {
                                            if (element.id_living === $scope.userSes.idUsuario) {
                                                $scope.rentaMensual = element.price;
                                                $scope.appli = element;

                                                if (element.id_contract !== undefined) {

                                                    var checkInPromise = usuarioService.getCheckInRoomie(element.id_contract);
                                                    checkInPromise.then(function (result) {
                                                        $scope.noCheckIn = result.data.roomieCheckinSt;
                                                        console.log("NOCHECKIN " + $scope.noCheckIn);


                                                    });
                                                }

                                                for (var i = 0; i < $scope.vivienda.recamaras.length; i++) {
                                                    if ($scope.vivienda.recamaras[i].idCuarto === element.id_room) {
                                                        $scope.miCuarto = $scope.vivienda.recamaras[i];

                                                        break;
                                                    }


                                                }
                                            }
                                        }

                                        if (idLivingStr === "") {
                                            idLivingStr = element.id_living;
                                        } else {
                                            idLivingStr = element.id_living + "-" + idLivingStr;
                                        }

                                    });



                                    console.log("LIVING STR" + idLivingStr);

                                    if (idLivingStr !== "") {
                                        $http.get(CONSTANT.URLWSUSUARIOSIN + idLivingStr).
                                                then(function (response) {

                                                    console.info("CONSULTA UN REGISTRO USUARIO LIVING:::: " + response.data);

                                                    response.data.forEach(function (element, idx, array) {

                                                        if (isNaN(element)) {
                                                            livingAux.push(element);
                                                            console.dir(element.nombreUsuario);
                                                            if (usernameStr === "") {
                                                                usernameStr = element.nombreUsuario;
                                                            } else {
                                                                usernameStr = element.nombreUsuario + "-" + usernameStr;
                                                            }

                                                        }

                                                        if (idx === array.length - 1) {
                                                            console.log("Last callback call at index " + idx + " with value " + element);
                                                            console.log(usernameStr);

                                                            var objMongoUser = new Object();
                                                            $http.get('/api/usersBy/' + idLivingStr, objMongoUser)
                                                                    .success(function (data) {
                                                                        console.log("Caracteristicas de roomies");
                                                                        console.dir(data);

                                                                        mergeUserArrays(data);
                                                                    });

                                                        }



                                                    });
                                                }, function (error) {

                                                    console.info("-----------------ERROR IN USUARIOS------------------------");
                                                    console.info(error);
                                                }
                                                );
                                    }

                                    $scope.roomies = livingAux;

                                } else {

                                    for (var i = 0; i < $scope.house.living.length; i++) {
                                        if ($scope.house.living[i].id_living === $scope.userSes.idUsuario) {
                                            $scope.appli = $scope.house.living[i];
                                            $scope.rentaMensual = $scope.appli.price;
                                            if ($scope.appli.id_contract !== undefined) {

                                                var checkInPromise = usuarioService.getCheckInRoomie($scope.appli.id_contract);
                                                checkInPromise.then(function (result) {
                                                    $scope.noCheckIn = result.data.roomieCheckinSt;


                                                });
                                            }


                                            break;
                                        }
                                    }
                                }


                            }, function (error) {

                                console.info("-----------------------------------------");
                                console.info(error);
                            }
                            );
                }

            })
            .error(function (data) {
                console.log('Error MONGO: ' + data);
            });


    $scope.calificarMiHogar = function (idViviendaView) {
        viviendaService.sendId(idViviendaView);
        console.info("LOAD PARAMS " + idViviendaView);
        var objMongo = new Object();
        objMongo.stars = parseInt(document.getElementById('ratingHouse').value);
        objMongo.idUser = usuarioService.getSessionUser().idUsuario;
        objMongo.content = $scope.content;
        objMongo.username = usuarioService.getSessionUser().nombreUsuario;
        objMongo.avatar = usuarioService.getSessionUser().avatar;
        objMongo.appli = $scope.appli;
        console.dir(usuarioService.getSessionUser());

        console.dir(objMongo);
        ///api/house/rate/
        $http.put('/api/house/rate/' + parseInt(idViviendaView), objMongo).
                then(function (data) {

                    console.info("Acualiza Rate:::: " + data);

                    cerrarModal();
                    notificar('<i class="uk-icon-star"></i>  ¡Calificación añadida!', 'success');
                    $route.reload();

                    var notificacion = new Object();

                    notificacion.id_sender = $scope.userSes.idUsuario;
                    notificacion.content = $scope.userSes.nombreUsuario + " ha terminado el contrato en tu vivienda";
                    notificacion.link = "misViviendas";

                    usuarioService.creaNotificacion($scope.responsable.idUsuario, notificacion);


                    /********************************************************CORREO********************************************************************************/
                    var correo = new Object();
                    correo.asunto = "Tu roomie " + $scope.userSes.nombreUsuario + " ha concluido su estancia";
                    correo.destinatarios = ["support@roomiesoftheworld.com", $scope.responsable.correoElectronico];
                    correo.plantilla = EMAIL.TERMINA_CONTRATO;

                    var parametrosCorreo = new Object();
                    parametrosCorreo.nombreAnfitrion = $scope.responsable.nombreUsuario;
                    correo.parametros = parametrosCorreo;


                    usuarioService.enviarCorreo(correo);
                    /********************************************************FIN CORREO*****************************************************************************/




                }, function (error) {

                    console.info("------------------ERROR MONGO-----------------------");
                    console.info(error);
                    cerrarModal();
                    notificar('<i class="uk-icon-warning"></i>  Error al añadir evaluación', 'danger');

                }
                );


    };


    $scope.loadParams = function (idResponsable) {

        viviendaService.sendId(idResponsable);



    };


    $scope.confirmar = function (idC) {

        var payload = new Object();

        if (idC !== undefined) {
            console.log(idC);
            payload.idContrato = idC;
            payload.roomieCheckinComment = $scope.comentario;

            var confirmadoPromise = viviendaService.confirmaLlegadaRoomie(payload);
            confirmadoPromise.then(function (result) {

                var notificacion = new Object();

                notificacion.id_sender = $scope.userSes.idUsuario;
                notificacion.content = $scope.userSes.nombreUsuario + " ha confirmado llegada";
                notificacion.link = "misViviendas";

                usuarioService.creaNotificacion($scope.responsable.idUsuario, notificacion);


            });


        }

    };

    function mergeUserArrays(mongoArray) {

        for (var i = 0; i < $scope.roomies.length; i++) {


            for (var j = 0; j < mongoArray.length; j++) {

                if ($scope.roomies[i].idUsuario === mongoArray[j].id_user) {
                    $scope.roomies[i].caracter = mongoArray[j].characteristics;

                    break;
                }

            }

        }


    }



});


app.controller('manageViviendaCtrl', function ($scope, $http, $window, $location, $route, viviendaService, usuarioService, CONSTANT, EMAIL) {
    var pantalla = pantallaCarga();

    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 4) {
        $location.path("/inicio");
        pantalla.finish();
    }

    $scope.currentConfirm = "";

    console.info("LLEGA PARAMETRO  " + viviendaService.getId());
    if (viviendaService.getId() === undefined) {
        $location.path("/inicio");
    }

    console.log("ENTRO A MANAGE VIVIENDA");
    pantalla.finish();


    $http.get(CONSTANT.URLWSVIVIENDAS + viviendaService.getId()).
            then(function (response) {
                $scope.vivienda = response.data;
                console.info("CONSULTA UN REGISTRO VIVIENDA:::: " + response.data.titulo);

                $window.map = getMapLat($scope.vivienda.latitud, $scope.vivienda.longitud);

                //CONSULTA INFO Responsable
                $http.get(CONSTANT.URLWSUSUARIOS + response.data.idResponsable).
                        then(function (response) {
                            $scope.responsable = response.data;
                        }, function (error) {

                            console.info("------------------ERROR SERVICIO USUARIO-----------------------");
                            console.info(error);
                        }
                        );


                var objMongo = new Object();
                $http.get('/api/house/' + viviendaService.getId(), objMongo)
                        .success(function (data) {

                            $scope.house = data;

                            $scope.promedio = (avgRate(data.rates)).toFixed(2);
                            if (isNaN($scope.promedio)) {
                                $scope.promedio = "S/C";
                                $scope.redondeado = "S/C";
                            } else {

                                $scope.redondeado = Math.round($scope.promedio);
                            }


                            //Merge1
                            for (var i = 0; i < $scope.vivienda.recamaras.length; i++) {
                                for (var j = 0; j < $scope.house.rooms.length; j++) {

                                    if ($scope.vivienda.recamaras[i].idCuarto === $scope.house.rooms[j].id_room) {
                                        $scope.vivienda.recamaras[j].isRoomFull = isRoomFull($scope.house.living, $scope.house.rooms[j].id_room);
                                        $scope.vivienda.recamaras[i].muebles = $scope.house.rooms[j].furniture;

                                        break;
                                    }

                                }
                            }

                            console.info("GET ROOMIES de HOUSE " + data.living);

                            var livingAux = [];

                            var idLivingStr = "";

                            data.living.forEach(function (element) {
                                console.log(element);


                                if (idLivingStr === "") {
                                    idLivingStr = element.id_living;
                                } else {
                                    idLivingStr = element.id_living + "-" + idLivingStr;
                                }

                            });

                            console.log("LIVING STR" + idLivingStr);

                            if (idLivingStr !== "") {
                                $http.get(CONSTANT.URLWSUSUARIOSIN + idLivingStr).
                                        then(function (response) {
                                            //livingAux.push(response.data);
                                            console.info("CONSULTA UN REGISTRO USUARIO LIVING:::: " + response.data);
                                            //livingAux = response.data;

                                            response.data.forEach(function (element, idx, array) {

                                                if (isNaN(element)) {

                                                    element.edad = calcularEdad(element.fechaNac);

                                                    livingAux.push(element);

                                                    for (var a = 0; a < $scope.roomies.length; a++) {

                                                        for (var b = 0; b < $scope.house.living.length; b++) {

                                                            if ($scope.house.living[b].id_living === $scope.roomies[a].idUsuario) {

                                                                $scope.roomies[a].appli = $scope.house.living[b];
                                                                console.log("WHATTT");
                                                                console.log($scope.roomies[a].appli.id_contract);

                                                                break;

                                                            }
                                                        }
                                                    }

                                                }

                                                if (idx === array.length - 1) {
                                                    console.log("Last callback call at index " + idx + " with value " + element);

                                                    var objMongoUser = new Object();
                                                    $http.get('/api/usersBy/' + idLivingStr, objMongoUser)
                                                            .success(function (data) {
                                                                console.log("Caracteristicas de roomies");
                                                                console.dir(data);

                                                                mergeUserArrays(data);
                                                            });

                                                }

                                                console.log("USERS MERGEADOS");


                                                //recargaBandera("MR");

                                            });
                                        }, function (error) {

                                            console.info("-----------------ERROR IN USUARIOS------------------------");
                                            console.info(error);
                                        }
                                        );
                            }
                            console.log("TERMINAMOS DE PROCESAR");
                            console.dir(data.images);
                            $scope.roomies = livingAux;


                            // GET SOLICITUDES
                            var aspirantesAux = [];
                            var appliAux = data.aspirants;

                            var idAspirantStr = "";


                            data.aspirants.forEach(function (element) {
                                console.log(element);
                                console.log(element.id_aspirant);

                                if (idAspirantStr === "") {
                                    idAspirantStr = element.id_aspirant;
                                } else {
                                    idAspirantStr = element.id_aspirant + "-" + idAspirantStr;
                                }

                            });
//ASPIRANTES
                            console.log("ASPIRANT STR" + idAspirantStr);
                            if (idAspirantStr !== "") {
                                $http.get(CONSTANT.URLWSUSUARIOSIN + idAspirantStr).
                                        then(function (response) {

                                            console.info("CONSULTA UN REGISTRO USUARIO ASPIRANT:::: " + response.data[0].nombre);
                                            console.dir(response.data);

                                            response.data.forEach(function (element) {

                                                if (isNaN(element)) {
                                                    aspirantesAux.push(element);
                                                }

                                            });


                                            response.data.forEach(function (element, idx, array) {


                                                if (isNaN(element)) {
                                                    element.edad = calcularEdad(element.fechaNac);
                                                    aspirantesAux.push(element);
                                                }


                                                if (idx === array.length - 1) {
                                                    console.log("Last callback call at index " + idx + " with value " + element);

                                                    var objMongoUser = new Object();
                                                    $http.get('/api/usersBy/' + idAspirantStr, objMongoUser)
                                                            .success(function (data) {
                                                                console.log("Caracteristicas de aspirantes");
                                                                console.dir(data);

                                                                aspirantesAux = mergeAspiArrays(data, aspirantesAux);
                                                            });

                                                }

                                                console.log("ASPIS MERGEADOS");
                                                console.dir(aspirantesAux);
                                                //recargaBandera("MR");

                                            });



                                            for (var j = 0; j < appliAux.length; j++) {

                                                for (var i = 0; i < aspirantesAux.length; i++) {
                                                    console.log("MERGEANDO:" + aspirantesAux[i].idUsuario + " " + appliAux[j].id_aspirant);
                                                    if (appliAux[j].id_aspirant === aspirantesAux[i].idUsuario) {
                                                        appliAux[j].profile = aspirantesAux[i];

                                                        break;
                                                    }
                                                }
                                            }



                                            for (var j = 0; j < appliAux.length; j++) {
                                                if (appliAux[j].id_room !== undefined) {
                                                    for (var i = 0; i < $scope.vivienda.recamaras.length; i++) {

                                                        if (appliAux[j].id_room === $scope.vivienda.recamaras[i].idCuarto) {
                                                            appliAux[j].nombreCuarto = $scope.vivienda.recamaras[i].titulo;

                                                            break;
                                                        }
                                                    }
                                                }
                                            }


                                        }, function (error) {

                                            console.info("-----------------------------------------");
                                            console.info(error);
                                        }
                                        );
                            }
                            $scope.aspirants = appliAux;

                            console.dir(appliAux);




                            // GET EXTENANTS
                            var extenantAux = [];
                            var exappliAux = [];

                            var idExtenantStr = "";
                            var dataExtenantS2 = [];

                            data.extenant.forEach(function (element) {

                                if (element.status === 1) {
                                    dataExtenantS2.push(element);
                                }

                            });

                            dataExtenantS2.forEach(function (element) {
                                console.log(element);
                                console.log(element.id_extenant);
                                console.log("EXTSTATUS" + element.status);
                                if (element.status === 1) {
                                    if (idExtenantStr === "") {
                                        idExtenantStr = element.id_extenant;
                                    } else {
                                        idExtenantStr = element.id_extenant + "-" + idExtenantStr;
                                    }

                                }

                            });

                            console.log("EXTENANT STR" + idExtenantStr);
                            if (idExtenantStr !== "") {
                                exappliAux = dataExtenantS2;

                                $http.get(CONSTANT.URLWSUSUARIOSIN + idExtenantStr).
                                        then(function (response) {

                                            console.info("CONSULTA UN REGISTRO USUARIO EXTENANT:::: " + response.data[0].nombre);
                                            console.dir(response.data);

                                            response.data.forEach(function (element) {

                                                if (isNaN(element)) {
                                                    extenantAux.push(element);
                                                }

                                            });


                                            response.data.forEach(function (element, idx, array) {


                                                if (isNaN(element)) {
                                                    element.edad = calcularEdad(element.fechaNac);
                                                    extenantAux.push(element);
                                                }


                                                if (idx === array.length - 1) {
                                                    console.log("Last callback call at index " + idx + " with value " + element);

                                                    var objMongoUser = new Object();
                                                    $http.get('/api/usersBy/' + idExtenantStr, objMongoUser)
                                                            .success(function (data) {
                                                                console.log("Caracteristicas de extenants");
                                                                console.dir(data);

                                                                extenantAux = mergeAspiArrays(data, extenantAux);
                                                            });

                                                }

                                                console.log("ext MERGEADOS");
                                                console.dir(extenantAux);
                                                //recargaBandera("MR");

                                            });



                                            for (var j = 0; j < exappliAux.length; j++) {

                                                for (var i = 0; i < extenantAux.length; i++) {
                                                    console.log("MERGEANDO:" + extenantAux[i].idUsuario + " " + exappliAux[j].id_extenant);
                                                    if (exappliAux[j].id_extenant === extenantAux[i].idUsuario) {
                                                        exappliAux[j].profile = extenantAux[i];

                                                        break;
                                                    }
                                                }
                                            }


                                        }, function (error) {

                                            console.info("--------------------Error---------------------");
                                            console.info(error);
                                        }
                                        );
                            }
                            $scope.extenant = exappliAux;

                            console.dir(exappliAux);


                        });

            }, function (error) {

                console.info("-----------------------------------------");
                console.info(error);
            }
            );



    $scope.loadDetallePrecio = function (idViviendaView) {
        console.info("EDITAR SEND " + idViviendaView);
        viviendaService.sendCuartoId(idViviendaView);

        $location.path("/editCuarto");

    };

    $scope.loadDetalleCarac = function (idViviendaView) {
        console.info("EDITAR SEND " + idViviendaView);
        viviendaService.sendCuartoId(idViviendaView);

        $location.path("/editCuartoCarac");

    };


    $scope.loadDetalleImages = function (idViviendaView) {
        console.info("EDITAR SEND " + idViviendaView);
        viviendaService.sendCuartoId(idViviendaView);

        $location.path("/editCuartoImages");

    };


    $scope.loadDetalle = function (idViviendaView) {
        viviendaService.sendId(idViviendaView);
        console.info("LOAD DETALLE " + idViviendaView);
        $location.path("/consultarVivienda/" + idViviendaView);

    };




    $scope.confirmar = function () {

        var payload = new Object();
        if ($scope.currentConfirm.id_contract !== undefined) {
            payload.idContrato = $scope.currentConfirm.id_contract;
            payload.responsableCheckinComment = $scope.comentario;
            payload.idApp = $scope.currentConfirm._id;


            var confirmadoPromise = viviendaService.confirmaLlegadaHost(payload);
            confirmadoPromise.then(function (result) {

                var notificacion = new Object();

                notificacion.id_sender = $scope.userSes.idUsuario;
                notificacion.content = $scope.userSes.nombreUsuario + " ha confirmado entrega de llaves";
                notificacion.link = "misViviendas";

                usuarioService.creaNotificacion($scope.currentConfirm.id_living, notificacion);


            });



        }

        $scope.currentConfirm = "";
        $scope.comentario = "";

    };

    $scope.cargaIdRoomie = function (idUserView, idApp) {

        $scope.idCurrentRoomie = idUserView;
        $scope.currentIdApp = idApp;


    };

    $scope.calificarRoomie = function () {
        var objMongo = new Object();
        objMongo.stars = parseInt(document.getElementById('ratingHouse').value);
        objMongo.idUser = usuarioService.getSessionUser().idUsuario;
        objMongo.content = $scope.content;
        objMongo.username = usuarioService.getSessionUser().nombreUsuario;
        objMongo.avatar = usuarioService.getSessionUser().avatar;
        objMongo.id_app = $scope.currentIdApp;

        console.dir(usuarioService.getSessionUser());

        $http.put('/api/user/rate/' + parseInt($scope.idCurrentRoomie), objMongo).
                then(function (data) {

                    console.info("Acualiza Rate:::: " + data);

                    cerrarModal();
                    notificar('<i class="uk-icon-star"></i>  ¡Calificación añadida!', 'success');
                    $route.reload();
                    $scope.idCurrentRoomie = "";
                    $scope.currentIdApp = "";


                }, function (error) {

                    console.info("------------------ERROR MONGO-----------------------");
                    console.info(error);
                    cerrarModal();
                    notificar('<i class="uk-icon-warning"></i>  Error al añadir evaluación', 'danger');
                    $scope.idCurrentRoomie = "";
                    $scope.currentIdApp = "";
                }
                );


    };

    function mergeAspiArrays(mongoArray, aspisArray) {

        for (var i = 0; i < aspisArray.length; i++) {
            for (var j = 0; j < mongoArray.length; j++) {

                if (aspisArray[i].idUsuario === mongoArray[j].id_user) {
                    aspisArray[i].caracter = mongoArray[j].characteristics;
                    aspisArray[i].rates = mongoArray[j].rates;

                    break;
                }
            }
        }

        console.log("MERGE CARAC");
        console.dir(aspisArray);
        return aspisArray;
    }

    function mergeUserArrays(mongoArray) {

        for (var i = 0; i < $scope.roomies.length; i++) {
            for (var j = 0; j < mongoArray.length; j++) {

                if ($scope.roomies[i].idUsuario === mongoArray[j].id_user) {
                    $scope.roomies[i].caracter = mongoArray[j].characteristics;
                    break;
                }
            }
        }
    }

    //Usuario 
    $scope.loadParams = function (obAppView) {

        console.info("LOAD PARAMS " + obAppView);
        console.dir(obAppView);
        $scope.currentApp = obAppView;

    };


    $scope.loadParamsConfirm = function (obAppView) {

        console.info("LOAD PARAMS CONFIRM " + obAppView);
        console.dir(obAppView);
        $scope.currentConfirm = obAppView;


    };


    $scope.loadAddCuarto = function (idViviendaView) {
        viviendaService.sendId(idViviendaView);
        console.info("LOAD DETALLE " + idViviendaView);
        $location.path("/addCuarto");

    };


    $scope.aceptaSolicitud = function (idApp) {


        console.info("Acepta " + idApp);
        var objMongo = new Object();


        if (isRoomHouseAvalaible($scope.currentApp, $scope.aspirants)) {
            $http.put('/api/house/aspirant_a/' + idApp, objMongo).success(function (data) {

                console.log("ASPIRANT STATUS MONGO");
                console.dir(data);
                notificar('<i class="uk-icon-thumbs-up"></i>  ¡Has aceptado la solicitud!', 'success');

                var notificacion = new Object();

                notificacion.id_sender = $scope.userSes.idUsuario;
                notificacion.content = $scope.userSes.nombreUsuario + " aceptó tu solicitud";
                notificacion.link = "misAplicaciones";

                usuarioService.creaNotificacion($scope.currentApp.profile.idUsuario, notificacion);



                console.log("ROOMIE DTO");

                //CONSULTA INFO Responsable
                $http.get(CONSTANT.URLWSUSUARIOS + $scope.currentApp.profile.idUsuario).
                        then(function (response1) {
                            var roomieDTO = response1.data;

                            /********************************************************CORREO********************************************************************************/
                            var correo = new Object();
                            correo.asunto = "Tu aplicación fue aceptada";
                            correo.destinatarios = ["support@roomiesoftheworld.com", roomieDTO.correoElectronico];//, 
                            correo.plantilla = EMAIL.ACEPTAR_APLICACION;

                            var parametrosCorreo = new Object();
                            parametrosCorreo.nombreUsuario = roomieDTO.nombre + " " + roomieDTO.primerApellido;
                            parametrosCorreo.nombreAnfitrion = $scope.userSes.nombreUsuario;
                            correo.parametros = parametrosCorreo;


                            usuarioService.enviarCorreo(correo);
                            /********************************************************FIN CORREO*****************************************************************************/

                            $route.reload();


                        }, function (error) {

                            console.info("------------------ERROR SERVICIO USUARIO-----------------------");
                            console.info(error);

                            $route.reload();
                        }
                        );





            })
                    .error(function (data) {
                        console.log('Error MONGO: ' + data);
                        alert("Error al Aceptar Solicitud M");
                        notificar('<i class="uk-icon-warning"></i>  Error al aceptar Solicitud M', 'danger');
                        cerrarModal();
                    });

            console.log("Cerrando Modal");
            cerrarModal();


        } else {

            cerrarModal();
            notificar('<i class="uk-icon-warning"></i>  Estás esperando pago de otro usuario', 'warning');
        }




    };

    $scope.rechazarAplicacion = function (idHouse, idAsp) {

        var objMongo1 = new Object();
        objMongo1.idAsp = idAsp;
        $http.put('/api/house/aspirant_r/' + idHouse, objMongo1)
                .success(function (data) {

                    console.info("MUEVE ASPIRANTE A ROOMIE MONGO");
                    console.dir(data);
                    notificar('<i class="uk-icon-thumbs-up"></i>  ¡Has rechazado la solicitud!', 'success');
                    //alert("Exito al Cancelar Solicitud M");
                    $route.reload();
                    cerrarModal();


                })
                .error(function (data) {
                    console.log('Error MONGO: ' + data);
                    alert("Error al Cancelar Solicitud M");
                    cerrarModal();
                });


    };


    function isRoomHouseAvalaible(currentApp, allApplications) {

        var isAval = true;

        if (currentApp.id_room !== undefined) {
            for (var i = 0; i < allApplications.length; i++) {

                if (currentApp._id !== allApplications[i]._id) {

                    if (currentApp.id_room === allApplications[i].id_room && allApplications[i].status === 2) {

                        isAval = false;
                        break;

                    }
                }

            }
        } else {

            for (var i = 0; i < allApplications.length; i++) {
                if (currentApp._id !== allApplications[i]._id) {

                    if (allApplications[i].status === 2) {

                        isAval = false;
                        break;

                    }
                }

            }
        }

        return isAval;

    }

});

app.controller('consultarAplicacionesCtrl', function ($scope, $http, $location, $route, viviendaService, usuarioService, CONSTANT) {
    var pantalla = pantallaCarga();

    $scope.userSes = usuarioService.getSessionUser();
    if ($scope.userSes.idUsuario === undefined || $scope.userSes.tipoUsuario !== 3) {
        $location.path("/inicio");
        pantalla.finish();
    }

    console.log("ENTRO A CONSULTAR APLICAciones");

    pantalla.finish();


    var objMongo = new Object();
    $http.get('/api/aspirant/house/' + usuarioService.getSessionUser().idUsuario, objMongo)
            .success(function (data) {
                console.log("CONSULTA CASAS ASPIRADAS");
                console.dir(data);

                if (data.length === 0) {

                    $location.path("/perfil");
                    notificar('<i class="uk-icon-warning"></i>  Aún no aplicas a alguna casa', 'warning');
                }

                $http.get(CONSTANT.URLWSVIVIENDASIN + generaHousesStr(data)).
                        then(function (response) {


                            var listaViviendas = [];
                            response.data.forEach(function (element) {

                                if (isNaN(element)) {
                                    listaViviendas.push(element);
                                }

                            });


                            var misApps = data;


                            console.dir(listaViviendas);

                            for (var i = 0; i < misApps.length; i++) {
                                for (var j = 0; j < listaViviendas.length; j++) {


                                    if (misApps[i].id_house === listaViviendas[j].idVivienda) {

                                        misApps[i].common = listaViviendas[j];


                                        break;
                                    }
                                }
                            }


                            for (var i = 0; i < misApps.length; i++) {
                                for (var j = 0; j < misApps[i].aspirants.length; j++) {
                                    console.log("Compara:::::" + $scope.userSes.idUsuario + " " + misApps[i].aspirants[j].id_aspirant)

                                    if (parseInt($scope.userSes.idUsuario) === parseInt(misApps[i].aspirants[j].id_aspirant)) {
                                        console.log("entra a common");

                                        misApps[i].aplicacion = misApps[i].aspirants[j];


                                        console.dir(misApps[i].common);
                                        if (misApps[i].aplicacion.id_room !== undefined && misApps[i].common.recamaras.length > 0) {


                                            for (var k = 0; k < misApps[i].common.recamaras.length; k++) {
                                                console.dir(misApps[i].common.recamaras[k]);
                                                if (misApps[i].common.recamaras[k].idCuarto === misApps[i].aplicacion.id_room) {

                                                    misApps[i].commonRoom = misApps[i].common.recamaras[k];
                                                    break;
                                                }

                                            }
                                        }

                                        break;
                                    }
                                }
                            }



                            console.log("MIS APPS");
                            console.dir(misApps);

                            $scope.viviendas = misApps;
                            var idStr = concatStrIdResponsable($scope.viviendas);

                            $scope.loadInfoResponsable(idStr);

                            console.log(idStr);

                        }, function (error) {

                            console.info("-----------------------------------------");
                            console.info(error);
                        }
                        );

            })
            .error(function (data) {
                console.log('Error MONGO: ' + data);
            });

    $scope.loadInfoResponsable = function (idStr) {

        //CONSULTA INFO Responsable
        $http.get(CONSTANT.URLWSUSUARIOSIN + idStr).
                then(function (response) {

                    console.info("Regresa Responsables:::: ");
                    console.dir(response.data);

                    //$scope.viviendas 

                    $scope.viviendas = mergeViviendasXResponsables($scope.viviendas, response.data);


                }, function (error) {

                    console.info("-----------------ERROR IN USUARIOS------------------------");
                    console.info(error);
                }
                );

    };

    $scope.cancelarAplicacion = function () {
        console.log($scope.idViviendaVista);
        var objMongo1 = new Object();
        objMongo1.idAsp = usuarioService.getSessionUser().idUsuario;
        $http.put('/api/house/aspirant_r/' + $scope.idViviendaVista, objMongo1)
                .success(function (data) {

                    console.info("MUEVE ASPIRANTE A ROOMIE MONGO");
                    console.dir(data);
                    notificar('<i class="uk-icon-thumbs-up"></i>  ¡Has cancelado la solicitud!', 'success');
                    //alert("Exito al Cancelar Solicitud M");
                    $route.reload();
                    cerrarModal();


                })
                .error(function (data) {
                    console.log('Error MONGO: ' + data);
                    alert("Error al Cancelar Solicitud M");
                    cerrarModal();
                });


    };

    $scope.loadDetalle = function (idViviendaView) {
        viviendaService.sendId(idViviendaView);
        console.info("LOAD DETALLE " + idViviendaView);
        $location.path("/consultarVivienda/" + idViviendaView);

    };

    $scope.sendApp = function (idApp, idHouse) {

        idApp.id_house = idHouse;
        viviendaService.sendApp(idApp);
        console.info("LOAD APP " + idApp);
        $location.path("/checkout");

    };

    $scope.loadParams = function (idResponsableView) {
        console.info("LOAD PARAMS " + idResponsableView);
        viviendaService.sendId(idResponsableView);
        //UIkit.modal("#id-ban-message").show();


    };
    $scope.loadParamsCancel = function (idViviendaView) {
        console.info("LOAD PARAMS " + idViviendaView);
        $scope.idViviendaVista = idViviendaView;
        //UIkit.modal("#modalCancel").show();
    };
});

app.controller('motorBusquedaCtrl', function ($scope, $http, $location, viviendaService, pagerService, CONSTANT) {
    var pantalla = pantallaCarga();
    var vm = this;
    vm.pager = {};
    vm.setPage = setPage;
    pantalla.finish();

    var viviendaArray = [];
    var viviendasComplete = [];


    $http.get(CONSTANT.URLWSVIVIENDAS).
            then(function (response) {

                response.data.forEach(function (element) {

                    if (isNaN(element)) {
                        viviendaArray.push(element);
                    }

                });

                console.dir(viviendaArray);
                //$scope.viviendas=viviendaArray;

                var objMongo = new Object();
                $http.get('/api/all/houses', objMongo)
                        .success(function (data) {

                            var housesArray = data;

                            var houseFilteredRoomies = getRoomiesIdHouses(housesArray);
                            console.log("Houses MONGO");
                            console.dir(houseFilteredRoomies);
                            var objMongoUser = new Object();

                            $http.get('/api/usersBy/' + houseFilteredRoomies[0])
                                    .success(function (data) {
                                        var userArray = [];
                                        userArray = data;
                                        //var housesM= mergeHousesRoomiesM(houseFilteredRoomies[1], userArray);

                                        var housesM = mergeHousesRoomiesM(housesArray, userArray);
                                        console.log("Houses MONGO MERGED");
                                        console.dir(housesM);
                                        viviendasComplete = mergeViviendasSM(viviendaArray, housesM);
                                        console.log("VIVIENDAS COMPLETE");
                                        console.dir(viviendasComplete);
                                        $scope.viviendas = viviendasComplete;

                                    })
                                    .error(function (data) {
                                        console.log('Error MONGO: ' + data);
                                    });




                        })
                        .error(function (data) {
                            console.log('Error MONGO: ' + data);
                        });


            }, function (error) {

                console.info("----------------Error SERVICIO VIVIENDAS----------------------");
                console.info(error);
            }
            );








    $scope.loadDetalle = function (idViviendaView) {
        viviendaService.sendId(idViviendaView);
        console.info("LOAD DETALLE " + idViviendaView);
        $location.path("/consultarVivienda/" + idViviendaView);

    };

    $scope.filtrar = function () {

        var viviendasFiltered = viviendasComplete;

        console.log(viviendasFiltered);

        if (document.getElementById('lat').value && document.getElementById('long').value) {

            var viviendaFilteredAux = viviendasFiltered.filter(filterByDistance);
            viviendasFiltered = viviendaFilteredAux;
            console.log("POR DISTANCIA" + viviendasFiltered.length);
        }


        var arrayBudget = slider2.noUiSlider.get();
        var budgetMin = 0;
        var budgetMax = 1000000;
        if (arrayBudget.length === 2) {
            budgetMin = arrayBudget[0];
            budgetMax = arrayBudget[1];
        }
        //if (document.getElementById('precioRentaMin').value && document.getElementById('precioRentaMax').value)
        if (budgetMax && budgetMin) {

            var viviendaFilteredAux = viviendasFiltered.filter(filterByPrice);

            viviendasFiltered = viviendaFilteredAux;
            console.log("POR PRECIO " + viviendasFiltered.length);
        }
        if (getChosenCharac().length > 0) {

            var viviendaFilteredAux = viviendasFiltered.filter(filterByCarac);

            viviendasFiltered = viviendaFilteredAux;
            console.log("POR caracac " + viviendasFiltered.length);
        }
        if (getChosenCharacRF().length > 0) {

            var viviendaFilteredAux = viviendasFiltered.filter(filterByCaracR);
            viviendasFiltered = viviendaFilteredAux;
            console.log("POR CARAC R" + viviendasFiltered.length);
        }


        $scope.viviendas = viviendasFiltered;
    };

    $scope.setPage = function (page) {

        setPage(page);

    };

    //Paginacion
    function initPagination() {
        // initialize to page 1
        console.log("INIT PAGINATION");
        vm.setPage(1);
    }

    function setPage(page) {
        if (page < 1 || page > vm.pager.totalPages) {
            return;
        }

        // get pager object from service
        vm.pager = pagerService.GetPager($scope.viviendas.length, page);
        $scope.pager = vm.pager;

        // get current page of items
        vm.items = $scope.viviendas.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
        $scope.itemsPage = vm.items;
//             console.log("PAGE "+page+" VM ITEMS: "+vm.items);
    }


});

app.controller('motorBusquedaAvanzadoCtrl', function ($scope, $http, $location, $window, viviendaService, pagerService, CONSTANT) {
    var pantalla = pantallaCarga();
    var vm = this;
    vm.pager = {};
    vm.setPage = setPage;
    pantalla.finish();



    var viviendaArray = [];
    var viviendasComplete = [];




    $http.get(CONSTANT.URLWSVIVIENDAS).
            then(function (response) {

                response.data.forEach(function (element) {

                    if (isNaN(element)) {
                        viviendaArray.push(element);
                    }

                });

                console.dir(viviendaArray);
                //$scope.viviendas=viviendaArray;
                $window.map = initMapBuscador(viviendaArray);
                //loadMarkers(viviendaArray);

                var objMongo = new Object();
                $http.get('/api/all/houses', objMongo)
                        .success(function (data) {

                            var housesArray = data;

                            var houseFilteredRoomies = getRoomiesIdHouses(housesArray);
                            console.log("Houses MONGO");
                            console.dir(houseFilteredRoomies);
                            var objMongoUser = new Object();

                            if (houseFilteredRoomies[0] !== "") {
                                $http.get('/api/usersBy/' + houseFilteredRoomies[0])
                                        .success(function (data) {
                                            var userArray = [];
                                            userArray = data;
                                            //var housesM= mergeHousesRoomiesM(houseFilteredRoomies[1], userArray);

                                            var housesM = mergeHousesRoomiesM(housesArray, userArray);
                                            console.log("Houses MONGO MERGED");
                                            console.dir(housesM);
                                            viviendasComplete = mergeViviendasSM(viviendaArray, housesM);
                                            console.log("VIVIENDAS COMPLETE");
                                            console.dir(viviendasComplete);
                                            $scope.viviendas = viviendasComplete;

                                        })
                                        .error(function (data) {
                                            console.log('Error MONGO: ' + data);
                                        });

                            } else {

                                viviendasComplete = mergeViviendasSM(viviendaArray, housesArray);
                                console.log("VIVIENDAS COMPLETE");
                                console.dir(viviendasComplete);
                                $scope.viviendas = viviendasComplete;

                            }


                        })
                        .error(function (data) {
                            console.log('Error MONGO: ' + data);
                        });


            }, function (error) {

                console.info("----------------Error SERVICIO VIVIENDAS----------------------");
                console.info(error);
            }
            );

    $scope.loadDetalle = function (idViviendaView) {
        viviendaService.sendId(idViviendaView);
        console.info("LOAD DETALLE " + idViviendaView)
        $location.path("/consultarVivienda/" + idViviendaView);

    };

    $scope.filtrar = function () {

        var viviendasFiltered = viviendasComplete;

        console.log(viviendasFiltered);
        viviendasGlobal = viviendasFiltered;

        if (document.getElementById('lat').value && document.getElementById('long').value) {

            var viviendaFilteredAux = viviendasFiltered.filter(filterByDistance);
            viviendasFiltered = viviendaFilteredAux;
            console.log("POR DISTANCIA" + viviendasFiltered.length);
        }


        var arrayBudget = slider2.noUiSlider.get();
        var budgetMin = 0;
        var budgetMax = 1000000;
        if (arrayBudget.length === 2) {
            budgetMin = arrayBudget[0];
            budgetMax = arrayBudget[1];
        }
        //if (document.getElementById('precioRentaMin').value && document.getElementById('precioRentaMax').value)
        if (budgetMax && budgetMin) {
            var viviendaFilteredAux = viviendasFiltered.filter(filterByPrice);

            viviendasFiltered = viviendaFilteredAux;
            console.log("POR PRECIO " + viviendasFiltered.length);
        }

        if (getChosenTipoVivienda().length > 0) {
            var viviendaFilteredAux = viviendasFiltered.filter(filterByTipo);

            viviendasFiltered = viviendaFilteredAux;
            console.log("POR Tipo Vivienda " + viviendasFiltered.length);
        }

        if (getChosenCharac().length > 0) {

            var viviendaFilteredAux = viviendasFiltered.filter(filterByCarac);

            viviendasFiltered = viviendaFilteredAux;
            console.log("POR caracac " + viviendasFiltered.length);
        }
        if (getChosenCharacRF().length > 0) {

            var viviendaFilteredAux = viviendasFiltered.filter(filterByCaracR);
            viviendasFiltered = viviendaFilteredAux;
            console.log("POR CARAC R" + viviendasFiltered.length);
        }
        if (getChosenFeatures().length > 0) {

            var viviendaFilteredAux = viviendasFiltered.filter(filterByAmenidades);
            viviendasFiltered = viviendaFilteredAux;
            console.log("POR Amenidades" + viviendasFiltered.length);
        }
        if (getChosenServices().length > 0) {

            var viviendaFilteredAux = viviendasFiltered.filter(filterByServicios);
            viviendasFiltered = viviendaFilteredAux;
            console.log("POR Servicios" + viviendasFiltered.length);
        }

        $scope.viviendas = viviendasFiltered;
        viviendasGlobal = viviendasFiltered;
        //$window.map = initMapBuscador(viviendasFiltered);
    };





    $scope.setPage = function (page) {

        setPage(page);

    };

    //Paginacion
    function initPagination() {
        // initialize to page 1
        console.log("INIT PAGINATION");
        vm.setPage(1);
    }

    function setPage(page) {
        if (page < 1 || page > vm.pager.totalPages) {
            return;
        }

        // get pager object from service
        vm.pager = pagerService.GetPager($scope.viviendas.length, page);
        $scope.pager = vm.pager;

        // get current page of items
        vm.items = $scope.viviendas.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
        $scope.itemsPage = vm.items;
//             console.log("PAGE "+page+" VM ITEMS: "+vm.items);
    }


});




app.controller('motorBusquedaMobileCtrl', function ($scope, $http, $location, $window, viviendaService, pagerService, CONSTANT) {
    var pantalla = pantallaCarga();
    var vm = this;
    vm.pager = {};
    vm.setPage = setPage;
    pantalla.finish();



    var viviendaArray = [];
    var viviendasComplete = [];


    $http.get(CONSTANT.URLWSVIVIENDAS).
            then(function (response) {

                response.data.forEach(function (element) {

                    if (isNaN(element)) {
                        viviendaArray.push(element);
                    }

                });

                console.dir(viviendaArray);
                //$scope.viviendas=viviendaArray;
                $window.map = initMapBuscadorMob(viviendaArray);
                //loadMarkers(viviendaArray);

                var objMongo = new Object();
                $http.get('/api/all/houses', objMongo)
                        .success(function (data) {

                            var housesArray = data;

                            var houseFilteredRoomies = getRoomiesIdHouses(housesArray);
                            console.log("Houses MONGO");
                            console.dir(houseFilteredRoomies);
                            var objMongoUser = new Object();

                            if (houseFilteredRoomies[0] !== "") {
                                $http.get('/api/usersBy/' + houseFilteredRoomies[0])
                                        .success(function (data) {
                                            var userArray = [];
                                            userArray = data;
                                            //var housesM= mergeHousesRoomiesM(houseFilteredRoomies[1], userArray);

                                            var housesM = mergeHousesRoomiesM(housesArray, userArray);
                                            console.log("Houses MONGO MERGED");
                                            console.dir(housesM);
                                            viviendasComplete = mergeViviendasSM(viviendaArray, housesM);
                                            console.log("VIVIENDAS COMPLETE");
                                            console.dir(viviendasComplete);
                                            $scope.viviendas = viviendasComplete;

                                        })
                                        .error(function (data) {
                                            console.log('Error MONGO: ' + data);
                                        });

                            } else {

                                viviendasComplete = mergeViviendasSM(viviendaArray, housesArray);
                                console.log("VIVIENDAS COMPLETE");
                                console.dir(viviendasComplete);
                                $scope.viviendas = viviendasComplete;


                            }


                        })
                        .error(function (data) {
                            console.log('Error MONGO: ' + data);
                        });


            }, function (error) {

                console.info("----------------Error SERVICIO VIVIENDAS----------------------");
                console.info(error);
            }
            );

    $scope.loadDetalle = function (idViviendaView) {
        viviendaService.sendId(idViviendaView);
        console.info("LOAD DETALLE " + idViviendaView)
        $location.path("/consultarVivienda/" + idViviendaView);

    };

    $scope.filtrar = function () {


        var viviendasFiltered = viviendasComplete;

        console.log(viviendasFiltered);
        viviendasGlobal = viviendasFiltered;

        console.log("GLOBAL" + viviendasGlobal);


        if (document.getElementById('lat').value && document.getElementById('long').value) {

            var viviendaFilteredAux = viviendasFiltered.filter(filterByDistance);
            viviendasFiltered = viviendaFilteredAux;
            console.log("POR DISTANCIA" + viviendasFiltered.length);
        }


        var arrayBudget = slider2.noUiSlider.get();
        var budgetMin = 0;
        var budgetMax = 1000000;
        if (arrayBudget.length === 2) {
            budgetMin = arrayBudget[0];
            budgetMax = arrayBudget[1];
        }
        //if (document.getElementById('precioRentaMin').value && document.getElementById('precioRentaMax').value)
        if (budgetMax && budgetMin) {
            var viviendaFilteredAux = viviendasFiltered.filter(filterByPrice);

            viviendasFiltered = viviendaFilteredAux;
            console.log("POR PRECIO " + viviendasFiltered.length);
        }

        if (getChosenTipoVivienda().length > 0) {
            var viviendaFilteredAux = viviendasFiltered.filter(filterByTipo);

            viviendasFiltered = viviendaFilteredAux;
            console.log("POR Tipo Vivienda " + viviendasFiltered.length);
        }

        if (getChosenCharac().length > 0) {

            var viviendaFilteredAux = viviendasFiltered.filter(filterByCarac);

            viviendasFiltered = viviendaFilteredAux;
            console.log("POR caracac " + viviendasFiltered.length);
        }
        if (getChosenCharacRF().length > 0) {

            var viviendaFilteredAux = viviendasFiltered.filter(filterByCaracR);
            viviendasFiltered = viviendaFilteredAux;
            console.log("POR CARAC R" + viviendasFiltered.length);
        }
        if (getChosenFeatures().length > 0) {

            var viviendaFilteredAux = viviendasFiltered.filter(filterByAmenidades);
            viviendasFiltered = viviendaFilteredAux;
            console.log("POR Amenidades" + viviendasFiltered.length);
        }
        if (getChosenServices().length > 0) {

            var viviendaFilteredAux = viviendasFiltered.filter(filterByServicios);
            viviendasFiltered = viviendaFilteredAux;
            console.log("POR Servicios" + viviendasFiltered.length);
        }

        $scope.viviendas = viviendasFiltered;
        viviendasGlobal = viviendasFiltered;
        switchTab();
        //$window.map = initMapBuscador(viviendasFiltered);





    };





    $scope.setPage = function (page) {

        setPage(page);

    };

    //Paginacion
    function initPagination() {
        // initialize to page 1
        console.log("INIT PAGINATION");
        vm.setPage(1);
    }

    function setPage(page) {
        if (page < 1 || page > vm.pager.totalPages) {
            return;
        }

        // get pager object from service
        vm.pager = pagerService.GetPager($scope.viviendas.length, page);
        $scope.pager = vm.pager;

        // get current page of items
        vm.items = $scope.viviendas.slice(vm.pager.startIndex, vm.pager.endIndex + 1);
        $scope.itemsPage = vm.items;
//             console.log("PAGE "+page+" VM ITEMS: "+vm.items);
    }


});





app.controller('patronCtrl', function ($scope, $http, $location, viviendaService, usuarioService, logService, CONSTANT) {

    var randomStr = "";
    for (var i = 0; i < 8; i++) {
        var min = 394;
        var max = 593;
        var random = Math.random() * (+max - +min) + +min;

        if (i == 0)
            randomStr = Math.floor(random).toString();

        if (i > 0)
            randomStr = randomStr + "-" + Math.floor(random).toString();

    }
    $http.get(CONSTANT.URLWSVIVIENDASIN + randomStr).
            then(function (response) {

                var listaViviendas = [];
                response.data.forEach(function (element) {

                    if (isNaN(element)) {
                        listaViviendas.push(element);
                    }

                });
                $scope.patron = listaViviendas;

            });


//    var CassObject = new Object();
//    CassObject.paramUrl = $location.url();
//    if (usuarioService.getSessionUser().idUsuario === undefined) {
//       CassObject.idUsuario =usuarioService.getSessionUser().idUsuario;
//    }
//    
//            $http.post("/cass/visit", CassObject).
//            then(function (data) {
//
//
//            });

    var CassObject = new Object();
    CassObject.parametro = "parametro"

//     $http.post("/cass/device", CassObject)
//            .success(function (data) {
//
//        return data;
//        }, function (error) {
//
//        console.info("------------------ERROR SERVICIO CASS-----------------------");
//                console.info(error);
//                return error;
//        });


//         $http.get("/cass/device").
//            then(function (response) {
//
//                console.dir(response);
//
//            }, function (error) {
//
//                console.info("-----------------ERROR CASS------------------------");
//                console.info(error);
//            });
//            


//     $http.put("/cass/device", CassObject)
//            .success(function (data) {
//
//        return data;
//        }, function (error) {
//
//        console.info("------------------ERROR SERVICIO CASS-----------------------");
//                console.info(error);
//                return error;
//        });        

    var CassObject = new Object();
    CassObject.paramUrl = $location.url();
    var visita = logService.setVisita(CassObject);




//    var CassObject1 = new Object();
//    CassObject1.idUser = 30;
//    CassObject1.f_token = "F_TOKEN2";
//    var dispositivos = usuarioService.manageDevices(CassObject1);


    $scope.loadDetalle = function (idViviendaView) {
        viviendaService.sendId(idViviendaView);
        console.info("LOAD DETALLE " + idViviendaView);
        $location.path("/consultarVivienda/" + idViviendaView);

    };

});


//FUNC

function getAllRooms() {

    var elementsRT = document.getElementsByClassName("roomTitulo");
    var elementsRD = document.getElementsByClassName("roomDescripcion");
    var elementsRPr = document.getElementsByClassName("roomPrecio");
    var elementsRPa = document.getElementsByClassName("roomPath");
    var elementsRM2 = document.getElementsByClassName("roomM2");
    var elementsRPresta = document.getElementsByClassName("prestacionClass");
    var elementsRFecha = document.getElementsByClassName("fechaRoomClass");
    var elementsImg = imgList;


    console.log("Elementos en Clases " + elementsRT.length + " " + elementsRD.length + " " + elementsRPr.length + " " + elementsRPa.length);
    if (elementsRT.length === elementsRD.length && elementsRPr.length === elementsRPa.length) {
        var recamaras = [];

        for (var i = 0; i < elementsRT.length; i++) {
            var obRoom = new Object();
            obRoom.titulo = elementsRT[i].value;
            obRoom.descripcion = elementsRD[i].value;
            obRoom.precio = elementsRPr[i].value;
            obRoom.portada = elementsRPa[i].value;
            obRoom.m2 = elementsRM2[i].value;



            if (elementsRFecha[i].value === undefined || elementsRFecha[i].value === "") {
                obRoom.fechaInicion = new Date();
            } else {

                obRoom.fechaInicion = new Date(elementsRFecha[i].value);
            }

            console.log("FECHA CUARTO  " + obRoom.fechaInicion);

            console.dir(elementsRPresta[i]);
            var furnitureDesc = elementsRPresta[i].innerText.split("\n");
            obRoom.furnitureAux = getChosenFurniture(elementsRPresta[i].children, furnitureDesc);

            recamaras.push(obRoom);
        }
        // document.write(names);
        return recamaras;
    } else {

        console.log("No cuadran elementos");
    }


}


function getChosenServices() {

    var elementsServicios = document.getElementsByClassName("serviciosClass");
    var serviciosLabel = document.getElementsByClassName("serviciosLabel");

    console.log("Elementos en Clase servicio " + elementsServicios.length);
    var servicios = [];

    for (var i = 0; i < elementsServicios.length; i++) {
        if (elementsServicios[i].checked === true) {
            var obServicios = new Object();
            obServicios.path = elementsServicios[i].value;
            obServicios.description = serviciosLabel[i].innerHTML;

            servicios.push(obServicios);
        }
    }

    return servicios;
}

function getChosenFeatures() {
    var amenidadesLabel = document.getElementsByClassName("amenidadesLabel");
    var elementsFeatures = document.getElementsByClassName("amenidadesClass");

    console.log("Elementos en Clase amenidades " + elementsFeatures.length);

    var features = [];

    for (var i = 0; i < elementsFeatures.length; i++) {
        if (elementsFeatures[i].checked === true) {
            var obFeatures = new Object();
            obFeatures.path = elementsFeatures[i].value;
            obFeatures.description = amenidadesLabel[i].innerHTML;


            features.push(obFeatures);
        }
    }

    return features;



}

function getChosenCharac() {

    var elementsCarac = document.getElementsByClassName("caracClass");
    var caracLabel = document.getElementsByClassName("caracLabel");
    //console.log("Elementos en Clase carac vivienda "+elementsCarac.length);

    var caract = [];

    for (var i = 0; i < elementsCarac.length; i++) {
        if (elementsCarac[i].checked === true) {
            var obCarac = new Object();
            obCarac.path = elementsCarac[i].value;
            obCarac.description = caracLabel[i].innerHTML;

            caract.push(obCarac);
        }
    }

    return caract;



}


function getChosenRequire() {

    var elementsRequi = document.getElementsByClassName("requisitosClass");
    var requiLabel = document.getElementsByClassName("requisitosLabel");
    //console.log("Elementos en Clase carac vivienda "+elementsCarac.length);

    var requi = [];

    for (var i = 0; i < elementsRequi.length; i++) {
        if (elementsRequi[i].checked === true) {
            var obCarac = new Object();
            obCarac.path = elementsRequi[i].value;
            obCarac.description = requiLabel[i].innerHTML;

            requi.push(obCarac);
        }
    }

    return requi;



}

function getChosenTipoVivienda() {

    var elementsTipo = document.getElementsByClassName("tipoViviendaClass");
    //var caracLabel = document.getElementsByClassName("tipoViviendaLabel");


    var caract = [];

    for (var i = 0; i < elementsTipo.length; i++) {
        if (elementsTipo[i].checked === true) {
            var obTipo = new Object();
            obTipo.value = elementsTipo[i].value;

            caract.push(obTipo);
        }
    }

    return caract;



}

function getChosenCharacRF() {

    var elementsCarac = document.getElementsByClassName("caracRClass");

    //console.log("Elementos en Clase carac vivienda "+elementsCarac.length);

    var caract = [];

    for (var i = 0; i < elementsCarac.length; i++) {
        if (elementsCarac[i].checked === true) {
            var obCarac = new Object();
            obCarac.path = elementsCarac[i].value;

            caract.push(obCarac);
        }
    }

    return caract;



}

function getChosenFurniture(listaFurniture, furnitureDesc) {

    var elementsFurniture = listaFurniture;

    var furniture = [];
    console.log(listaFurniture);

    for (var i = 0; i < elementsFurniture.length; i++) {
        if (elementsFurniture[i].checked === true) {
            var obFurniture = new Object();
            obFurniture.path = elementsFurniture[i].value;
            var j = i / 2;
            obFurniture.description = furnitureDesc[j];

            furniture.push(obFurniture);
        }
    }

    console.info("FUrniture a agregar" + furniture);
    return furniture;
}

function getChosenFurnitureSingle() {

    var elementsServicios = document.getElementsByClassName("prestaClass");
    var serviciosLabel = document.getElementsByClassName("furnitureLabel");

    console.log("Elementos en Clase furniture " + elementsServicios.length);
    var furniture = [];

    for (var i = 0; i < elementsServicios.length; i++) {
        if (elementsServicios[i].checked === true) {
            var obServicios = new Object();
            obServicios.path = elementsServicios[i].value;
            obServicios.description = serviciosLabel[i].innerHTML;

            furniture.push(obServicios);
        }
    }

    return furniture;
}

function getUpdatedImg() {

    var elementsImg = document.getElementsByClassName("radioImg");

    console.log("Elementos en Clase Imagen descartada " + elementsImg.length);
    var imagenes = [];

    for (var i = 0; i < elementsImg.length; i++) {
        if (elementsImg[i].checked === false) {
            var obImages = new Object();
            obImages.path = elementsImg[i].value;

            imagenes.push(obImages);
        }
    }

    return imagenes;
}

function validaCuartos(recamaras) {

    for (var i = 0; i < recamaras.length; i++) {
        if (recamaras[i].titulo === undefined || recamaras[i].titulo === '')
        {
            notificar('<i class="uk-icon-warning"></i>  Falta título cuarto.', 'warning');
            return false;
        }
        if (recamaras[i].descripcion === undefined || recamaras[i].descripcion === '')
        {
            notificar('<i class="uk-icon-warning"></i>  Falta descripción cuarto.', 'warning');
            return false;
        }
        if (recamaras[i].precio === 'NaN' || recamaras[i].precio === undefined || recamaras[i].precio === '')
        {
            notificar('<i class="uk-icon-warning"></i>  Falta precio cuarto.', 'warning');
            return false;
        }
        if (recamaras[i].portada === undefined || recamaras[i].portada.length === 0)
        {
            notificar('<i class="uk-icon-warning"></i>  Debe añadir una foto del cuarto', 'warning');
            return false;
        }
        if (recamaras[i].m2 === 'NaN' || recamaras[i].m2 === undefined || recamaras[i].m2 === '')
        {
            notificar('<i class="uk-icon-warning"></i>  Faltan metros cuadrados de cuarto.', 'warning');
            return false;
        }
    }
    return true;
}

function getRoomPics(listaPics, index) {

    var elementsPics = listaPics;

    var pics = [];
    console.log(elementsPics);

    for (var i = 0; i < elementsPics.length; i++) {
        if (elementsPics[i].index === index) {

            var objPath = new Object();
            objPath.path = elementsPics[i].path;
            pics.push(objPath);
        }
    }


    return pics;
}




function avgRate(rateList) {
    var suma = 0;


    for (var i = 0; i < rateList.length; i++) {

        suma = suma + rateList[i].stars;

    }

    var aver = suma / rateList.length;

    return aver;
}


function generaHousesStr(houses) {

    var idHousesStr = "";

    houses.forEach(function (element) {

        if (idHousesStr === "") {
            idHousesStr = element.id_house;
        } else {
            idHousesStr = element.id_house + "-" + idHousesStr;
        }

    });
    return idHousesStr;
}



function getRoomiesIdHouses(housesArray) {
    var idRoomiesList = [];
    var idRoomiesListUni = [];
    var housesWithRoomiesList = [];
    var idRoomiesStr = "";

    housesArray.forEach(function (house) {

        if (house.living.length > 0) {
            housesWithRoomiesList.push(house);
            house.living.forEach(function (roomie) {

                idRoomiesList.push(roomie.id_living);


            });
        }


    });



    console.log("lista de IDS: " + idRoomiesList);

    idRoomiesListUni = eliminaDuplicadosArray(idRoomiesList);
    console.log("lista sin duplicados: " + idRoomiesListUni);

    idRoomiesListUni.forEach(function (idRoomie) {
        if (idRoomiesStr === "") {
            idRoomiesStr = idRoomie;
        } else {
            idRoomiesStr = idRoomie + "-" + idRoomiesStr;
        }
    });

    return [idRoomiesStr, housesWithRoomiesList];

}

function eliminaDuplicadosArray(array) {


    var uniqueArray = [];
    $.each(array, function (i, el) {
        if ($.inArray(el, uniqueArray) === -1)
            uniqueArray.push(el);
    });

    return uniqueArray;
}

function mergeHousesRoomiesM(housesWithRoomiesArray, usersWithHouseArray) {
    //Roomie solo puede tener una casa
    var housesMergedM = [];

    housesWithRoomiesArray.forEach(function (house) {

        var roomiesInHouse = house.living;
        for (var i = 0; i < roomiesInHouse.length; i++) {

            for (var j = 0; j < usersWithHouseArray.length; j++) {

                if (roomiesInHouse[i].id_living === usersWithHouseArray[j].id_user) {

                    roomiesInHouse[i].common = usersWithHouseArray[j];
                    console.log(roomiesInHouse[i]);
                    break;
                }


            }

        }


        house.living = roomiesInHouse;
        housesMergedM.push(house);
    });
    return housesMergedM;

}


function mergeViviendasSM(viviendasArray, housesArray) {
    var viviendasComplete = [];

    console.log("VIV " + viviendasArray);
    console.log("HOUSE " + housesArray);

    for (var j = 0; j < viviendasArray.length; j++) {
        for (var i = 0; i < housesArray.length; i++) {
            if (housesArray[i].id_house === viviendasArray[j].idVivienda) {
                viviendasArray[j].common = housesArray[i];
            }
        }

        viviendasComplete.push(viviendasArray[j]);

    }

    return viviendasComplete;

}


function precargarCheckbox(listaObj, clase) {


    var listaClass = document.getElementsByClassName(clase);


    for (var i = 0; i < listaObj.length; i++) {

        for (var j = 0; j < listaClass.length; j++) {

            if (listaObj[i].path === listaClass[j].value) {
                document.getElementsByClassName(clase)[j].checked = true;
                break

            }
        }

    }

}


function getIdRoomAspirant(listaAspirant, idAspirant) {
    var idRoom;
    for (var i = 0; i < listaAspirant.length; i++) {
        if (listaAspirant[i].id_aspirant === idAspirant) {
            idRoom = listaAspirant[i].id_room;
            break;
        }

    }
    return idRoom;
}

function isRoomFull(listaLiving, idRoom) {

    var isFull = false;

    for (var i = 0; i < listaLiving.length; i++) {
        if (listaLiving[i].id_room === idRoom) {
            isFull = true;
            break;
        }
    }
    return isFull;
}



function filterByPrice(obj) {

    var arrayBudget = slider2.noUiSlider.get();
    var precioMin = 0;
    var precioMax = 1000000;
    if (arrayBudget.length === 2) {
        precioMin = arrayBudget[0];
        precioMax = arrayBudget[1];
    }

    if (!obj.rentaCuarto) {
        if (obj.precio < precioMax && obj.precio > precioMin) {
            return true;
        } else {
            return false;
        }
    } else {
        var priceInRange = false;
        for (var i = 0; i < obj.recamaras.length; i++) {
            if (obj.recamaras[i].precio < precioMax && obj.recamaras[i].precio > precioMin) {
                priceInRange = true;
                break;
            }
        }

        return priceInRange;
    }
}


function filterByCarac(obj) {

    var caracteristicas = getChosenCharac();
    var houseHasChar = false;
    if (obj.common && obj.common.characteristics) {
        for (var i = 0; i < obj.common.characteristics.length; i++) {
            for (var j = 0; j < caracteristicas.length; j++) {
                if (caracteristicas[j].path === obj.common.characteristics[i].path) {
                    houseHasChar = true;
                    break;

                }
            }

            if (houseHasChar)
                break;

        }
    }
    return houseHasChar;

}

function filterByCaracR(obj) {

    var caracteristicas = getChosenCharacRF();
    var houseHasChar = false;
    if (obj.common) {
        for (var k = 0; k < obj.common.living.length; k++) {
            if (obj.common.living[k].common) {
                var sizeArregloCR = obj.common.living[k].common.characteristics.length;
                for (var i = 0; i < sizeArregloCR; i++) {
                    for (var j = 0; j < caracteristicas.length; j++) {
                        if (caracteristicas[j].path === obj.common.living[k].common.characteristics[i].path) {
                            houseHasChar = true;
                            break;
                        }

                    }
                    if (houseHasChar)
                        break;

                }
                if (houseHasChar)
                    break;
            }
        }
    }
    return houseHasChar;

}

function filterByAmenidades(obj) {

    var amenidades = getChosenFeatures();
    var houseHasChar = false;
    if (obj.common && obj.common.features) {
        for (var i = 0; i < obj.common.features.length; i++) {
            for (var j = 0; j < amenidades.length; j++) {
                if (amenidades[j].path === obj.common.features[i].path) {
                    houseHasChar = true;
                    break;

                }
            }

            if (houseHasChar)
                break;

        }
    }
    return houseHasChar;

}

function filterByTipo(obj) {

    var tipos = getChosenTipoVivienda();
    var houseHasTipo = false;
    if (obj && obj.tipoVivienda.idTipoVivienda) {

        for (var j = 0; j < tipos.length; j++) {
            console.log(tipos[j].value + " " + obj.tipoVivienda.idTipoVivienda);

            if (Number.parseInt(tipos[j].value) === Number.parseInt(obj.tipoVivienda.idTipoVivienda)) {
                console.log("PASA");
                houseHasTipo = true;
                break;

            }
        }

    }
    return houseHasTipo;
}

function filterByServicios(obj) {

    var servicios = getChosenServices();
    var houseHasChar = false;
    if (obj.common && obj.common.services) {
        for (var i = 0; i < obj.common.services.length; i++) {
            for (var j = 0; j < servicios.length; j++) {
                if (servicios[j].path === obj.common.services[i].path) {
                    houseHasChar = true;
                    break;

                }
            }

            if (houseHasChar)
                break;

        }
    }
    return houseHasChar;
}

function filterByDistance(obj) {

    var lat = document.getElementById('lat').value;
    var long = document.getElementById('long').value;

    var mylocation = new google.maps.LatLng(lat, long);
    var marker_lat_lng = new google.maps.LatLng(obj.latitud, obj.longitud);
    var distance = google.maps.geometry.spherical.computeDistanceBetween(mylocation, marker_lat_lng);

    if (distance <= 2000) {
        return true;
    } else {
        return false;
    }
}

function concatStrIdResponsable(data) {
    var idStr = "";
    //$scope.viviendas[0].idResponsable
    data.forEach(function (element) {
        if (idStr === "") {
            idStr = element.common.idResponsable;
        } else {
            idStr = element.common.idResponsable + "-" + idStr;
        }
    });
    return idStr;
}

function mergeViviendasXResponsables(viviendas, responsables) {

    for (var i = 0; i < viviendas.length; i++) {

        for (var j = 0; j < responsables.length; j++) {

            if (viviendas[i].common.idResponsable === responsables[j].idUsuario) {

                console.log('COINCIDEN ' + viviendas[i].common.idResponsable + "  " + responsables[j].idUsuario);

                viviendas[i].responsable = responsables[j];

                break;
            }
        }
    }

    return viviendas;

}

