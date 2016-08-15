import xs from 'xstream'
import Cycle from '@cycle/rx-run'
import {makeDOMDriver} from '@cycle/dom'
import {makeHTTPDriver} from '@cycle/http'
import {html} from 'snabbdom-jsx'

// View (integer) => html
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

// View (song::object) => html
const renderSong = (song) =>
  <div className='song-details'>
    <h2 className='song-name'>{ song.name }</h2>
    <h1 className='song-artist'>{ song.artist }</h1>
    <h3 className='song-album'>{ song.album }</h3>
  </div>

// Main function
function main (sources) {
  // Define initial values here
  const initialState = {
    year: 1977,
    song: {
      'name': 'Dame Dame',
      'artist': 'Goyo Ramos',
      'album': 'Donde estara el dinero de Rafael'
    }
  }

  // year$ is a stream of changes in the slider
  // it's the DOM source
  const year$ = sources.DOM.select('#slider')
    .events('input')
    .map(ev => ev.target.value)
    .startWith(initialState.year)

  // We compute this based on year$ to send the request
  const requestSong$ = year$
    .map(year => {
      return {
        url: `https://api.spotify.com/v1/search?q=year%3A${year}&type=track`,
        method: 'GET',
        Accept: 'application/json',
        Authorization: 'Bearer BQCG17IYHjhz_geUDdqHuOTDRZ9vl_sy4GPxQth6yXG0K6EcIKrtVwB8qytAHtTlfY6JEBmBcYqbawiwBq3i6WNOG_roSLZLSfVknUQIH2LZS4wLrbadVLrnYfRAPQmsoSWTqiJ8rKxDIxz88oPa2w'
      }
    })

  // We handle the response here (source)
  // response$$ means it's a stream that emits response streams
  // ----------r-----------------r-------------------------r------
  // ----------\--a              \--b---b-b                \--c
  const {response$$} = sources.HTTP
  console.log(response$$)
  const song$ = response$$.map(response => response.body)
  console.log(song$)
  // We derive the state from the year but still need to incorporate
  // the songsRequest$
  const state$ = xs.combine(year$, requestSong$)

  const vtree$ = state$.map(([year, song]) =>
    <div>
      { renderSlider(year) }
      <hr/>
    </div>
  )

  const sinks = {
    DOM: vtree$,
    HTTP: request$
  }

  return sinks
}

const drivers = {
  DOM: makeDOMDriver('#app'),
  HTTP: makeHTTPDriver()
}

Cycle.run(main, drivers)
