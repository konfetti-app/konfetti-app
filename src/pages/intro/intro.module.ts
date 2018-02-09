import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IntroPage } from './intro';

// http://ionicframework.com/docs/developer-resources/ng2-translate/
import { TranslateModule } from '@ngx-translate/core';

import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    IntroPage
  ],
  imports: [
    IonicPageModule.forChild(IntroPage),
    TranslateModule.forChild(),
    PipesModule
  ],
})
export class IntroPageModule {}
