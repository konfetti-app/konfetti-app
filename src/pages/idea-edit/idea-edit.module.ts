import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IdeaEditPage } from './idea-edit';

@NgModule({
  declarations: [
    IdeaEditPage,
  ],
  imports: [
    IonicPageModule.forChild(IdeaEditPage),
  ],
})
export class IdeaEditPageModule {}
