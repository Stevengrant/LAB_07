'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT;

const app = express();
app.use(cors());

app.get('/', (request, response) => {
  response.send('Hello world I\'m live');
});

app.get('/location', (request, response) => {
  try {
    // console.log('req:',request.query.location)
    const locationData = searchToLatLng(request.query.location);
    //get the
    response.send(locationData);
  } catch (e) {
    console.log('error:', e);

    //catch the error
    response.status(500).send('status 500: things are wrong.');
  }
  // response.send(require('./data/geo.json'));
});
app.get('/weather', (req, res) => {
  try {
    console.log(req.query.location);
    const weather = searchWeather(req.query.location);
    res.send(weather);
    //Weather(forcast,time)
  } catch (e) {
    console.log('error:', e);
    res.status(500).send('status 500: things are wrong.');
  }
});

app.use('*', (request, response) => {
  response.status(404).send('you got to the wrong place.');
});

function Location(locationName, formatted_address, lat, lng) {
  (this.search_query = locationName), (this.formatted_query = formatted_address), (this.latitude = lat), (this.longitude = lng);
}
function Weather(forcast, time) {
  this.forcast = forcast;
  this.time = time;
}
function searchWeather(location) {
  const weatherData = require('./data/darksky.json');
  let res = [];
  let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

  weatherData.daily.data.forEach(el => {
    //https://stackoverflow.com/questions/4631928/convert-utc-epoch-to-local-date
    let date = new Date(0);
    date.setUTCSeconds(el.time);

    let weather = new Weather(el.summary, date.toLocaleDateString('en-US', options));
    res.push(weather);
  });
  return res;
}
//this is whatever the user searched for
function searchToLatLng(locationName) {
  console.log('locationName', locationName);
  const geoData = require('./data/geo.json');
  const location = new Location(locationName, geoData.results[0].formatted_address, geoData.results[0].geometry.location.lat, geoData.results[0].geometry.location.lng);
  return location;
}

app.listen(PORT, () => {
  console.log(`app is up on port ${PORT}`);
});
