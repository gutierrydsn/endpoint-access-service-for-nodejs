function HttpServer(pPort, pRoute, pPathControllers){
    const http  = require('http' );    
    const Route = require('./http-route');

    this.route           = pRoute || require('../../route').route;
    this.pathControllers = pPathControllers || '../../';
    this.port            = pPort;
    this.allowAllCors    = false;

    response = (req, res) => {        
        var httpRoute = new Route.HttpRoute();

        httpRoute.pathControllers = this.pathControllers;
        httpRoute.route = this.route; 
        httpRoute.req   = req; 
        httpRoute.res   = res;

        var head = undefined;
        
        head = {
            "Content-Type": "application/json; charset=utf-8"
        };

        if (this.allowAllCors){
            head = {
                "Content-Type"                     : "application/json; charset=utf-8",
                "Access-Control-Allow-Origin"      :"*" ,
                "origin"                           : '*',
                "Access-Control-Allow-Headers"     : '*',
                "Access-Control-Expose-Headers"    : '*',
                "Access-Control-Request-Method"    : '*',
                "Access-Control-Request-Headers"   : '*',
                "Access-Control-Allow-Credentials" : 'true',
                "Access-Control-Allow-Methods"     : '*'
            }   
        };

        try {            
            var result = JSON.stringify(httpRoute.response());
            res.writeHead(res.statusCode , head);
        }
        catch (e){
            res.writeHead(500, head);
            res.end('Error:' + e.message);
            console.log(e);
        }        
    }

    this.start = () => {
        const server = http.createServer(function (req, res){response(req, res)} );
        server.listen(this.port, '', callBackStartServer());
    }

    callBackStartServer = () => {
        console.log('Servidor iniciado na porta:' + this.port)
    }
}

module.exports.HttpServer = HttpServer;