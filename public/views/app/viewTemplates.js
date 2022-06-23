var app = angular.module("rotwApp", ["ngRoute", "satellizer"]);

//Defino Constantes
//8084
//var urlREST="http://25.28.163.247:8084/RotwsService/";

var urlREST = "";
var PRD = 1;
var TEST = 0;

var AMB = PRD;

//ARRAYS
var OPENPAYID = ['mvihyvtx4gxehzs0muu8', 'myamu68b2wid3v4dlwmj'];
var OPENPAYAPI = ['pk_86a4633a530646c589fc3bfdac0620a2', 'pk_cd658ae554a7412b953a43d4cf87e857'];
var OPENPAYSANDBOX = [true, false];



if (window.location.protocol === "https:") {
    urlREST = "https://";
} else {

    urlREST = "http://";
}


app.constant("CONSTANT", {
    "URLWSVIVIENDAS": urlREST + "viviendas/",
    "URLWSTIPOSVIVIENDA": urlREST + "tiposVivienda/",
    "URLWSTIPOCUARTO": urlREST + "tipoCuarto/",
    "URLWSTIPOSERVICIO": urlREST + "tipoServicio/",
    "URLWSUSUARIOS": urlREST + "usuarios/",
    "URLWSROOMIES": urlREST + "usuarios/roomie/",
    "URLWSROOMIESFB": urlREST + "usuarios/usuarioFb/",
    "URLWSSOCIOS": urlREST + "usuarios/responsableVivienda/",
    "URLWSVIVIENDASBYRESPONSABLE": urlREST + "viviendas/Responsable/",
    "URLWSUSUARIOSIN": urlREST + "usuarios/vivienda/",
    "URLWSVIVIENDASIN": urlREST + "viviendas/lista/",
    "URLWSLOGINFACE": urlREST + "usuarios/altaFB/",
    "URLWSCONTRATO": urlREST + "contrato/",
    "URLWSCUARTOS": urlREST + "cuartos/",
    "URLWSPAGO": urlREST + "pago/",
    "URLWSCORREO": urlREST + "mail/sendMail/",
    "URLWSCHECKIN": urlREST + "contrato/checkIn",
    "URLWSGETCHECKIN": urlREST + "contrato/getCheckIn/",
    "URLWSEMAIL": urlREST + "mail/sendMail/",
    "URLWSEMAILPW": urlREST + "recuperarPassword/?correoUsuario=",
    "URLWSEPW": urlREST + "recupera/set/",
    "URLWVALID": urlREST + "validaURL/?urlParam=",
    "URLPWCHNG": urlREST + "actualizaCtsna/"
    



});


//TEST
app.constant("API", {
    "FACEBOOK": "110407259656579",
    "GOOGLEMAPS": "AIzaSyCq-IC1vm5Y2BEHW2jnrnkXJEkzIfyRZG0",
    "PAYPAL": "AVasZrDV6--wXc-ukaqwFzrkZyi0ztd9bQhrVUVoIFWAfZFHwrKXdSQQMWWJzHfXspvfumZpdyP2d0yA",
    "OPENPAYID": OPENPAYID[AMB],
    "OPENPAYAPI": OPENPAYAPI[AMB],
    "OPENPAYSANDBOX": OPENPAYSANDBOX[AMB]
});



app.constant("EMAIL", {
    "BIENVENIDA_ROOMIE": "templates/altaRoomie.vm",
    "BIENVENIDA_ANFITRION": "templates/altaAnfitrion.vm",
    "APLICACION_RECIBIDA": "templates/aplicacionRecibida.vm",
    "ACEPTAR_APLICACION": "templates/aceptarAplicacion.vm",
    "CONFIRMACION_PAGO": "templates/confirmarPago.vm",
    "PAGO_REALIZADO_ROOMIE": "templates/pagoRealizadoRoomie.vm",
    "INICIO_CONTRATO_ROOMIE": "templates/inicioContratoRoomie.vm",
    "INICIO_CONTRATO_ANFITRION": "templates/inicioContratoAnfitrion.vm",
    "AVISO_PREVIO_ANFITRION": "templates/avisoPrevioAnfitrion.vm",
    "AVISO_PREVIO_ROOMIE": "templates/avisoPrevioRoomie.vm",
    "CHECKIN_ANFITRION": "templates/checkinAnfitrion.vm",
    "CHECKIN_ROOMIE": "templates/checkinRoomie.vm",
    "CHECKIN_REALIZADO_ANFITRION": "templates/checkinHechoAnfitrion.vm",
    "CHECKIN_REALIZADO_ROOMIE": "templates/checkinHechoAnfitrion.vm",
    "CONFIRMAR_PAGO_TERCERO": "templates/confirmaPagoTercero.vm",
    "TERMINA_CONTRATO": "templates/terminaContrato.vm",
    "CAMBIO_PASS_ANFITRION": "templates/cambioPassAnfitrion.vm",
    "CAMBIO_PASS_ROOMIE": "templates/cambioPassRoomie.vm",
    "MENSAJE_RECIBIDO_ANFITRION": "templates/mensajeRecibidoRoomie.vm",
    "MENSAJE_RECIBIDO_ROOMIE": "templates/mensajeRecibidoAnfitrion.vm"


});

app.constant("COM_PER", {
    "OPENPAY_TCPER": 0.029,
    "ROTW_ROOMIEPER": 0.06,
    "ROTW_HOSTPER": 0.025,
    "IVA": 0.16,
    "COEF": 0.934928945

});

app.constant("COM_FIX", {
    "OPENPAY_TCFIX": 2.5,
    "OPENPAY_SPFIX": 8.0,
    "ROTW_ROOMIEFIX": 100,
    "ROTW_HOSTFIX": 150

});

