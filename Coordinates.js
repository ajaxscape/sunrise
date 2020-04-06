/*
The exact limits for longitude and latitude specified by EPSG:900913 / EPSG:3785 / OSGEO:41001 are the following:
  - Valid longitudes are from -180 to 180 degrees.
  - Valid latitudes are from -85.05112878 to 85.05112878 degrees.
*/

function random (max) {
  // return random number "-max to max" down to eight decimal places
  return (Math.round(Math.random() * max * 2 * 100000000) / 100000000).toFixed(8) - max
}

class Coordinates {
  static randomLatitude () {
    // Returns random latitude to 8 decimal places
    return random(180)
  }
  static randomLongitude () {
    // Returns random latitude to 8 decimal places
    return random(85.05112878)
  }
}

module.exports = Coordinates