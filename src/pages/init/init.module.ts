import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { InitPage } from './init';

// http://ionicframework.com/docs/developer-resources/ng2-translate/
import { TranslateModule } from '@ngx-translate/core';

import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    InitPage,
  ],
  imports: [
    IonicPageModule.forChild(InitPage),
    TranslateModule.forChild(),
    PipesModule
  ],
})
export class InitPageModule {}
