import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MainPage } from './main';

import { ComponentsModule } from "../../components/components.module";

// http://ionicframework.com/docs/developer-resources/ng2-translate/
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    MainPage
  ],
  imports: [
    IonicPageModule.forChild(MainPage),
    TranslateModule.forRoot(),
    ComponentsModule
  ]
})
export class MainPageModule {}
