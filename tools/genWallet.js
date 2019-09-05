const kg = require('urbit-key-generation')
const ob = require('urbit-ob')
const fs = require('fs')

const OUTPUT_PATH = 'preview/src/js/sampleWallets'
const NUM_WALLET_FILES = 1

const randNumBit = (num) => {
  const min = Math.pow(2, num - 1) - 1
  const max = Math.pow(2, num) - 1
  return Math.floor(Math.random() * (max - min) + min)
}

const writeData = (data, path) => {
  // console.log(data)
  const fmtData = JSON.stringify(data, null, 2)
  fs.writeFile(path, fmtData, (err) => {
    if (err) throw err
  })
}

// string: outputPath
// optional bool: planet wallet generation, default true
// optional bool: star wallet generation, default true
// optional bool: galaxy wallet generation, default true
// optional int: num of sampleWallet files to generate, default 1
const createSampleWallets = async (
  planetNums = null,
  starNums = null,
  galaxyNums = null,
  outputPath = OUTPUT_PATH,
  planet = true,
  star = true,
  galaxy = true,
  num = NUM_WALLET_FILES
) => {
  for (var i = 0; i < num; i++) {
    var sampleWallet = []
    const path = `${outputPath}/sampleWallet${i}.json`
    var planetNum = planetNums === null ? randNumBit(32) : planetNums[i]
    var starNum = starNums === null ? randNumBit(16) : starNums[i]
    var galaxyNum = galaxyNums === null ? randNumBit(8) : galaxyNums[i]

    const planetWallet = await kg.generateWallet({
      ship: planetNum,
      ticket: '~marbud-tidsev-litsut-hidfep',
    })
    const starWallet = await kg.generateWallet({
      ship: starNum,
      ticket: '~marbud-tidsev-litsut-hidfep-marbud-tidsev-litsut-hidfep',
    })
    const galaxyWallet = await kg.generateWallet({
      ship: galaxyNum,
      ticket:
        '~wacfus-dabpex-danted-mosfep-pasrud-lavmer-nodtex-taslus-pactyp-milpub-pildeg-fornev-ralmed-dinfeb-fopbyr-sanbet-sovmyl-dozsut-mogsyx-mapwyc-sorrup-ricnec-marnys-lignex',
    })

    if (planet) {
      sampleWallet.push(planetWallet)
    }
    if (star) {
      sampleWallet.push(starWallet)
    }
    if (galaxy) {
      sampleWallet.push(galaxyWallet)
    }

    writeData(sampleWallet, path)
  }

  console.log(
    `Saved ${num} wallet${
      num > 1 ? 's' : ''
    } in ${outputPath}. \nWallet types: planet--${planet}, star--${star}, galaxy--${galaxy}`
  )
}
// completely random
// createSampleWallets()

// stable execution
planetNums = [2201654818, 2359800187, 3864933521, 3137227147, 2966915059]
starNums = [64954, 53604, 35352, 35393, 45119]
galaxyNums = [198, 254, 135, 186, 230]
createSampleWallets(
  planetNums,
  starNums,
  galaxyNums,
  OUTPUT_PATH,
  true,
  true,
  true,
  5
)

// 5 completely random
// createSampleWallets(null, null, null, OUTPUT_PATH, true, true, true, 5)
