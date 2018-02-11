import { NgModule } from '@angular/core';
import { ModuleNewsfeedComponent } from './module-newsfeed/module-newsfeed';
import { ModuleGroupchatsComponent } from './module-groupchats/module-groupchats';
import { IonicPageModule } from 'ionic-angular';

import { PipesModule } from '../pipes/pipes.module';

// http://ionicframework.com/docs/developer-resources/ng2-translate/
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
	declarations: [
		ModuleNewsfeedComponent,
		ModuleGroupchatsComponent
	],
	imports: [
		IonicPageModule.forChild(ModuleGroupchatsComponent),
		IonicPageModule.forChild(ModuleNewsfeedComponent),
		TranslateModule.forChild(),
		PipesModule
	],
	exports: [
		ModuleNewsfeedComponent,
		ModuleGroupchatsComponent
	]
})
export class ComponentsModule {}
