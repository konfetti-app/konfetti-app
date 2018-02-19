import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IdeaPage } from './idea';

import { ComponentsModule } from "../../components/components.module";

// http://ionicframework.com/docs/developer-resources/ng2-translate/
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    IdeaPage,
  ],
  imports: [
    IonicPageModule.forChild(IdeaPage),
    TranslateModule.forChild(),
    ComponentsModule
  ],
})
export class IdeaPageModule {}
