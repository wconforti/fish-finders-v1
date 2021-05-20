import React from "react";
import axios from 'axios';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Tabs from 'react-bootstrap/Tabs';
import Tab from 'react-bootstrap/Tab';

const MarineForecastSlider= ({ feature }) => {

    const { id, zone_name, zone_type } = feature.properties;

    // console.log("id ==> " + id);
    // console.log("zone_name ==> " + zone_name);
    // console.log("zone_type ==> " + zone_type);

    /********************************************/
    // Marine Forecasts
    /********************************************/

    // https://tgftp.nws.noaa.gov/data/watches_warnings/special_marine/gm/gmz550.txt

    //const apiUrl = `https://tgftp.nws.noaa.gov/data/forecasts/marine/${zone_type}/an/${id.toString().toLowerCase()}.txt`;
    const apiUrl = `http://localhost:8181/${zone_type}/an/${id.toString().toLowerCase()}.txt`;
    const [responseData, setResponseData] = React.useState();
    const [responseErrors, setResponseErrors] = React.useState();

    // console.log(apiUrl);
    React.useEffect(() => {
        fetch(apiUrl, {
            mode: 'cors', // no-cors, *cors, same-origin,
        }).then(function(response) {
            // This is a Text Stream response

            // console.log(response.ok);
            // console.log(response.status);
            // console.log(response.statusText);
            // console.log(response);

            var getText = "";
            if (response.ok) {
                response.text().then(function(text) {
                    getText = text;
                    setResponseData(getText);
                })
            } else {
                getText = `Status ${response.status} - ${response.statusText}`;
                setResponseData(getText);
            }

        }).catch(function(error) {
            setResponseErrors(error);
        });
    }, [setResponseData, setResponseErrors, apiUrl]); // Dependencies !!!

    //console.log("Marine Forecasts !!!");
    // console.log("Response Error:");
    // console.log(responseErrors);

    /********************************************/
    // Marine Alerts
    /********************************************/
    const apiUrlAlerts = `https://api.weather.gov/alerts/active/zone/${id.toString().toUpperCase()}`;
    //const apiUrlAlerts = `https://api.weather.gov/alerts/active/zone/GMZ856`;
    const [responseDataAlerts, setResponseDataAlerts] = React.useState();
    const [responseErrorsAlerts, setResponseErrorsAlerts] = React.useState();

    // console.log(apiUrl);
    React.useEffect(() => {
        //async function fetchAlerts() {
            fetch(apiUrlAlerts).then(function(respAlerts) {

                respAlerts.json().then(function(respJson) {
                    setResponseDataAlerts(respJson);
                })

            }).catch(function(errorAlerts) {
                setResponseErrorsAlerts(errorAlerts);
            });
        //}

        //fetchAlerts();
    }, [setResponseDataAlerts, setResponseErrorsAlerts, apiUrlAlerts]); // Dependencies !!!

    var alertsList = [];
    if (responseDataAlerts) { 
 
        // console.log("Marine Alerts !!!");
        // console.log("Response:");
        // console.log(responseDataAlerts);

        var areaDesc_All = null;
        var alertCount = 0;

        // Set-up default warning message
        alertsList.push({ key: `${id}-${alertCount}`, Message: "There are currently no watches or warnings for the selected region." });

        // const preRenderText = alertsList.map((alert) => alert.Message )
        // console.log("preRenderText ==>");
        // console.log(preRenderText)

        // Map and verify this Object is a Feature Collection
        // If so Process the Response
        Object.keys(responseDataAlerts).map((key) => {
            //console.log(key, responseDataAlerts[key]);
       
            var alertText = "";
            if (key === "features"){
            
                //console.log("alert_Feature Count==> " + parseInt(responseDataAlerts[key].length))

                // OK, we have Features to Process
                // Clear the list of the Default content.
                if (parseInt(responseDataAlerts[key].length) > 0) {
                    alertsList = [];
                }

                responseDataAlerts[key].map((alert_Features) => {
                    //console.log("alert_Features ==>");
                    //console.log(alert_Features);

                    var areaDesc = alert_Features.properties.areaDesc.toString() + "\n\n";;
                    var headLine = alert_Features.properties.headline.toString() + "\n\n";
                    var nwsHeadLine = alert_Features.properties.parameters.NWSheadline[0].toString() + "\n\n";
                    var alertDesc = alert_Features.properties.description.toString() + "\n\n";
                    var alertInstructions = alert_Features.properties.instruction.toString() + "\n\n";

                    alertCount++;
                    alertText = areaDesc + nwsHeadLine + alertDesc + alertInstructions;
                    alertsList.push({ key: `${id}-${alertCount}`, Message: alertText });
                }); 
            }
        });

    }

    // // ForeCasts
    // console.log("responseData ==>");
    // console.log(responseData)

    // Evaluate Forecast data to display.
    var renderForecastText = "NWS Forecast Data Fetch Error";
    if (responseData) {
        renderForecastText = responseData;
    } else if (responseErrors) {
        renderForecastText = responseErrors;
    }

    // Concatenate all alerts
    var renderAlertText = alertsList.map((alert) =>  <p>{alert.Message}</p>)
    // console.log("RenderText ==>");
    // console.log(renderText)

    return (
        <Container>
            <Tabs variant="tabs" defaultActiveKey="forecast">
                <Tab eventKey="forecast" title="Marine Forecast">
                    <h6>{zone_name}</h6>
                    {<div>{`${renderForecastText}`}</div> }
                </Tab>
                <Tab eventKey="alert" title="Watches and Warnings">
                    <h6>{zone_name}</h6>
                    <div>{renderAlertText}</div>
                </Tab>
            </Tabs >
        </Container>
    );

};

export default MarineForecastSlider;