/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function pantallaCarga() {
    var logoLoading = [
        "images/carga/carga.gif"
    ];

    var htmlLoading = ["<div class='spinner'></div><p class='loading-message'>Roomies of The World</p>",
        "<div class='spinner'></div><p class='loading-message'>Comparte gastos y experiencias</p>",
        "<div class='spinner'></div><p class='loading-message'>Mi nuevo hogar</p>",
        "<div class='spinner'></div><p class='loading-message'>Vive con personas como tú</p>",
        "<div class='spinner'></div><p class='loading-message'>El hogar lo crean los Roomies con quienes compartes</p>",
        "<div class='spinner'></div><p class='loading-message'>Encuentra tu casa ideal</p>"];

    var rl = Math.floor(Math.random() * 1);
    var rh = Math.floor(Math.random() * 6);



    var loading_screen = pleaseWait({
        logo: logoLoading[rl],
        backgroundColor: '#fff',
        loadingHtml: htmlLoading[rh]
    });

    return loading_screen;

}

function cerrarModal() {

    UIkit.modal(".modal").hide();
    UIkit.modal(".uk-modal").hide();
}

function abrirModal(idModal) {

    //UIkit.modal.alert("Attention!");
    UIkit.modal(idModal).show();
}


// primary	UIkit.notification("...", {status:'primary'})
//success	UIkit.notification("...", {status:'success'})
//warning	UIkit.notification("...", {status:'warning'})
function notificar(mensaje, estatus) {

    UIkit.notification({
        message: mensaje,
        status: estatus,
        pos: 'top-center',
        timeout: 3000
    });
}

function notificationPush() {

    var socket = io();

    socket.emit("aplicacion");
    socket.on('something', function (msg) {
        console.log("NOTIPUSH");
    });

}

function calcularEdad(fecha) {

    console.log("CALCULEMOS EDAD DE: " + fecha);
    var hoy = new Date();
    var cumpleanos = new Date(fecha);
    var edad = hoy.getFullYear() - cumpleanos.getFullYear();
    var m = hoy.getMonth() - cumpleanos.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < cumpleanos.getDate())) {
        edad--;
    }

    console.log(edad);
    return edad;
}

function activaBoton() {
    document.form.submitName.disabled = false;
}

function desactivaBoton() {
    document.form.submitName.disabled = true;
}


function activaBotonMod() {

    document.getElementById("botMod").disabled = false;

}

function desactivaBotonMod() {
    document.getElementById("botMod").true;
}


function switchTab() {

    console.log("SWITCH TAB");

//    UIkit.switcher(idSwitch).show(1);
    document.getElementById('liSwitch1').setAttribute("aria-expanded", "false");
    document.getElementById('liSwitch1').setAttribute("class", "");
    document.getElementById('liSwitcher1').setAttribute("class", "");

    document.getElementById('liSwitch2').setAttribute("aria-expanded", "true");
    document.getElementById('liSwitch2').setAttribute("class", "uk-active");
    document.getElementById('liSwitcher2').setAttribute("class", "uk-active");
}

