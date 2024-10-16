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

let tenant = "8b86a65e-3c3a-4406-8ac3-19a6b5cc52bc";
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
    clientId = "7b71c680-e574-49ff-8ba9-32681a2b7f19";
    clientSecret = "Hvp8Q~g6VZ4HA.hBd6Oxor3CeDocjq1.IF6bTbm7";
    redirect_uri = "https%3A%2F%2Fwww.wesignapp.com%2F%23%2Foauth%2FloginCallback?state=300";
}else{
    clientId = "d9b8c28f-09ba-4d30-ae36-d5f26b38564b";
    clientSecret = "wtL8Q~NY1ft-hnYXdT6dfCZfiQtx3LROtnRM5acj";
    redirect_uri = "https%3A%2F%2Fqa.www.wesignapp.com%2F%23%2Foauth%2FloginCallback?state=300";
}

var currencyToken = '\u20AC';
