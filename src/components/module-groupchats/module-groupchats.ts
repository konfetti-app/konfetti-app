import { Component, Input } from '@angular/core';

@Component({
  selector: 'module-groupchats',
  templateUrl: 'module-groupchats.html'
})
export class ModuleGroupchatsComponent {

  @Input() config:any = null;

  text:string = "No Config";

  constructor() {

    if (this.config!=null) this.text = this.config.test;

  }

}
