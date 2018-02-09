import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatEditPage } from './chat-edit';

// http://ionicframework.com/docs/developer-resources/ng2-translate/
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
    ChatEditPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatEditPage),
    TranslateModule.forChild(),
  ],
})
export class ChatEditPageModule {}
