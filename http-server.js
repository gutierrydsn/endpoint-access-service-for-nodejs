function HttpServer(pPort, pPathControllers){
    
    const route = require('./http-route');

    this.start = start;
    
    var pathControllers = pPathControllers || './';

    const http  = require('http' );

    const server = http.createServer(function (req, res){response(req, res)} );

    var port = pPort;

    function response(req, res){        
        var httpRoute = new route.HttpRoute();

        httpRoute.pathControllers = pathControllers;
        httpRoute.req = req; 
        httpRoute.res = res;

        var head = {
            'Content-Type': 'application/json; charset=utf-8'
        }
        
        try {            
            var result = httpRoute.response();
            res.writeHead(res.statusCode , head);
            res.end(result);
        }
        catch (e){
            res.writeHead(500, head);
            res.end('Error:' + e.message);
            console.log(e);
        }        
    }

    function start(){
        server.listen(port, '', callBackStartServer());
    }

    function callBackStartServer(){
        console.log('Servidor iniciado na porta:' + port)
    }
}

    module.exports.HttpServer = HttpServer;