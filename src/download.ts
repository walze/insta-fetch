/* eslint-disable camelcase */
import Axios from 'axios'
import fs from 'fs'

import node from '../data.json'
import { Edge$ } from '.'

const edges: Edge$[] = node

const download = (uri: string, filename: string) => Axios
  .get(uri, { responseType: 'stream' })
  .then(response => response.data
    .pipe(fs.createWriteStream('./images/' + filename))
  )

edges.map(({ display_url, shortcode }) => {
  console.log(shortcode)
  download(display_url, shortcode + '.png')
})
