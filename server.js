'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT;
const superagent = require('superagent');
const GEOCODE_API_KEY = process.env.GEOCODE_API_KEY;

// middleware ====================================
const app = express();
app.use(cors());

// Routes ========================================

// Home page
app.get('/', (request, response) => {
  response.send('Hello world I\'m live');
});

// Location page
app.get('/location', (request, response) => {
  try {
    const locationData = searchToLatLng(request, response);
    //get the
    // response.send(locationData);
  } catch (e) {
    console.log('error:', e);

    //catch the error
    // response.status(500).send('status 500: things are wrong.');
  }
  // response.send(require('./data/geo.json'));
});

// Weather Page
app.get('/weather', (req, res) => {
  try {
    const weather = searchWeather(req.query.location);
    res.send(weather);
    //Weather(forcast,time)
  } catch (e) {
    console.log('error:', e);
    res.status(500).send('status 500: things are wrong.');
  }
});

// Wrong Page
app.use('*', (request, response) => {
  response.status(404).send('you got to the wrong place.');
});

// Functions and Object constructors =========================
function Location(locationName, formatted_address, lat, lng) {
  (this.search_query = locationName), (this.formatted_query = formatted_address), (this.latitude = lat), (this.longitude = lng);
}

function Weather(forcast, time) {
  this.forcast = forcast;
  this.time = time;
}

function searchWeather(location) {
  let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const weatherData = require('./data/darksky.json');
  let res = weatherData.daily.data.map(element => {
    //https://stackoverflow.com/questions/4631928/convert-utc-epoch-to-local-date
    let date = new Date(0);
    date.setUTCSeconds(element.time);
    return new Weather(element.summary, date.toLocaleDateString('en-US', options));
  });

  return res;
}

//this is whatever the user searched for
function searchToLatLng(req, res) {
  console.log('here');
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

  // console.log('locationName', locationName);
  // const geoData = require('./data/geo.json');
  // const location = new Location(locationName, geoData.results[0].formatted_address, geoData.results[0].geometry.location.lat, geoData.results[0].geometry.location.lng);
  // return location;
}

app.listen(PORT, () => {
  console.log(`app is up on port ${PORT}`);
});
