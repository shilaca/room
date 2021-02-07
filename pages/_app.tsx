import { AppProps } from 'next/app'
import { Provider } from 'react-redux'
import { useStore } from '../libs/redux/store'

function App({ Component, pageProps }: AppProps) {
  const store = useStore(pageProps.initialReduxState)

  return (
    <Provider store={store}>
      <Component {...pageProps}></Component>
    </Provider>
  )
}
export default App
