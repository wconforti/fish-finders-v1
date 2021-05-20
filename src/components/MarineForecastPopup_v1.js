import React from "react";
import useSwr, { SWRConfig } from "swr";

const fetcher = (...args) => fetch(...args).then(response => response.json());

const MarineForecastPopup_v1 = ({ feature }) => {
    const { id, zone_name, zone_type } = feature.properties;

    const url = `https://tgftp.nws.noaa.gov/data/forecasts/marine/${zone_type}/an/${id.toString().toLowerCase()}.txt`;
    const { data, error } = useSwr(url, { fetcher });

    console.log(url);
    console.log(data);
    console.log(error);

    if (data != null) {
        return (
            <div id={`popup-${id}`}>
                <h5>{zone_name}</h5>
                <p>{data.body}</p>
            </div>
        );
    }
    else if (error) {
        return (
            <div id={`error`}>
                <h5>{zone_name}</h5>
                <p>{error}</p>
            </div>
        );
    } else {
        return (
            <div id={`error`}>
                <p>NWS Data Fetch Error</p>
            </div>
        );
    }
};

export default MarineForecastPopup_v1;