import { Injectable } from "@angular/core";
import { Alert, AlertService } from "@c8y/ngx-components";
import { FetchClient } from "@c8y/ngx-components/api";

@Injectable({
  providedIn: "root",
})
export class SimulatorsBackendService {
  constructor(private alert: AlertService, private client: FetchClient) {}

  connectToSimulatorsBackend() {

    const url = '/service/device-simulator/simulators';
    const fetchOptions = {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      }
  };
  return this.client.fetch(url, fetchOptions).then(result => {
    if (result.status >= 200 && result.status < 300) {
        const alert = { text: 'Measurements successfully uploaded.', type: 'success' } as Alert;
        this.alert.add(alert);
    } else {
        return Promise.reject(result);
    }
}, error => {
    this.alert.add({
        text: 'An error occoured , Please try after some time.',
        type: 'danger',
    } as Alert);
});
  }
}
