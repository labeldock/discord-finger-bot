import { BrowserRouter } from "react-router-dom"
import App from './App'
import ReactDOM from 'react-dom/client'
import './assets/index.scss';

const root = document.getElementById('app')
ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
