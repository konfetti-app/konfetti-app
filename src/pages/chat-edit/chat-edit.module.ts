import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ChatEditPage } from './chat-edit';

@NgModule({
  declarations: [
    ChatEditPage,
  ],
  imports: [
    IonicPageModule.forChild(ChatEditPage),
  ],
})
export class ChatEditPageModule {}
