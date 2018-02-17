import { NgModule } from '@angular/core';
import { ModuleNewsfeedComponent } from './module-newsfeed/module-newsfeed';
import { ModuleGroupchatsComponent } from './module-groupchats/module-groupchats';
import { ModuleIdeasComponent } from './module-ideas/module-ideas';
import { IonicPageModule } from 'ionic-angular';

import { PipesModule } from '../pipes/pipes.module';

// http://ionicframework.com/docs/developer-resources/ng2-translate/
import { TranslateModule } from '@ngx-translate/core';
import { KonfettiButtonComponent } from './konfetti-button/konfetti-button';

@NgModule({
	declarations: [
		ModuleNewsfeedComponent,
		ModuleGroupchatsComponent,
    	ModuleIdeasComponent,
        KonfettiButtonComponent
	],
	imports: [
		IonicPageModule.forChild(ModuleGroupchatsComponent),
		IonicPageModule.forChild(ModuleNewsfeedComponent),
		IonicPageModule.forChild(ModuleIdeasComponent),
		TranslateModule.forChild(),
		PipesModule
	],
	exports: [
		ModuleNewsfeedComponent,
		ModuleGroupchatsComponent,
   	 	ModuleIdeasComponent,
        KonfettiButtonComponent
	]
})
export class ComponentsModule {}
