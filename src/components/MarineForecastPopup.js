import React from "react";
import axios from 'axios';

const MarineForecastPopup = ({ feature }) => {

    const { id, zone_name, zone_type } = feature.properties;

    // console.log("id ==> " + id);
    // console.log("zone_name ==> " + zone_name);
    // console.log("zone_type ==> " + zone_type);

    const apiUrl = `https://tgftp.nws.noaa.gov/data/forecasts/marine/${zone_type}/an/${id.toString().toLowerCase()}.txt`;
    //const apiUrl = `http://localhost:8181/${zone_type}/an/${id.toString().toLowerCase()}.txt`;
    const [responseData, setResponseData] = React.useState();
    const [responseErrors, setResponseErrors] = React.useState();

    // console.log(apiUrl);
    React.useEffect(() => {
        fetch(apiUrl, {
            mode: 'cors', // no-cors, *cors, same-origin,
        }).then(function(response) {

            response.text().then(function(text) {
                var getText = text;
                setResponseData(getText);
            })

        }).catch(function(error) {
            setResponseErrors(error);
        });
    }, [setResponseData, setResponseErrors, apiUrl]); // Dependencies !!!

    console.log("MarineForecastPopup !!!");

    if (responseData) {

         //console.log("responseData ==> ");
         //console.log(responseData);
         //console.log("body ==> ");
         //console.log(responseData.text();
         //console.log("statusText ==> " + responseData.statusText);
        return (
            <div id={`popup-${id}`}>
                <h5>{zone_name}</h5>
                <p>{`${responseData}`}</p>
            </div>
        );
    } else if (responseErrors) {

        //console.log("responseError ==> ");
        //console.log(responseErrors);
        return (
            <div id={`error`}>
                {/* <h5>{`Response Error: ${zone_name}`}</h5> */}
                <h5>{`${zone_name}`}</h5>
                <p>{`${responseErrors}`}</p>
            </div>
        );
    } else {
        return (
            <div id={`error`}>
                <h5>{zone_name}</h5>
                <p>NWS Forecast Data Fetch Error</p>
            </div>
        );
    }
};

export default MarineForecastPopup;