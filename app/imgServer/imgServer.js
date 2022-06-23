/* 
 * Copyright (c) 2018 Carlos Cielo.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Carlos Cielo - initial API and implementation and/or initial documentation
 */

/* 
 * Jhonny Tiscareño Ramirez - 2022
 * New features and corrections.
 */

//SERVIDOR DE IMAGENES

var express = require('express');
var fs = require("fs");
var path = require("path");


module.exports = function (app) {
    //app.post("/uploads", onUpload);
    app.post("/uploads", subirArchivo);
    app.post("/uploadsComunes", subirArchivo);
//    app.delete("/uploads/:uuid", onDeleteFile);

    console.log("Img server");

    app.use(express.bodyParser({keepExtensions: true, uploadDir: "uploads"}));


    function subirArchivo(req, res) {

        //console.log("FILE NAME", req.files.qqfile.originalFilename);


        req.files.path = req.files.qqfile.path;
        //console.log("QQ PATH  " + req.files.qqfile.path);
        //console.log("REQ PATH  " + req.files.path);


        var oldpath = req.files.qqfile.path.replace("\\", "/");
        var fecha = new Date();
        var fechaStr = fecha.getFullYear() + "" + (fecha.getMonth() + 1) + "" + fecha.getDate();
        console.dir("DATE NOW " + fechaStr);
//        var folder = __dirname + '/uploads/' + fechaStr + '/';
        var folder_uploads = path.join(__dirname, '../../uploads/');
        var folder = folder_uploads + fechaStr + '/';

        if (!fs.existsSync(folder_uploads)) { //Primero creamos el folder uploads en caso de no existir
            fs.mkdirSync(folder_uploads);
        }

        if (!fs.existsSync(folder)) { //Luego creamos el folder de la imagen
            fs.mkdirSync(folder);
        }

        //console.dir(req.body);

        //console.dir("DATE NOW " + fecha.getFullYear() + "" + fecha.getMonth() + "" + fecha.getDate());

        var ext = req.files.qqfile.originalFilename.split('.').pop();
        //console.log("EXT::  " + ext);
        //CACHAR PREFIJO
        var fileName = req.body.tipo + generaRandom() + "." + ext;
        //console.log("NUEVO NOMBRE :: " + fileName);

        var newpath = folder + fileName;

        //console.log("NUEVO Folder" + newpath)
        //console.log("VIEJO Folder" + oldpath)

        //no dejar espacios o saltos
        var responseData = {success: false, name: fechaStr + '/' + fileName};


        fs.rename(oldpath, newpath, function (err) {
            if (err)
                throw err;
            //res.write('File uploaded and moved!');
            responseData.success = true;
            res.send(responseData);

            res.end();
            //console.dir(res);
            return res;
        });

    }



    //DECODER
    app.get('/decoder/images/:path_image', decodeImages);

    function decodeImages(req, res) {

        var imagen = req.params.path_image;
        imagen = imagen.replace("-", "/");

        var archivoPath = path.join(__dirname, '../../uploads/') + imagen;

        var responseData = {success: false, name: "NOT FOUND"};


        fs.readFile(archivoPath, (err, data) => {
            if (err) {
                res.send(responseData);
            } else {

                var bitmap = fs.readFileSync(archivoPath);


                responseData.success = true;
                responseData.name = new Buffer(bitmap).toString('base64');
                res.send(responseData);

                res.end();
                return res;
            }
            //res.json(data);
        });


    }



    function generaRandom() {

        return Math.floor((Math.random() * 10000000000000000) + 1);
    }

};