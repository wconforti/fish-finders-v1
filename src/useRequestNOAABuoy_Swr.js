// NOAA
// Data comes back in .rss format (XML)

import useSwr from 'swr'
import axios from 'axios';

const fetcher = (...args) => axios(...args).then(response => response.data);

export const useRequestNOAABuoy_Swr = (mboxLat, mboxLng) => {

    const url = `https://www.ndbc.noaa.gov/rss/ndbc_obs_search.php?lat=${mboxLat}N&lon=${(mboxLng * -1)}W&radius=100`;
    //console.log("getNdbcStationsData URL ==> " + urlNdbcStations);
    const { data, error } = useSwr(url, { fetcher });
    //const stations = data && !error ? data.slice(0, 2000) : [];

    //const url = name ? baseUrl + path + '/' + name : baseUrl + path
    //const { data, error } = useSwr(url)

    console.log("useRequestNOAABuoy_Swr");

    return { data, error }
}