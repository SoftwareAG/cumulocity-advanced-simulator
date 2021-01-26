import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Alert, AlertService } from "@c8y/ngx-components";
import { FetchClient } from "@c8y/ngx-components/api";

@Injectable({
  providedIn: "root",
})
export class SimulatorsBackendService {
  constructor(private alert: AlertService, private http: HttpClient) {}

  connectToSimulatorsBackend(resultTemplate) {
    const url = "/service/device-simulator/simulators";
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
      }),
    };
    this.http
      .post(url, resultTemplate, httpOptions)
      .subscribe((data) => console.log(data));
  }
}
