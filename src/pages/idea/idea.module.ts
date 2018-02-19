import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { IdeaPage } from './idea';

import { ComponentsModule } from "../../components/components.module";

@NgModule({
  declarations: [
    IdeaPage,
  ],
  imports: [
    IonicPageModule.forChild(IdeaPage),
    ComponentsModule
  ],
})
export class IdeaPageModule {}