app.config(function ($routeProvider, $authProvider) {
    $routeProvider
            .when('/inicio', {
                templateUrl: 'inicio.html'
            })
            .when('/viviendas', {
                templateUrl: 'viviendas.html'

            })
            .when('/consultarVivienda/:id', {
                templateUrl: 'vivienda_detalle.html'
            })
            .when('/consultarCuarto/:id', {
                templateUrl: 'detalleCuarto.html'
            })
            .when('/altaVivienda', {
                templateUrl: 'altaVivienda.html'
            })
            .when('/editVivienda', {
                templateUrl: 'editVivienda.html'
            })
            .when('/editViviendaCarac', {
                templateUrl: 'editViviendaCarac.html'
            })
            .when('/editViviendaImages', {
                templateUrl: 'editViviendasImages.html'
            })
            .when('/addCuarto', {
                templateUrl: 'addCuarto.html'
            })
            .when('/editCuarto', {
                templateUrl: 'editCuarto.html'
            })
            .when('/editCuartoImages', {
                templateUrl: 'editCuartoImages.html'
            })
            .when('/editCuartoCarac', {
                templateUrl: 'editCuartoCarac.html'
            })
            .when('/editRoomie', {
                templateUrl: 'editRoomie.html'
            })
            .when('/editRoomieCarac', {
                templateUrl: 'editRoomieCarac.html'
            })
            .when('/altaRoomie', {
                templateUrl: 'altaRoomie.html'
            })
            .when('/altaResponsable', {
                templateUrl: 'altaResponsable.html'
            })
            .when('/editResponsable', {
                templateUrl: 'editResponsable.html'
            })
            .when('/altaSupervisor', {
                templateUrl: 'altaSupervisor.html'
            })
            .when('/creaCliente', {
                templateUrl: 'addClient.html'
            })
            .when('/perfil', {
                templateUrl: 'perfil.html'
            })
            .when('/login', {
                templateUrl: 'login.html'
            })
            .when('/perfil', {
                templateUrl: 'perfil.html'
            })
            .when('/bandeja', {
                templateUrl: 'bandeja.html'
            })
            .when('/misViviendas', {
                templateUrl: 'misViviendas.html'
            })
            .when('/misAplicaciones', {
                templateUrl: 'misAplicaciones.html'
            })
            .when('/miHogar', {
                templateUrl: 'miHogar.html'
            })
            .when('/buscar', {
                templateUrl: 'buscar.html'
            })
            .when('/buscarAvanzado', {
                templateUrl: 'buscarAvanzado.html'
            })
            .when('/misFavoritos', {
                templateUrl: 'misFavoritos.html'
            })
            .when('/checkout', {
                templateUrl: 'checkout.html'
            })
            .when('/loading', {
                templateUrl: 'loading.html'
            })
            .when('/manageVivienda', {
                templateUrl: 'manageVivienda.html'
            })
            .when('/find', {
                templateUrl: 'find.html'
            })
            .when('/findMobile', {
                templateUrl: 'findMobile.html'
            })
            .when('/terminos', {
                templateUrl: 'adminTerminosYCondiciones.html'
            })
            .when('/aviso', {
                templateUrl: 'adminAvisoPrivacidad.html'
            })
            .when('/3dconfirmacion/', {
                templateUrl: '3dconfirmacion.html'
            })
            .when('/complementRoomie', {
                templateUrl: 'complementRoomie.html'
            })
            .when('/pendientes', {
                templateUrl: 'pendientes.html'
            })
            .when('/recuperarPwd/:code', {
                templateUrl: 'linkP.html'
            })
            .when('/changeP', {
                templateUrl: 'changeP.html'
            })
             .when('/validaNumero', {
                templateUrl: 'validaNumero.html'
            })
            .otherwise({
                redirectTo: '/inicio'
            });




    $authProvider.baseUrl = urlREST;
    $authProvider.loginUrl = "/login/";
    //$authProvider.signupUrl = "http://api.com/auth/signup";
    $authProvider.tokenName = "token";
    $authProvider.tokenPrefix = "rotwToken";
    $authProvider.facebook({
        clientId: '110407259656579',
        responseType: 'token'
    });

});

//ACCESO
//angular.module('rotwApp', ['satellizer'])
//  app.config(function($authProvider) {
// 
//    $authProvider.facebook({
//      clientId: 'Facebook App ID'
//    });
// 
//    // Optional: For client-side use (Implicit Grant), set responseType to 'token' (default: 'code') 
//    $authProvider.facebook({
//      clientId: 'Facebook App ID',
//      responseType: 'token'
//    });
// 
//    $authProvider.google({
//      clientId: 'Google Client ID'
//    });
// 
//    $authProvider.github({
//      clientId: 'GitHub Client ID'
//    });
// 
//    $authProvider.linkedin({
//      clientId: 'LinkedIn Client ID'
//    });
// 
//    $authProvider.instagram({
//      clientId: 'Instagram Client ID'
//    });
// 
//    $authProvider.yahoo({
//      clientId: 'Yahoo Client ID / Consumer Key'
//    });
// 
//    $authProvider.live({
//      clientId: 'Microsoft Client ID'
//    });
// 
//    $authProvider.twitch({
//      clientId: 'Twitch Client ID'
//    });
// 
//    $authProvider.bitbucket({
//      clientId: 'Bitbucket Client ID'
//    });
// 
//    $authProvider.spotify({
//      clientId: 'Spotify Client ID'
//    });
// 
//    // No additional setup required for Twitter 
// 
//    $authProvider.oauth2({
//      name: 'foursquare',
//      url: '/auth/foursquare',
//      clientId: 'Foursquare Client ID',
//      redirectUri: window.location.origin,
//      authorizationEndpoint: 'https://foursquare.com/oauth2/authenticate',
//    });
// 
//  });


