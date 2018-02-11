import { NgModule } from '@angular/core';
import { ModuleNewsfeedComponent } from './module-newsfeed/module-newsfeed';
import { ModuleGroupchatsComponent } from './module-groupchats/module-groupchats';
import { IonicPageModule } from 'ionic-angular';

import { PipesModule } from '../pipes/pipes.module';

@NgModule({
	declarations: [
		ModuleNewsfeedComponent,
		ModuleGroupchatsComponent
	],
	imports: [
		IonicPageModule.forChild(ModuleGroupchatsComponent),
		IonicPageModule.forChild(ModuleNewsfeedComponent),
		PipesModule
	],
	exports: [
		ModuleNewsfeedComponent,
		ModuleGroupchatsComponent
	]
})
export class ComponentsModule {}
