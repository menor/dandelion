// Get data for spotify for one year
// play the song
// hook the changes in the value to the changes in the song

import Cycle from '@cycle/core'
import {div, h2, input, makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'

function main (sources) {
  const changeValue$ = sources.DOM.select('#slider')
    .events('input')
    .map(ev => ev.target.value)

  const DEFAULT_VALUE = 1977
  const state$ = changeValue$.startWith(DEFAULT_VALUE)

  const vdom$ = [range$, songPlayer$]

  const range$ = state$.map(value =>
    div([
      h2('Year: ' + value),
      input('#slider', {
        type: 'range', min: 1920, max: 2016, value
      })
    ])
  )

  const getSong$ = state$.map((year) => {
    return {
      url: `https://api.spotify.com/v1/search?q=year%3A${year}&type=track`,
      method: 'GET',
      Accept: 'application/json',
      Authorization: 'Bearer BQA8On_pUfgmdAGr-DrW2Rc_gvtF8cnFaAarNJ33q2C-QoWW9AHH6Ux6wyWBn6IW2-oamPwe-BH0f_pGKya_lwxTSK3n6g3QD28GdcP6-1pggk0lZJA9JGT7EdnKiEghDezdnGyuObzwvYJ0e_QYIQ'
    }
  })

  const song$ = sources.HTTP.select('songs')
    .map(res => res.body)
    .startWith(null)

  const songPlayer$ = song$.map(song =>
    div(song)
  )

  const sinks = {
    DOM: vdom$,
    HTTP: getSong$
  }

  return sinks
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver()
}

Cycle.run(main, drivers)
