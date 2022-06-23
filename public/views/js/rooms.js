/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var pathRECList = [];

function aumentaContador() {

    var contador = parseInt(document.getElementById("contadorCuarto").innerHTML);
    document.getElementById("contadorCuarto").innerHTML = contador + 1;


}

function disminuyeContador() {

    var contador = parseInt(document.getElementById("contadorCuarto").innerHTML);
    document.getElementById("contadorCuarto").innerHTML = contador - 1;


}

function addRow() {
    aumentaContador();
    var div = document.createElement('div');
    var randomNo = Math.floor((Math.random() * 10000) + 1);
    
    var indice = parseInt(document.getElementById("contadorCuarto").innerHTML)-1;

    div.className = 'uk-width-1-1@m';

    div.innerHTML = '<legend><b>Nuevo Cuarto: </b></legend>\
        <input class="roomTitulo uk-input" type="text" name="name" placeholder="Título Cuarto"  value=""  maxlength="50"/>\
       <textarea class= "roomDescripcion uk-input" name="descripcion" placeholder="Descripción" rows="3"  maxlength="500"></textarea>\n\
       <div class=" input-group">\n\
       <span class="input-group-addon">$</span>\n\
       <input class="roomPrecio uk-input" type="text" name="value" placeholder="Precio Renta Cuarto"  value=""  onkeypress="return isNumber(event)" />\n\
       </div>\n\
       <div class="input-group">\n\
       <input class="roomM2 uk-input" type="text" name="value" placeholder="Metros Cuadrados"  value="" onkeypress="return isNumber(event)" maxlength="4"/>\n\
       <span class="input-group-addon">m<sup>2</sup></span>\n\
       </div>\n\
       <fieldset> <legend><b>Características: </b></legend><div class="my-overflow prestacionClass">\n\
       <input class="prestaClass uk-radio" type="checkbox" value="armario.png" />Armario <br /> \n\
       <input class="prestaClass uk-radio" type="checkbox" value="banio_p.png" />Baño Privado<br />\n\
       <input class="prestaClass uk-radio" type="checkbox" value="escritorio.png" />Escritorio<br />\n\
       <input class="prestaClass uk-radio" type="checkbox" value="individual.png" />Cama Individual<br />\n\
       <input class="prestaClass uk-radio" type="checkbox" value="matrimonial.png" />Cama Matrimonial<br />\n\
       <input class="prestaClass uk-radio" type="checkbox" value="kingsize.png" />Cama King Size<br />\n\
       <input class="prestaClass uk-radio" type="checkbox" value="minibar.png" />Mini Bar <br />\n\
       <input class="prestaClass uk-radio" type="checkbox" value="sofa.png" />Sofá <br />\n\
       <input class="prestaClass uk-radio" type="checkbox" value="sofa.png" />Sofá-cama <br />\
       <input class="prestaClass uk-radio" type="checkbox" value="tv.png" />TV<br />\
       <input class="prestaClass uk-radio" type="checkbox" value="aa.png" /> Aire Acondicionado<br />\
       <input class="prestaClass uk-radio" type="checkbox" value="literas.png" />Literas<br /></div></fieldset>\
       <input  class="roomPath"  id="pathHidden' + randomNo + '" type="hidden" value="" />\
       <div><br>\
       <div>\
       <b>Disponible desde:</b>\
       <input type="date" class="uk-input fechaRoomClass" id="idFechaInicioC' + randomNo + '">\
       <input id="hiddenInicioC' + randomNo + '" type="hidden" value=""> \
       </div>\
       <b>Máximo 3 fotos </b>\
       <div id="fine-uploader-gallery' + randomNo + '"></div>\
       </div>\
       <input class="uk-button btn-eliminar" type="button" value="-" onclick="removeRow(this)"><hr class="divisoria"><br><br><br><br>';


    document.getElementById('content').appendChild(div);
    creaUploader(randomNo, indice);
}

function removeRow(input) {
    disminuyeContador();
    document.getElementById('content').removeChild(input.parentNode);
    console.log("Valor de elemento eliminado " + input.id);
}

function creaUploader(n, ind) {
    //var imgList = [];

    var galleryUploader = new qq.FineUploader({
        element: document.getElementById("fine-uploader-gallery" + n),
        template: 'qq-template-gallery',
        request: {
            endpoint: '/uploads',
            params: {
                username: document.getElementById("user").value,
                tipo: "REC"
            }
        },
        thumbnails: {
            placeholders: {
                waitingPath: '/fine_uploader/placeholders/waiting-generic.png',
                notAvailablePath: '/fine_uploader/placeholders/not_available-generic.png'
            }
        },
        validation: {
            allowedExtensions: ['jpeg', 'jpg', 'png'],
            itemLimit: 3,
            sizeLimit: 5120000 // 5000 kB = 5000 * 1024 bytes
        },
        callbacks: {
            onDelete: function (id) {
                // ...
            },
            onDeleteComplete: function (id, xhr, isError) {
                //...
            },
            onComplete: function (id, name, xhr, responseJSON) {

                var imgObject = new Object();
                imgObject.index = ind;
                var pathRECList = [];

                console.log("RESPUESTA AL SUBIR IMAGEN REC");
                console.dir(responseJSON);
                var respuesta = JSON.parse(responseJSON.response);
                console.log(respuesta.name);
                imgObject.path= respuesta.name;
                console.dir(pathRECList);
                document.getElementById("pathHidden" + n).value = respuesta.name;

             
                imgList.push(imgObject);

            }
        }
    });




}
