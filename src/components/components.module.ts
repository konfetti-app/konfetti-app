import { NgModule } from '@angular/core';
import { ModuleNewsfeedComponent } from './module-newsfeed/module-newsfeed';
import { ModuleGroupchatsComponent } from './module-groupchats/module-groupchats';
import { IonicPageModule } from 'ionic-angular';
@NgModule({
	declarations: [ModuleNewsfeedComponent,
    ModuleGroupchatsComponent],
	imports: [
		IonicPageModule.forChild(ModuleGroupchatsComponent),
		IonicPageModule.forChild(ModuleNewsfeedComponent),
	],
	exports: [ModuleNewsfeedComponent,
    ModuleGroupchatsComponent]
})
export class ComponentsModule {}
