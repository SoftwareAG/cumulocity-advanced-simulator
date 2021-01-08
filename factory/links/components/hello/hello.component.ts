import { Component } from '@angular/core';
import { Alert, AlertService } from '@c8y/ngx-components';

@Component({
    selector: 'app-hello',
    templateUrl: `./hello.component.html`
})



export class HelloComponent {
    name = 'everybody'
    info = 'need help?'
    link1 = 'https://github.com/SoftwareAG/cumulocity-device-chart-widget'
    link2 = 'https://github.com/SoftwareAG/cumulocity-smart-map-widget'
    link3 = 'https://github.com/SoftwareAG/cumulocity-event-chart-widget'
    link4 = 'https://github.com/SoftwareAG/cumulocity-processing-widget'
    link5 = 'https://github.com/SoftwareAG/cumulocity-smart-map-settings-widget'
    link6 = 'https://github.com/SoftwareAG/cumulocity-node-red/'
    
    constructor(
        private alert: AlertService
    ){}


btnClicked(name){
    this.alert.add({
        text: 'Hello ' + name + '!',
        type: 'info',
        detailedData:
            'A service is defined for most components of ngx-components. <br>' +
            'Thus example shows how to use the concept with an alert'
    } as Alert);
}
}
