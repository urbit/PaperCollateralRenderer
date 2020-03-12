import React, { Component } from 'react'
import { get } from 'lodash'
import PropTypes from 'prop-types'
// Local deps
import { initCanvas, dataURItoBlob, clone, sequence } from './lib/utils'
import { draw } from './lib/draw'
import { loadImg, loadSigil } from './lib/load'
// JSON
import templates from './templates.json'
import { version, name } from '../../package.json'

// NB: g_a_v_i_n
// dev only, used for generating documentation
// import flat from 'flat'

const SIGIL_LOADING_SIZE = 16
const CANVAS_SIZE = { x: 612, y: 792 }

// We use the Urbit HD wallet for the 'source of truth' for data printed onto the wallet. Here, we generate assets needed for downstream drawing. Most of these involve loading images, which are always loaded asynchronously in a browser environment. We extend the wallet, meaning adding new key/value pairs that contain this new data.
const extendWallet = async (wallet) => {
  // load sigil
  const patp = wallet.meta.patp
  const sigilDark = await loadSigil(SIGIL_LOADING_SIZE, patp, [
    'black',
    'white',
  ])
  wallet.meta.sigilDark = sigilDark

  const sigilLight = await loadSigil(SIGIL_LOADING_SIZE, patp, [
    'white',
    'black',
  ])
  wallet.meta.sigilLight = sigilLight

  // add the ship's azimuth url
  wallet.meta.azimuth = {
    url: `bridge.urbit.org`,
  }

  // get the renderer lib name and version number
  wallet.meta.renderer = {
    version: `v${version}`,
    name: name,
  }

  // prepend a 'v' on urbit-key-generator's version number
  wallet.meta.generator = {
    version: `v${wallet.meta.generator.version}`,
  }

  // Add the date created with formatting
  const date = new Date()
  console.log(date)
  wallet.meta.dateCreated = `${date.getUTCDate()}/${date.getUTCMonth() +
    1}/${date
    .getUTCFullYear()
    .toString()
    .slice(-2)}`

  // used to generate data for documentation and tests
  // if (process.env.NODE_ENV === 'development') {
  //   console.log(JSON.stringify(Object.keys(flat(wallet)), null, ' '))
  // }

  return wallet
}

const givenName = (page) => {
  const { usage } = page
  if (usage === 'ticket') return 'Master Ticket'
  if (usage === 'shard1') return 'Master Ticket Shard 1'
  if (usage === 'shard2') return 'Master Ticket Shard 2'
  if (usage === 'shard3') return 'Master Ticket Shard 3'
  if (usage === 'management') return 'Management Proxy'
  if (usage === 'voting') return 'Voting Proxy'
  if (usage === 'spawn') return 'Spawn Proxy'
  if (usage === 'transfer') return 'Transfer Proxy'
}

// apply the data in wallet to templates
const merge = (pair) => {
  const { templates, wallet } = pair

  const docket = templates.filter((template) => {
    return template.classOf === 'all' || template.classOf === wallet.meta.tier
  })

  const filledTemplates = docket.map((template) => {
    const filledElems = template.elements.map((elem) => {
      if (elem.path === null) return elem
      if (elem.data !== null) return elem

      // get data from wallet when given a path
      if (elem.path !== null) {
        var data = get(wallet, elem.path)

        // capitalize planet/galaxy/star class tier
        if (elem.path === 'meta.tier') {
          data = data.charAt(0).toUpperCase() + data.substring(1)
        }

        return {
          ...elem,
          data: data,
        }
      }
    })
    return {
      ...template,
      elements: filledElems,
    }
  })
  return {
    templates: filledTemplates,
    wallet: wallet,
  }
}

