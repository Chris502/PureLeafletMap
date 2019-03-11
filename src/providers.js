import { BingProvider } from 'leaflet-geosearch';
import { EsriProvider } from 'leaflet-geosearch';
import { GoogleProvider } from 'leaflet-geosearch';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import { LocationIQProvider } from 'leaflet-geosearch';
import { OpenCageProvider } from 'leaflet-geosearch';



const providerSwitch = (key, apiKey) => {
    if (key === 'google') {
        if (!apiKey) return console.error(`No API Key for provider: ${key}. Add API key to render Search Control`)
        return new GoogleProvider({
            params: {
              key: apiKey
            }
          })
    }
    if (key === 'esri') {
        return new EsriProvider()
    }
    if (key === 'bing') {
        if (!apiKey) return console.error(`No API Key for provider: ${key}. Add API key to render Search Control`)
        return new BingProvider({ 
            params: {
              key: apiKey,
            },
          });
    }
    if (key === 'openstreet') {
        return new OpenStreetMapProvider()
    }
    if (key === 'locIQ') {
        if (!apiKey) return console.error(`No API Key for provider: ${key}. Add API key to render Search Control`)
        return new LocationIQProvider({
            params: {
                key: apiKey
            }
        })
    }
    if (key === 'opencage') {
        if (!apiKey) return console.error(`No API Key for provider: ${key}. Add API key to render Search Control`)
        return new OpenCageProvider({
            params: {
                key: props.apiKey
            }
        })
    }

}
export default providerSwitch