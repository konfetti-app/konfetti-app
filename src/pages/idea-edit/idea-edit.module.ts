import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IdeaEditPage } from './idea-edit';

// http://ionicframework.com/docs/developer-resources/ng2-translate/
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    IdeaEditPage,
  ],
  imports: [
    IonicPageModule.forChild(IdeaEditPage),
    TranslateModule.forRoot()
  ],
})
export class IdeaEditPageModule {}
