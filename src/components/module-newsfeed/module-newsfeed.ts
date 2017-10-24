import { Component, Input } from '@angular/core';

@Component({
  selector: 'module-newsfeed',
  templateUrl: 'module-newsfeed.html'
})
export class ModuleNewsfeedComponent {

  @Input() config = null;

  text: string = "No Config";

  constructor() {

    if (this.config!=null) this.text = this.config.test;

  }

}
