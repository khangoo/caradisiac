const {getBrands} = require('node-car-api');
const {getModels} = require('node-car-api');
var fs = require('fs');
var jsonfile = require('jsonfile');
var elasticsearch = require('elasticsearch');
const express = require('express');
const app = express();

var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});

async function getAllModels() {
    var all_models = [];
    const brands = await getBrands();

    for (var i = 0; i < brands.length; i++ ) {
        console.log("GETTING MODEL : " + i);
        var models = await getModels(brands[i]);
        models.forEach(function(model) {
            all_models.push(model);
        });
    }
    return all_models;
}

let brands = getBrand();
var list=[];
brands.then(function(result){
  for (var i = 0; i < result.length; i++) {
    details = getModel(result[i]);
    details.then(function(res){
      res.forEach(function(ele){
        list.push(ele)
      })
      var json = JSON.stringify(list)
      fs.writeFile('caradisiac.json',json,'utf8');
    })
  }
});

const port = 9292;
app.listen(port, () => {
  console.log(port);
});

app.get('/populate',function(req,res){

  var file = "./caradisiac.json";
  var caradisiac = jsonfile.readFileSync(file);

  var body = [];
  for (var i = 0; i < caradisiac.length; i++ ) {
      var config = { index:  { _index: 'caradisiac', _type: 'suv', _id: i } };
      body.push(config);
      body.push(caradisiac[i]);
  }

  client.bulk({
      body: body
  }, function (error, response) {
      if (error) {
          console.error(error);
          return;
      }
      else {
          console.log(response);
      }
  });
  res.send("Data saved in elasticsearch");
})
