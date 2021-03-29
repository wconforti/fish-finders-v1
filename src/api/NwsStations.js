import React, {Component, useEffect, useState } from 'react';
import axios from 'axios';

const _gridId = "BOX"
const _gridX = 59
const _gridY = 28

// Hopefully, this function will return a geo
export function NwsStations (gridId, gridX, gridY) {

    const [ NwsStationsState, setNwsStationsState ] = useState({
        loading: false,
        repos: null,
      });

    const apiUrl = `https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/stations`;

    useEffect(() => {
        setNwsStationsState.loading = true;
            axios.get(apiUrl).then((repos) => {
              const allRepos = repos.data;
              setNwsStationsState({ loading: false, repos: allRepos }
            );
        });
    }, [setNwsStationsState, apiUrl]);

    //console.log("NwsStations ==> Axios");
    //console.log( NwsStationsState.repos );
    return NwsStationsState.repos;
        
};
export default NwsStations;