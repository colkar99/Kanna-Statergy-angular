var http = require('http');

//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
var options = {
  host: 'kite.zerodha.com',
  path: '/oms/instruments/historical/8972290/5minute?user_id=WB5864&oi=1&from=2022-12-01&to=2023-01-02',
  headers: {'authorization': 'enctoken dderKfuUlexIcFrXiMGcFxkuV6x81mJJDPb8/t18HJaf5xqttYHvJtsJjiwicqgAfEZ0hggaJe8bbDvkZH6m6UQ/FU+NFfsf7AFCHZ/3yBES2CeaLrTMzw=='},
  method: 'GET'
};

callback = function(response) {
    var str = '';
  
    //another chunk of data has been received, so append it to `str`
    response.on('data', function (chunk) {
      str += chunk;
    });
  
    //the whole response has been received, so we just print it out here
    response.on('end', function () {
      console.log(str);
    });
  }
  
  http.request(options, callback).end();