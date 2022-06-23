
// Inicialización
var express = require('express');
var morgan = require("morgan");
var bodyParser = require("body-parser");
var jwt = require("jsonwebtoken");
var mongoose = require('mongoose');
var fs = require("fs");
var mkdirp = require("mkdirp");
var usostrict = require('use-strict');

var options = {

    key: fs.readFileSync(__dirname + '/ssl/rotw_com.key'),

    cert: fs.readFileSync(__dirname + '/ssl/rotw_cert.crt'),

    ca: fs.readFileSync(__dirname + '/ssl/rotw_bundle.crt')

};

var app = express();
var http = require('http').Server(app);
var https = require('https').Server(options, app);


// Utilizamos express

var port = process.env.PORT || 80; 			// Cogemos el puerto 8080
//var port = process.env.PORT || 3000; 			// Cogemos el puerto 3000

var serveStatic = require('serve-static');
app.use(serveStatic(__dirname, {'index': ['index.html']}));


// paths/constants
var fileInputName = process.env.FILE_INPUT_NAME || "qqfile";
var publicDir = process.env.PUBLIC_DIR;
var nodeModulesDir = process.env.NODE_MODULES_DIR;
var uploadedFilesPath = process.env.UPLOADED_FILES_DIR;
var chunkDirName = "chunks";
var maxFileSize = process.env.MAX_FILE_SIZE || 0; // in bytes, 0 for unlimited




// Configuracion
mongoose.connect('mongodb://localhost:27017/rotw', {useNewUrlParser: true}); 	// Hacemos la conexión a la base de datos de Mongo 
//mongoose.set('useNewUrlParser', true);

app.configure(function () {


    app.use('/js', express.static(__dirname + '/js'));
    app.use('/css', express.static(__dirname + '/css'));
    app.use('/css', express.static(__dirname + '/uploads'));


    app.use(express.static(__dirname + publicDir));
    app.use("/node_modules", express.static(__dirname + nodeModulesDir));

//        app.all('/*', function(req, res, next) {
//            // Just send the index.html for other files to support HTML5Mode
//            res.sendFile('index.html', { root: __dirname });
//        });

    app.use(express.static(__dirname + '/public/views'));
    app.use(express.logger('dev')); 						// activamos el log en modo 'dev'
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    app.use(bodyParser.urlencoded({extended: true}));
    app.use(bodyParser.json());

//        app.use(express.urlencoded());
//        app.use(express.json());


    app.use(morgan("dev"));
    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
        next();
    });


  

    app.use(app.router);
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}));

});




// Cargamos los endpoints
require('./app/mongoRoutes.js')(app);
require('./app/openpay/appOpenPay.js')(app);
require('./app/imgServer/imgServer.js')(app);
require('./app/firebase/firebaseApp.js')(app);
require('./app/cassandra/cassRoutes.js')(app);
require('./app/jobs/agendaApp.js')(app);
require('./app/twilio/twilioApp.js')(app);


//Main controller
//  app.get('/*', function (req, res, next) {
//        res.header('X-XSS-Protection', 0);
//        next(); // http://expressjs.com/guide.html#passing-route control
//    });



http.listen(port, function () {
    require('./app/notifications/notiManager.js')(http);
    console.log("APP por el puerto " + port);

});


https.listen(443, function () {
    require('./app/notifications/notiManager.js')(https);
    console.log("APP por el puerto 443");
});



app.use(function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https')
        return res.redirect('https://' + req.headers.host + req.url);
    else
        return next();
});


//ERROR TRACE
app.use(function (err, req, res, next) {
    console.error(err.message);
    if (!err.statusCode)
        err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});


