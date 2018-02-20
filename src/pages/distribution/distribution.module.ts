import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DistributionPage } from './distribution';

// http://ionicframework.com/docs/developer-resources/ng2-translate/
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    DistributionPage,
  ],
  imports: [
    IonicPageModule.forChild(DistributionPage),
    TranslateModule.forChild(),
  ],
})
export class DistributionPageModule {}
