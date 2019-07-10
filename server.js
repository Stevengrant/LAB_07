'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT;
const superagent = require('superagent');
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;
const WEATHER_API_KEY = process.env.WEATHER_API_KEY;

// middleware ====================================
const app = express();
app.use(cors());

// Routes ========================================

// Home page
app.get('/', (request, response) => {
  response.send('Hello world I\'m live');
});

// Location page
app.get('/location', searchToLatLng);

// Weather Page
app.get('/weather', searchWeather);

// (req, res) => {
//   try {
//     const weather = searchWeather(req.query.location);
//     res.send(weather);
//     //Weather(forcast,time)
//   } catch (e) {
//     console.log('error:', e);
//     res.status(500).send('status 500: things are wrong.');
//   }
// });

// Wrong Page
app.use('*', (request, response) => {
  response.status(404).send('you got to the wrong place.');
});

// Functions and Object constructors =========================
function Location(locationName, formatted_address, lat, lng) {
  (this.search_query = locationName), (this.formatted_query = formatted_address), (this.latitude = lat), (this.longitude = lng);
}

function Weather(forecast, time) {
  this.forecast = forecast;
  this.time = time;
}

function searchWeather(request, response) {
  const lat = request.query.data.latitude;
  const lng = request.query.data.longitude;

  const url = `https://api.darksky.net/forecast/${WEATHER_API_KEY}/${lat},${lng}`;
  console.log('url: ', url);
  superagent
    .get(url)
    .then(result => {
      console.log(Object.keys(result.body));
      //shape data
      const weatherData = result.body;
      let res = weatherData.daily.data.map(element => {
        let date = new Date(element.time * 1000).toDateString();
        return new Weather(element.summary, date);
      });
      console.log(res);
      response.send(res);
    })
    .catch(e => {
      console.error(e);
      response.status(500).send('oops');
    });

  // return res;
}

//this is whatever the user searched for
function searchToLatLng(req, res) {
  //GEOCODE_API_KEY
  let locationName = req.query.data;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${locationName}&key=${GEOCODE_API_KEY}`;

  superagent
    .get(url)
    .then(result => {
      let location = {
        search_query: locationName,
        formatted_query: result.body.results[0].formatted_address,
        latitude: result.body.results[0].geometry.location.lat,
        longitude: result.body.results[0].geometry.location.lng
      };
      res.send(location);
    })
    .catch(e => {
      console.error(e);
      res.status(500).send('oops');
    });
}

app.listen(PORT, () => {
  console.log(`app is up on port ${PORT}`);
});
