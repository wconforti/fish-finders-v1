import useSwr from 'swr';

export const useRequestNwsStations = async (gridId, gridX, gridY) => {

    const fetcher =  (...args) => fetch(...args).then(response => response.json());

    const url = `https://api.weather.gov/gridpoints/${gridId}/${gridX},${gridY}/stations`;
    const { data, error } = useSwr(url, { fetcher });
    //const stations = data && !error ? data.slice(0, 2000) : [];

    console.log("useRequestNwsStations (Results)");
    console.log("gridId: ==> " + gridId,);
    console.log("gridX: ==> " + gridX,);
    console.log("gridY: ==> " + gridY,);

   return { data, error }
}