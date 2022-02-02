import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-view-history',
    templateUrl: './view-message.page.html',
    styleUrls: ['./view-message.page.scss'],
})
export class ViewHistoryComponent implements OnInit {
    static stack = [];

    constructor(
        private modalController: ModalController,
    ) {
    }

    async ngOnInit() {
    }

    get messages() {
        return ViewHistoryComponent.stack;
    }

    close() {
        this.modalController.dismiss();
    }

}
