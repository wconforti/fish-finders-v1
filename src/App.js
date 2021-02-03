
import './App.css';

import MapView from "./components/MapView";
import MapViewer from "./components/MapViewer";
import MapViewerClass from "./components/MapViewerClass";

//console.log("MAPBOX_ACCESS_TOKEN: " + process.env.REACT_APP_MAPBOX_ACCESS_TOKEN);

function App() {
  return (
    <div className="App">
      { /* <MapView></MapView>*/ }
      <MapViewer></MapViewer>
      { /* <MapViewerClass></MapViewerClass>*/ }
    </div>
  );
}

export default App;
