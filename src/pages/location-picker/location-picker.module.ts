import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { LocationPickerPage } from './location-picker';

// http://ionicframework.com/docs/developer-resources/ng2-translate/
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    LocationPickerPage,
  ],
  imports: [
    IonicPageModule.forChild(LocationPickerPage),
    TranslateModule.forChild(),
  ],
})
export class LocationPickerPageModule {}
