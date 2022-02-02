import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ModalController, Platform, ToastController } from '@ionic/angular';
import { BleClient, numberToUUID, ScanResult, } from '@capacitor-community/bluetooth-le';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial';
import { interval, Subscription } from 'rxjs';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { uniqBy, uniqWith } from 'lodash-es';
import { ViewMessagePage } from '../view-message/view-message.page';


// eslint-disable-next-line @typescript-eslint/naming-convention
interface _ScanResult extends ScanResult {
    id: number;
}

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, OnDestroy {
    static id = 0;
    devices: any[] = [];
    scanRunning = false;
    scanTimeout: any;
    connecting = false;
    pairedDevices: any[] = [];
    responses = '';
    isPairedExpanded = false;
    public readonly ionsPhone = '48:B8:A3:1F:DD:D8';
    public readonly arduinoId = '98:D3:A1:FD:3A:55';
    subscriptions = [];
    disconnected = [];
    connectionSubscription: Subscription;
    connectedId: string;

    constructor(
        private ngZone: NgZone,
        private platform: Platform,
        private toastController: ToastController,
        private modalController: ModalController,
    ) {
        this.platform.ready().then(async () => {
            if (!(await this.serial?.isEnabled())) {
                if (this.platform.is('android')) {
                    await this.serial.enable();
                } else if (this.platform.is('capacitor')) {
                    await this.serial.showBluetoothSettings();
                }
            }
        });
    }

    get serial() {
        return BluetoothSerial;
    }

    ngOnInit() {
        this.sub = this.serial.setDeviceDiscoveredListener().subscribe((ee) => {
            this.ngZone.run(() => {
                this.devices = uniqWith([...this.devices, ee], this.sameAddress.bind(this));
            });
        });
    }

    ngOnDestroy() {
        this.subscriptions.forEach(e => e.unsubscribe());
        this.subscriptions = [];
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    set sub(e) {
        this.subscriptions.push(e);
    }

    async scan(event?, infere = false) {
        if (!this.scanRunning && infere) {
            return;
        }

        this.scanRunning = true;

        const data = await this.serial.discoverUnpaired();
        console.log(data);
        this.ngZone.run(() => {
            this.devices = uniqWith([...this.devices, ...(data || [])], this.sameAddress.bind(this));
        });

        this.scanTimeout = setTimeout(() => {
            if (this.scanRunning) {
                this.scan(event, true);
            }
        }, 25 * 1000);
    }

    sameAddress(a, b) {
        return a.address === b.address;
    }

    async list() {
        const x = await this.serial.list();
        const disconnected = x.filter(item => this.disconnected.includes(item.adddress));
        this.pairedDevices = x.filter(item => !this.disconnected.includes(item.address));
        this.devices = uniqWith([...this.devices, ...(disconnected || [])], this.sameAddress.bind(this));
        return x;
    }

    async refresh(event?) {
        this.devices = [];
        await this.stopScan(event);
        await this.scan(event);
    }

    async stopScan(event?) {
        window.clearTimeout(this.scanTimeout);
        this.scanRunning = false;
    }

    async showToast(message: string, color: 'primary'|'danger'|'success' = 'primary', duration = 3000) {
        const toast = await this.toastController.create({
            message,
            duration,
            color,
        });

        await toast.present();
    }

    async showData(event) {
        event.preventDefault();
        event.stopPropagation();
        const modal = await this.modalController.create({
            component: ViewMessagePage,
        });

        await modal.present();
    }

    async showUnpair(id, name) {
        const toast = await this.toastController.create({
            message: `You want to disconnect ${name || 'Unnamed'}`,
            buttons: [
                {
                    text: 'Disconnect',
                    handler: async () => {
                        this.disconnected.push(id);
                        this.list();
                    }
                }
            ],
        });

        await toast.present();
    }

    async connectInsecure(id) {
        if (this.disconnected.includes(id)) {
            this.disconnected = this.disconnected.filter((item) => item !== id);
            this.showToast('connected', 'success');
            return;
        }

        this.cleanSubscription();
        this.connectionSubscription = this.serial.connectInsecure(id).subscribe(() => {
            this.connectedId = id;
            this.showToast('Connected', 'success');
        }, () => {
            this.showToast('Not connected', 'danger');
        });
    }

    cleanSubscription(id?) {
        if (this.connectionSubscription) {
            this.connectionSubscription.unsubscribe();
            this.connectionSubscription = undefined;
            this.connectedId = null;
        }
    }

    async togglePaired() {
        if (this.isPairedExpanded) {
            this.isPairedExpanded = false;
            return;
        }

        await this.list();
        this.isPairedExpanded = true;
    }

    async read() {
        interval(15).pipe(
            switchMap(() => fromPromise(this.serial.read())),
            distinctUntilChanged(),
        ).subscribe((e) => {
            console.log(e);
            this.responses = e.toString();
        });
    }
}
