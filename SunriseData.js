const Axios = require('axios')

class SunriseData {
  static async fetch (latitude, longitude) {
    return Axios.get(
      `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`)
  }

  static async fetchBatch (locations = []) {
    return Promise.all(locations.map(async ({ latitude, longitude }) => {
      const result = await SunriseData.fetch(latitude, longitude)
      if (result.status === 200) {
        const { status, results } = result.data
        if (status === 'OK') {
          const { sunrise, sunset } = results
          return { latitude, longitude, sunrise, sunset }
        }
        return status
      } else {
        return result.status
      }
    }))
  }
}

module.exports = SunriseData

