import { createRoot } from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './styles/index.css';
import App from './App.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { store } from './redux/store.ts';
import { Provider } from 'react-redux';

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
    <App />
  </Provider>
);
