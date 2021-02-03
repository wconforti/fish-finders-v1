// NOAA
// Data comes back in .rss format (XML)

import useSwr from 'swr'

const fetcher = (...args) => fetch(...args).then(response => response.json());

export const useRequestNOAABuoy_Swr = (gridId, gridX, gridY) => {

    const url = `https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/stations`;
    const { data, error } = useSwr(url, { fetcher });
    //const stations = data && !error ? data.slice(0, 2000) : [];

    //const url = name ? baseUrl + path + '/' + name : baseUrl + path
    //const { data, error } = useSwr(url)

    console.log("useRequestNOAABuoy_Swr");

    return { data, error }
}