// Get data for spotify for one year
// play the song
// hook the changes in the value to the changes in the song
// import xs from 'xstream'
import Cycle from '@cycle/rx-run'
import {makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import {html} from 'snabbdom-jsx'

// DOM source: slider value
// HTTP sink: request sent
// HTTP source: response received
// DOM sink: data displayed

const renderSlider = (value) =>
  <div>
    <h2>Year: {value}</h2>
    <input
      id='slider'
      type='range'
      min='1920'
      max='2016'
      value={value}
    />
  </div>

const renderSong = (song) =>
  <div className='song-details'>
    <h2 className='song-name'>{ song.name }</h2>
    <h1 className='song-artist'>{ song.artist }</h1>
    <h3 className='song-album'>{ song.album }</h3>
  </div>

function main (sources) {
  const initialState = {
    year: 1977
  }

  // year$ is a stream of changes in the slider
  const year$ = sources.DOM.select('#slider')
    .events('input')
    .map(ev => ev.target.value)

  // We compute this based on year$ to send the request
  const requestSong$ = year$
    .map(year => {
      return {
        url: `https://api.spotify.com/v1/search?q=year%3A${year}&type=track`,
        method: 'GET',
        Accept: 'application/json',
        Authorization: 'Bearer BQA8On_pUfgmdAGr-DrW2Rc_gvtF8cnFaAarNJ33q2C-QoWW9AHH6Ux6wyWBn6IW2-oamPwe-BH0f_pGKya_lwxTSK3n6g3QD28GdcP6-1pggk0lZJA9JGT7EdnKiEghDezdnGyuObzwvYJ0e_QYIQ'
      }
    })

  // We handle the response here (source)
  // response$$ means it's a stream that emits response streams
  // ----------r-----------------r-------------------------r------
  // ----------\--a              \--b---b-b                \--c
  // const response$$ = sources.HTTP
  //
  // const response$ = response$$.switch()
  // const song$ = response$.map(response => response.body)

  // We derive the state from the year but still need to incorporate
  // the songsRequest$
  const state$ = year$.startWith(initialState.year)

  const testSong = {
    'name': 'Dame Dame',
    'artist': 'Goyo Ramos',
    'album': 'Donde estara el dinero de Rafael'
  }

  const vdom$ = state$.map(value =>
    <div>
      { renderSlider(value) }
      <hr/>
      { renderSong(testSong) }
    </div>
  )

  const sinks = {
    DOM: vdom$,
    HTTP: requestSong$
  }

  return sinks
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver()
}

Cycle.run(main, drivers)
