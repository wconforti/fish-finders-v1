import React from 'react';
import ReactDOM from 'react-dom';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1Ijoid2NvbmZvcnRpIiwiYSI6ImNrajkyNnk3MjQ4YmEycnFqYm01cWVqamYifQ.P6dAko2hqzbdSnDOZq9IpA'
//console.log("MAPBOX_ACCESS_TOKEN: " + process.env.REACT_APP_MAPBOX_ACCESS_TOKEN);

const _gridId = "BOX"
const _gridX = 59
const _gridY = 28

const _nws_Lat = 41.377894
const _nws_Lng = 71.635437
const _nws_Rad = 10

const _mBox_Lat = 41.377894
const _mBox_Lng = -71.635437
const _mBox_Zoom = 8

class MapViewerClass extends React.Component {
    // Code from the next few steps will go here

    // Store the intial Mapbox setings in the 'state'
    // These values will change as the user interacts with the map
    constructor(props) {
        super(props);
        this.state = {
            lng: _mBox_Lng,
            lat: _mBox_Lat,
            zoom: _mBox_Zoom
        };
    }


    // Initialing the Map here ensures that Mapbox GL JS will not try to render 
    // a map before React creates the element that contains the map.
    componentDidMount() {
        const map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/outdoors-v11',
            center: [this.state.lng, this.state.lat],
            zoom: this.state.zoom
        });

        map.on('move', () => {
            this.setState({
                lng: map.getCenter().lng.toFixed(4),
                lat: map.getCenter().lat.toFixed(4),
                zoom: map.getZoom().toFixed(2)
            });
        })





    }



    render() {
        return (
            <div>
                <div ref={el => this.mapContainer = el} className="mapContainer" />
            </div>
        )
    }


}

export default MapViewerClass;
     
//ReactDOM.render(<MapViewerClass />, document.getElementById('map'));