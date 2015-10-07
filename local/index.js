
var express = require('express');
var serveStatic = require('serve-static');

var app = express();

var morgan = require('morgan');
app.use(morgan("combined"));

var staticOptions = {
    maxAge:0,
    'index': ['index.html']
};

app.use(function(req, res, next) {
    if (true || req.url === "/js/server.js") {
        var server = serveStatic(__dirname + "/../dist", staticOptions);
        return server(req,res,next);
    }
    next();
});
app.use(serveStatic(__dirname + "/../www", staticOptions));

var server = app.listen(4005, function() {
    console.log("Your local server is accessible on " + server.address().address + ":" + server.address().port);
});