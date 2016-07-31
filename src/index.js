// Get data for spotify for one year
// play the song
// hook the changes in the value to the changes in the song

import Cycle from '@cycle/core'
import {div, h2, input, makeDOMDriver} from '@cycle/dom'
// import {makeHTTPDriver} from '@cycle/http'

function main (sources) {
  const changeValue$ = sources.DOM.select('#slider')
    .events('input')
    .map(ev => ev.target.value)

  const DEFAULT_VALUE = 1977
  const state$ = changeValue$.startWith(DEFAULT_VALUE)

  const vdom$ = state$.map(value =>
    div([
      h2('Year: ' + value),
      input('#slider', {
        type: 'range', min: 1920, max: 2016, value
      })
    ])
  )

  const sinks = {
    DOM: vdom$
  }

  return sinks
}

const drivers = {
  DOM: makeDOMDriver('#app')
}

Cycle.run(main, drivers)
