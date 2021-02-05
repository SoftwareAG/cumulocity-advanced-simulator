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
    code: string;
    eventType: string;
    eventText: string;
    steps: string;
    latitude?: string;
    longitude?: string;
    altitude?: string;
    accuracy?: string;
    geoCordinate?: GeoCoordinate;
}