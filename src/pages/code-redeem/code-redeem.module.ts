import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CodeRedeemPage } from './code-redeem';

// http://ionicframework.com/docs/developer-resources/ng2-translate/
import { TranslateModule } from '@ngx-translate/core';

import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
  declarations: [
    CodeRedeemPage
  ],
  imports: [
    IonicPageModule.forChild(CodeRedeemPage),
    TranslateModule.forChild(),
    PipesModule
  ],
})
export class CodeRedeemPageModule {}
