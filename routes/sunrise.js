const express = require('express')
const router = express.Router()
const dateFormat = require('dateformat')

const { randomLatitude, randomLongitude } = require('../components/Coordinates')
const { fetchBatch } = require('../components/SunriseData')

const maxLocations = 100
const batchSize = 5
const delay = 5000

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function millisecondsToTime (duration) {
  const seconds = Math.floor((duration / 1000) % 60)
  const minutes = Math.floor((duration / (1000 * 60)) % 60)
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
  return `${hours} hours, ${minutes} minutes, ${seconds} seconds`
}

router.get('/earliest', async (req, res) => {
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
      batchOfCoordinates.push(
        { latitude: randomLatitude(), longitude: randomLongitude() })
    }
    console.log('Retrieving: ', batchOfCoordinates)
    const batchOfLocations = await fetchBatch(batchOfCoordinates)

    const error = batchOfLocations.find((result) => typeof result !== 'object')
    if (error) {
      const status = typeof error === 'number' ? error : 500
      res.sendStatus(status)
    }

    // Add the batch of locations to those we have already collected
    locations = [...locations, ...batchOfLocations]
    console.log('Remaining: ', maxLocations - locations.length)
  }

  // Now find the earliest
  const earliest = locations.sort(({ sunrise: a }, { sunrise: b }) => a < b ? -1 : a > b ? 1 : 0).pop()

  // Now calculate the day length
  const dayLength = millisecondsToTime(
    new Date(earliest.sunset) - new Date(earliest.sunrise))
  const sunrise = dateFormat(earliest.sunrise, 'h:MM:ss TT')
  const sunset = dateFormat(earliest.sunset, 'h:MM:ss TT')
  const { latitude, longitude } = earliest

  // Return day length data and location

  const result = {
    latitude,
    longitude,
    sunrise,
    sunset,
    dayLength
  }

  console.log('')
  console.log('Earliest => ')
  console.log(result)

  res.send(result)
})

module.exports = router
