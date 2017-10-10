var express = require("express");
var mongoskin = require("mongoskin");
var bodyParser = require("body-parser");
var BigInteger = require('big-number');
var app =  express();
var bigInt = require("big-integer");
var db = mongoskin.db("mongodb://@localhost:27017/platzi-angular", {safe: true});
var id = mongoskin.helper.toObjectID;

var allowMethods = function(req, res, next) {
    res.header('Access-Control-Allow-Methods', "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "content-type, Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    res.header('Content-Type', '*');
    res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
};

var allowCrossTokenHeader = function(req, res, next) {
    res.header('Access-Control-Allow-Headers', '*');
    res.header('Access-Control-Allow-Headers', "content-type, Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    next();
}
var p=4;
var q=4;
var n=0;
var dos = bigInt(2);
var numBits = bigInt(512);
while(bigInt(p).isPrime()==false) {
    p=bigInt.randBetween(dos.pow((numBits.divide(2)).subtract(1)), dos.pow(numBits.divide(2)).subtract(1));
}
console.log("valor p = "+p);

//q de 5 bits
while(bigInt(q).isPrime()==false) {
    q=bigInt.randBetween(dos.pow((numBits.divide(2)).subtract(1)), dos.pow(numBits.divide(2)).subtract(1));
}
console.log("valor q = "+q);

var n=bigInt(q).multiply(p);
console.log("valor n = "+n);
var e= bigInt(65537);
var fiDeN=bigInt(q.subtract(1)).multiply(p.subtract(1));
console.log("valor fi de n = "+ fiDeN);

console.log("clave publica: e: 65537 -- n: " + n);
/*
//para el heade pasarle contrasena sino no va.
var auth = function(req, res, next) {
    if (req.headers.token === "password123456") {
        return next();
    }else{
        return next(new Error('No autorizado'));
    }
};
*/

var msg = bigInt(1000);  // Any integer in the range [0, n)
var enc = msg.modPow(e, n);
console.log("encripted: " + enc);

//var decripted = enc.modPow(d, n);

// http://localhost:8080/api/:coleccion/:id
app.param('coleccion', function(req, res, next, coleccion){
    req.collection = db.collection(coleccion);
    return next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(allowMethods);
app.use(allowCrossTokenHeader);

// POST
app.post("/api/:coleccion", function(req,res,next){
    req.collection.insert(req.body, {}, function(e, result){
        if(e) return next();
        res.send(result);
    });
});

app.get('/api/:coleccion', function(req, res, next) { req.collection.find({},{
    limit:20, sort: [['_id',-1]] }).toArray(function(e, results){
    if (e) return next(e);
    res.send(results);
});
});

app.get('/api/:coleccion/:id', function(req, res, next) { req.collection.findOne({_id: id(req.params.id) }, function(e, result){
    if (e) return next(e);
    res.send(result);
}); });

// PUT
app.put('/api/:coleccion/:id', function(req, res, next) {
    req.collection.update({ _id: id(req.params.id)
    }, {$set:req.body}, {safe:true, multi:false}, function(e, result){
        if (e) return next(e);
        res.send((result === 1) ? {msg:'success'} : {msg:'error'});
    }); });
// DELETE
app.delete('/api/:coleccion/:nombre', function(req, res, next) { req.collection.remove({nombre : nombre(req.params.nombre) },
    function(e, result){
        if (e) return next(e);
        res.send((result === 1) ? {msg:'success'} : {msg:'error'});
    }); });


app.listen(8080, function(){
    console.log ('Servidor escuchando en puerto 8080');
});