// For each te
const generatePng = (canvas, pair, debug, output) => {
  const imageFrames = pair.templates.map((page) => {
    const ctx = canvas.getContext('2d')

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#FFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    page.classOf =
      page.classOf.charAt(0).toUpperCase() + page.classOf.substring(1)
    // console.log(page.classOf)
    page.elements.forEach((elem) => {
      try {
        draw[elem.draw](ctx, elem)
      } catch (e) {
        console.error(e)
        console.error('page', ...page)
        console.error('elem', ...elem)
        console.error('draw[elem.draw]', draw[elem.draw])
      }
    })

    // draw layout grid if debug mode is on
    if (debug === true) {
      const cols = [96, 186, 206, 296, 316, 406, 426, 516]

      const cardEdges = [80, 532]

      const bl4 = 4
      const bl8 = 8
      const bl16 = 16

      sequence(Math.floor(CANVAS_SIZE.y / bl8)).forEach((y) => {
        ctx.strokeWidth = 1
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.25)'
        ctx.beginPath()
        ctx.moveTo(0, y * bl8)
        ctx.lineTo(CANVAS_SIZE.x, y * bl8)
        ctx.stroke()
      })

      sequence(Math.floor(CANVAS_SIZE.y / 16)).forEach((y) => {
        ctx.strokeWidth = 1
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)'
        ctx.beginPath()
        ctx.moveTo(0, y * bl16)
        ctx.lineTo(CANVAS_SIZE.x, y * bl16)
        ctx.stroke()
      })

      // draw the layout columns
      cols.forEach((x) => {
        ctx.strokeWidth = 1
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, CANVAS_SIZE.y)
        ctx.stroke()
      })

      // Draw the edges of the card-shaped outline
      cardEdges.forEach((x) => {
        ctx.strokeWidth = 1
        ctx.strokeStyle = 'rgba(255, 0, 255, 0.5)'
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, CANVAS_SIZE.y)
        ctx.stroke()
      })
    }

    const imgURI = canvas.toDataURL('image/png')
    const pageName = givenName(page)

    if (output === 'png') {
      return {
        ...page,
        givenName: pageName,
        image: dataURItoBlob(imgURI),
      }
    }

    if (output === 'uri') {
      return {
        ...page,
        givenName: pageName,
        image: imgURI,
      }
    }
  })

  return {
    ...pair,
    frames: imageFrames,
  }
}

class PaperRenderer extends Component {
  constructor(props) {
    super(props)
    this.canvasRef = React.createRef()
    this.canvas = null
  }

  async componentDidMount() {
    this.canvas = initCanvas(this.canvasRef.current, CANVAS_SIZE, 4)

    // Prevent crashing if canvas.toDataURL is disabled for
    // tracking reaons
    if (canvas.toDataURL('image/png').length === 0) {
      return
    }

    // An array of extendWallet promises
    const _extendedWallets = this.props.wallets.map((wallet) => {
      return extendWallet(clone(wallet))
    })

    // Resolve the promises, which results in the same wallet structure but a few new keys like sigil and qr img data, as well as meta.azimuthUrl and meta.createdOn.
    const extendedWallets = await Promise.all(_extendedWallets)

    // Pair wallets and templates. Even though no templates have been altered yet, we will programmatically alter the shard templates in the next step. Since shards are wallet-specific, we don't want to separate wallets from their templates from now on.
    const pairs = extendedWallets.map((wallet) => {
      return {
        templates: templates.frames,
        wallet: wallet,
      }
    })

    // Now we have something like this:
    // [
    //  { templates: Array(13), wallet: {…}}
    //  { templates: Array(13), wallet: {…}}
    // ]

    // For each pages/wallet pair, insert data from wallet into template elements
    const filledPairs = pairs.map((pair) => {
      return merge(pair)
    })

    // For each pair of wallet + templates, descend into the pages of each template, and again to each element of each template. Using the 'draw' property, call the function with a matching name to draw the data to the canvas. Do this for each element of each page, retrieve the image data from the canvas context and then clear the canvas before starting a new page.
    const trios = filledPairs.map((pair) => {
      // console.log(pair)
      return generatePng(this.canvas, pair, this.props.debug, this.props.output)
    })

    // Now, we have something that looks like this. Note the new key.
    // [
    //  { pages: Array(15), templates: Array(15), wallet: {…}}
    //  { pages: Array(13), templates: Array(13), wallet: {…}}
    // ]

    // clear the context after all images have rendered.
    const ctx = this.canvas.getContext('2d')
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (this.props.verbose === true) {
      this.props.callback(trios)
    }

    // return the resolved array of wallet/template pairs to the caller
    this.props.callback(
      trios.map((trio) => {
        return {
          frames: trio.frames,
          wallet: trio.wallet,
        }
      })
    )
  }

  render() {
    const style = this.props.show
      ? {}
      : { position: 'fixed', top: '-9999px', left: '-9999px' }
    return (
      <canvas
        style={style}
        className={this.props.className}
        ref={this.canvasRef}
      />
    )
  }
}

PaperRenderer.propTypes = {
  wallets: PropTypes.array.isRequired,
  className: PropTypes.string,
  callback: PropTypes.func.isRequired,
  show: PropTypes.bool,
  debug: PropTypes.bool,
  output: PropTypes.oneOf(['png', 'uri']),
  verbose: PropTypes.bool,
}

PaperRenderer.defaultProps = {
  wallets: [],
  className: '',
  callback: () => {},
  show: false,
  debug: false,
  output: 'png',
  verbose: false,
}

export default PaperRenderer
