import { Component, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BleClient, ScanResult } from '@capacitor-community/bluetooth-le';


@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage {
    devices: ScanResult[] = [];
    scanRunning = false;
    ble = BleClient;

    constructor(
        private ngZone: NgZone,
        private platform: Platform,
    ) {
        this.platform.ready().then(async () => {
            await BleClient.initialize();
        });
    }

    scan(event?) {
        this.devices = [];
        this.scanRunning = true;
        this.ble.requestLEScan({
            services: [],
        }, this.onDeviceDiscovered.bind(this));

        setTimeout(() => {
            if (this.scanRunning) {
                this.stopScan(event);
            }
        }, 7500);
    }

    async refresh(event) {
        await this.stopScan(event);
        await this.scan(event);
    }

    async stopScan(event?) {
        // await this.ble.stopScan();
        this.scanRunning = false;
        event?.target.complete();
    }

    onDeviceDiscovered(result: ScanResult) {
        const { device } = result;
        console.log(result);
        console.log('Discovered' + JSON.stringify(device, null, 2));
        // console.log(this.bytesToString(device.advertising));
        this.devices.push(result);
        console.log(device);
    }

    bytesToString(buffer) {
        return String.fromCharCode.apply(null, new Uint8Array(buffer));
    }
}
