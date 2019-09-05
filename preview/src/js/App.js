import React, { Component } from 'react'
import wallets from './sampleWallets/sampleWallet0.json'
// import wallets from './sampleWallets/sampleWallet1.json'
// import wallets from './sampleWallets/sampleWallet2.json'
// import wallets from './sampleWallets/sampleWallet3.json'
// import wallets from './sampleWallets/sampleWallet4.json'
import templates from '../../../lib/src/templates.json'
import FileSaver from 'file-saver'

import PaperRenderer from '../../../lib/dist/index.js'

import jsPDF from 'jsPDF'
class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      out: [],
    }
  }

  handleOutput = (data) => {
    this.setState({ out: data })
    console.log('Out: ', data)
  }

  handleImgOnClick = (data, fileName) => {
    FileSaver.saveAs(data, fileName)
  }

  handleDownload = () => {
    const imgs = Object.values(document.getElementsByTagName('img'))
    var pdf = new jsPDF()
    imgs.forEach(function(img) {
      pdf.addImage(
        img.src,
        'JPEG',
        0,
        0,
        img.clientWidth / 4,
        img.clientHeight / 4
      )
      pdf.addPage()
    })
    pdf.deletePage(pdf.internal.getNumberOfPages())
    pdf.save('wallets.pdf')
  }

  render() {
    const fontCount = templates.frames.reduce((acc, page) => {
      page.elements.forEach((elem) => {
        const key = `${elem.fontFamily}-${elem.fontWeight}`
        if (acc[key] === undefined) {
          acc[key] = 1
        } else {
          acc[key] = acc[key] + 1
        }
      })
      return acc
    }, {})

    // don't do this in prod code!
    delete fontCount['undefined-undefined']

    const disableDownload = this.state.out.length === 0

    return (
      <div>
        <div>
          <h3>Fonts</h3>
          <p>
            In order to test this, you must open font book and disable Inter,
            Inter UI and Source Code Pro or any fonts this library uses.
          </p>
          <p>Expected Fonts</p>
          <pre>{JSON.stringify(fontCount, null, ' ')}</pre>
          <button onClick={() => this.handleDownload()}>Download</button>
        </div>
        {
          <PaperRenderer
            debug={false}
            wallets={wallets}
            output="uri"
            callback={(data) => this.handleOutput(data)}
          />
        }

        {this.state.out.map((duo) => {
          return duo.frames.map((page, idx) => {
            return (
              <img
                onClick={() =>
                  this.handleImgOnClick(
                    page.image,
                    `${duo.wallet.meta.patp}-${page.givenName}.png`
                  )
                }
                key={`page-${idx}`}
                style={{
                  maxWidth: '850px',
                  height: 'auto',
                }}
                src={page.image}
              />
            )
          })
        })}
      </div>
    )
  }
}

export default App
