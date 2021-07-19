import { GeoCoordinate } from "./geoCoordinate.model";

/*export interface Events {

    events: {
    }[] &
    {
        code: string;
        lat: string;
        lon: string;
        alt: string;
        accuracy: string;
        steps: string;
    }[] = [];


}*/


export interface Event {
    eventCategory: string;
    eventType?: string;
    eventText?: string;
    steps?: string;
    latitude?: string;
    longitude?: string;
    altitude?: string;
    accuracy?: string;
    geoCoordinate?: GeoCoordinate;
}

export interface EditedEvent {
    eventText?: string;
    eventType?: string;
    eventLatitude?: string;
    eventLongitude?: string;
    eventAltitude?: string;
    eventAccuracy?: string;
  }