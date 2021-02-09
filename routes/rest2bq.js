var express = require('express');
var router = express.Router();
const axios = require('axios');

// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');

router.post('/run/:dataset/:table', function (req, res){
  let body = req.body;
  
  console.log(body);

  let url = body.url;
  let urlupdate = body.urlupdate;

  let dataset = req.params.dataset;
  let table = req.params.table;


  console.log(url);
  console.log(urlupdate);

  axios.get(url)
  .then(response => {
    data = response.data.payload;
    var sIds = getIds(data);
    data = change(data);
    

    if(data.length > 0)
    {
      saveToBigQuery(data, dataset, table).then(function(result){
        updateIds(sIds, urlupdate).then(function(response){
          res.send({ payload: data.length, success: true })
        }).catch(err => {
          console.log(err)
          res.send(err)
        });
        
      }).catch(err => {
        console.log(err)
        res.send(err)
      });
    }
    else {
      res.send({ payload: data.length, success: true })
    }

    
  })
  .catch(error => {
    console.log(error);
  });
})

async function updateIds(sIds, url)
{
  console.log("updateIds")
  console.log(url);
  var newurl = url.replace("[ids]", sIds)
  console.log("updateIds")
  console.log(newurl);

  var promise = new Promise((resolve, reject) => {
    axios.get(newurl).then(function(response){
      resolve(response)
    }).catch(err => {
      console.log(err);
      reject(err);
    })
  }) 

  return promise;
}

function change(data)
{
  for(var i = 0; i < data.length; i++)
  {
    data[i]._id_ = data[i].id;
    delete  data[i].id;

  }

  return data;
}

function getIds(data)
{
  var sIds = '';
  for(var i = 0; i < data.length; i++)
  {
    sIds += data[i].id + ','
  }

  if(sIds.length > 0)
    sIds = sIds.substr(0, sIds.length - 1);

  return sIds;
}

async function saveToBigQuery(data, dataset, table)
{
  let jsonData = require('../config.json');
  const options = {
    keyFilename: jsonData.GCP_CREDENTIAL,
    projectId: jsonData.GCP_PROJECT,
  };

  console.log(options)

  // Create a client
  const bigqueryClient = new BigQuery(options);

  console.log("==========DATA=======")
  console.log(data)

  // Insert data into a table
  await bigqueryClient
    .dataset(dataset)
    .table(table)
    .insert(data);
  console.log(`Inserted ${data.length} rows`);

  return 
}



module.exports = router;
