import React from "react";

const StationDetailsPopup = ({ feature }) => {
    const { id, stat_name, stationIdentifier } = feature.properties;

    return (
        <div id={`popup-${id}`}>
        <h5>{stat_name}</h5>
        <p>Station Type: { feature.properties.station_type }</p>
        <p>{ feature.properties.stat_Updated }</p>
        <p>{ feature.properties.stat_windDir }</p>
        <p>{ feature.properties.stat_windInfo }</p>
        <p>{ feature.properties.stat_gustInfo }</p>
        <p>{ feature.properties.stat_airTemp }</p>
        <p>{ feature.properties.stat_airPressure }</p>
        <p>{ feature.properties.stat_waterTemp }</p>
        </div>
    );

};

export default StationDetailsPopup;