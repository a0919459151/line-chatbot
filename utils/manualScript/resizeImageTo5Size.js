const sharp = require('sharp')

const imageFilePathmapWidths = [240, 300, 460, 700, 1040]

function main (imageFilePath) {
  for (const width of imageFilePathmapWidths) {
    sharp(imageFilePath)
      .resize({ width })
      .toFile(`${width}`)
  }
}

// main('image.jpg')
