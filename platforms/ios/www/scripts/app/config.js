var EnviromentType = class {
    static #_dev = "DEV";
    static #_qa = "QAS";
    static #_prod = "PROD";

    static get dev(){ return this.#_dev }
    static get qa(){ return this.#_qa }
    static get prod(){ return this.#_prod }
}


var deployEnviron = 'release';
var showChangeUser = false;

var environmentConfig = EnviromentType.qa;
var vesionAppConfig = "6.0.3";
var serviceUrl = "";

let tenant = "";
var clientId = "";
var clientSecret = "";
var redirect_uri = "";

switch(environmentConfig){
    case EnviromentType.dev:
        serviceUrl = "http://192.168.1.67/CMT.Services";
    break;
    case EnviromentType.qa:
        serviceUrl = "https://qa.www.wesignapp.com/services";
    break;
    case EnviromentType.prod:
        serviceUrl = "https://www.wesignapp.com/services";
    break;
}

if(EnviromentType.prod == environmentConfig ){
    clientId = "";
    clientSecret = "";
    redirect_uri = "https%3A%2F%2Fwww.wesignapp.com%2F%23%2Foauth%2FloginCallback?state=300";
}else{
    clientId = "";
    clientSecret = "";
    redirect_uri = "https%3A%2F%2Fqa.www.wesignapp.com%2F%23%2Foauth%2FloginCallback?state=300";
}

var currencyToken = '\u20AC';
