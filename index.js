const express = require('express')
const dateFormat = require('dateformat')

const { randomLatitude, randomLongitude } = require('./Coordinates')
const { fetchBatch } = require('./SunriseData')

const app = express()
const port = process.env.PORT || '8000'

const maxLocations = 5
const batchSize = 5
const delay = 5000

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function millisecondsToTime(duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  return `${hours} hours, ${minutes} minutes, ${seconds} seconds`
}

app.get('/', async (req, res) => {
  let locations = []

  // Retrieve the required number of locations in batches
  while (locations.length < maxLocations) {
    // Sleep 5 seconds between each batch of requests
    if (locations.length) {
      await sleep(delay)
    }

    // Get a batch of random locations
    const batchOfCoordinates = []
    while (batchOfCoordinates.length < batchSize) {
      batchOfCoordinates.push({ latitude: randomLatitude(), longitude: randomLongitude() })
    }
    const batchOfLocations = await fetchBatch(batchOfCoordinates)

    const error = batchOfLocations.find((result) => typeof result !== 'object')
    if (error) {
      const status = typeof error === 'number' ? error : 500
      res.sendStatus(status)
    }

    // Add the batch of locations to those we have already collected
    locations = [...locations, ...batchOfLocations]
  }

  // Now find the earliest
  const earliest = locations.sort(
    ({ sunrise: a }, { sunrise: b }) => {
      return a < b ? -1 : a > b ? 1 : 0
    }).pop()

  // Now calculate the day length
  const dayLength = millisecondsToTime(new Date(earliest.sunset) - new Date(earliest.sunrise))
  const sunrise = dateFormat(earliest.sunrise, 'h:MM:ss TT')
  const sunset = dateFormat(earliest.sunset, 'h:MM:ss TT')
  const { latitude, longitude } = earliest

  // Return day length data and location
  res.send({
    latitude,
    longitude,
    sunrise,
    sunset,
    dayLength
  })
})

app.listen(port, () => {
  console.log(`Listening to requests on http://localhost:${port}`)
})