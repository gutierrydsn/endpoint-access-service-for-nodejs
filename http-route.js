function HttpRoute(req, res, route, pathControllers) {
    
    const PREFIX_PARAMETER  = ':';
    const PREFIX_QUERY_PARM = '?';
    const BACK_SLASH        = '/';
    const POINT_STR         = '.';
    const START_PARAM       = '(';
    const END_PARAM         = ')';
    const PARTING           = ',';
    const EMPTY_STR         = '' ;
   
    this.pathControllers = pathControllers;
    this.req = req; 
    this.res = res; 
    this.route = route;   

    this.response              = response;
    this.endPoint              = endPoint;
    this.getEndPoint           = getEndPoint;
    this.removeBackSlash       = removeBackSlash;
    this.mathRoute             = mathRoute;
    this.getArgs               = getArgs;
    this.getParams             = getParams;
    this.getMethodUnlessParams = getMethodUnlessParams;
    this.callMethod            = callMethod;
    this.callMethodModuleClass = callMethodModuleClass;
    this.callMethodModule      = callMethodModule;
    this.logCall               = logCall;

    function response(){ 
        return this.endPoint(this.req.url, this.req.method);
    }

    function endPoint(endpoint, route_type){
        var data_route = this.getEndPoint(endpoint, route_type);

        if (!data_route){
            this.res.statusCode = 404;
            this.res.end();
        }

        return data_route ? this.callMethod(data_route) : '404';
    }

    function getEndPoint(uri, type){
        var blocks_uri  = this.removeBackSlash(uri).split(BACK_SLASH);
        var list_routes = this.route[type];

        data_route = undefined;
        for (var item in list_routes){
            var blocks_route = this.removeBackSlash(item).split(BACK_SLASH);

            math = this.mathRoute(blocks_uri, blocks_route);
            if (!math){
                continue;
            }

            var full_method = list_routes[item].split(POINT_STR);
            var method    = full_method.pop();
            var className = full_method.pop();

            var params = this.getParams(method);
            var args   = this.getArgs(blocks_route, blocks_uri);

            var data_route = {
                route : item, 
                call  : list_routes[item],
                method: this.getMethodUnlessParams(method),
                class : className,
                module: this.pathControllers + full_method.join(POINT_STR),
                params: params,
                args  : args  
            }
        }

        return data_route;        
    }

    function mathRoute(blocks_uri, blocks_route){
        var qtd_blocks = blocks_uri.length;

        if (qtd_blocks != blocks_route.length){
            return false
        }

        var math = true
        for (var idx = 0; idx < qtd_blocks; idx++){
            var is_parameter  = blocks_route[idx].indexOf(PREFIX_PARAMETER) == 0;
            var math_resource = blocks_route[idx].toUpperCase() == blocks_uri[idx].toUpperCase();

            if (!(is_parameter || math_resource)){
                math = false;
                break;
            }
        }
        return math;
    }

    function removeBackSlash(value){
        var posQueryParam = value.indexOf(PREFIX_QUERY_PARM); 
        value = posQueryParam == -1 ? value : value.slice(0, posQueryParam); 

        var lastChar = value.length-1; 
        return value[lastChar] != BACK_SLASH ? value : value.slice(0, lastChar);
    }

    function getArgs(blocks_route, blocks_uri){
        var params = new Object;

        for (i = 0; i < blocks_route.length; i++){
            param = blocks_route[i].indexOf(PREFIX_PARAMETER) == 0;            
            if (param){
                key   = blocks_route[i].replace(PREFIX_PARAMETER, EMPTY_STR).trim();
                params[key] = blocks_uri[i].trim();
            }
        }
        return params;
    }

    function getParams(method_name){
        var params = new Array;

        var pos_start_param = method_name.indexOf(START_PARAM);
        var pos_end_param = method_name.indexOf(END_PARAM);

        if (pos_start_param == -1) {
            return params
        }

        if (pos_end_param == -1){
            throw  'expected )';
        }

        params = method_name.slice(pos_start_param+1,pos_end_param).split(PARTING);

        return params;       
    }

    function getMethodUnlessParams(method_name){
        var pos_start_param = method_name.indexOf(START_PARAM);
        if (pos_start_param >= 0){
            return method_name.slice(0,pos_start_param).trim();
        }
        return method_name.slice(0, method_name.length);
    }

    function callMethod(data_route){
        if (data_route.module != this.pathControllers){
            return this.callMethodModuleClass(data_route)
        }else{
            data_route.module = this.pathControllers + data_route.class;
            data_route.class  = undefined;
            
            return this.callMethodModule(data_route);
        }
    }

    function callMethodModuleClass(data_route){
        const Ctrl = require(data_route.module);

        controller = eval('new Ctrl.'+ data_route.class +'(this.req, this.res)');

        var method = data_route.method+'(data_route.args)';
        var execMethod = 'controller.'+ method;        

        this.logCall(data_route);
        return eval(execMethod);
    }

    function callMethodModule(data_route){
        const controller = require(data_route.module);

        var method = data_route.method+'(this.req, this.res, data_route.args)';
        var execMethod = 'controller.'+ method;        

        this.logCall(data_route);
        return eval(execMethod);
    }

    function logCall(data_route){
        console.log(
                      this.req.method  + ' => '     + 
                      data_route.route +' exec '    + 
                      data_route.call  + ' params: '+ 
                      JSON.stringify(data_route.args)
                   );
    }
}

module.exports.HttpRoute = HttpRoute;