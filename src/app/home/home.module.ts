import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

import { HomePage } from './home.page';
import { HomePageRoutingModule } from './home-routing.module';
import { ViewMessagePage } from '../view-message/view-message.page';
import { ViewHistoryComponent } from '../view-history/view-history.page';
import { nl2brPipe } from '../../nl2br';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        HomePageRoutingModule,
    ],
    declarations: [HomePage, ViewMessagePage, ViewHistoryComponent, nl2brPipe],
    providers: [],
})
export class HomePageModule {
}
