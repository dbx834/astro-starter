// ----------------------------------------------------------------------------
// -------------------------------------------------------------------- Imports
// ----------------------------------------------------------------------------
import getRandomArbitraryInt from '../../../methods/get-random-arbitrary-int'

// ----------------------------------------------------------------------------
// ------------------------------------------------------------------- Function
// ----------------------------------------------------------------------------
/** debounceForm */
const debounceForm = (setState, fx) => {
  setState({ serverMessage: 'Working...', started: true })
  setTimeout(
    () => {
      setState({ serverMessage: 'Sending...', started: true })
      setTimeout(
        () => {
          setState({ serverMessage: 'Waiting...', started: true })
          setTimeout(
            () => {
              setState({
                serverMessage: 'Processing...',
                started: true,
              })
              setTimeout(
                () => {
                  fx()
                },
                getRandomArbitraryInt(700, 2100)
              )
            },
            getRandomArbitraryInt(700, 2100)
          )
        },
        getRandomArbitraryInt(700, 2100)
      )
    },
    getRandomArbitraryInt(700, 2100)
  )
}

// ----------------------------------------------------------------------------
// -------------------------------------------------------------------- Exports
// ----------------------------------------------------------------------------
export default debounceForm
