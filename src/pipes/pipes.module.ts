import { NgModule } from '@angular/core';
import { LengthBreakPipe } from './length-break/length-break';
import { SincePipe } from './since/since';
@NgModule({
	declarations: [LengthBreakPipe,
    SincePipe],
	imports: [],
	exports: [LengthBreakPipe,
    SincePipe]
})
export class PipesModule {}
