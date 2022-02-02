import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial';
import { interval } from 'rxjs';
import { distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { ViewHistoryComponent } from '../view-history/view-history.page';

@Component({
    selector: 'app-view-message',
    templateUrl: './view-message.page.html',
    styleUrls: ['./view-message.page.scss'],
})
export class ViewMessagePage implements OnInit {

    public rawMessage: any;
    public readonly arduinoId = '98:D3:A1:FD:3A:55';
    private sub;

    constructor(
        private modalController: ModalController,
    ) {

    }

    async ngOnInit() {
        this.sub = this.serial.connectInsecure(this.arduinoId).subscribe();
        this.read();
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    get serial() {
        return BluetoothSerial;
    }

    close() {
        this.modalController.dismiss();
    }

    async goToHistory() {
        const modal = await this.modalController.create({
            component: ViewHistoryComponent,
        });
        await modal.present();
    }

    async read() {
        interval(15).pipe(
            switchMap(() => fromPromise(this.serial.readUntil('###'))),
            distinctUntilChanged(),
        ).subscribe((e) => {

            this.setMessage(e);
        });
    }

    setMessage(mes) {
        mes = mes || '';
        if (mes === '') {
            return;
        }

        this.rawMessage = '';
        const parts = mes.split('&');
        parts.forEach(item => {
            const splitted = item.split('=');
            if (splitted.length > 1) {
                this.rawMessage += `<strong>${splitted[0]}</strong>: ${splitted[1]} \n`;
            }
        });

        ViewHistoryComponent.stack.push(this.rawMessage);
        if (ViewHistoryComponent.stack.length > 5) {
            ViewHistoryComponent.stack.shift();
        }
    }
}
