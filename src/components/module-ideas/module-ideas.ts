import { 
  Component, 
  Input 
} from '@angular/core';
import { 
  Events
} from 'ionic-angular';

import { TranslateService } from "@ngx-translate/core";

import { AppStateProvider } from "../../providers/app-state/app-state";
import { AppPersistenceProvider } from "../../providers/app-persistence/app-persistence";

import { ApiProvider } from '../../providers/api/api';

@Component({
  selector: 'module-ideas',
  templateUrl: 'module-ideas.html'
})
export class ModuleIdeasComponent {

  @Input() config = null;

  // true if network request is going on
  loading:boolean = false;

  // flag is running on iOS
  isIOS: boolean;

  // the neighborhoodId the newsfeed is working on
  activeGroupId: string;

  // selected tab
  tab:string = 'all';

  constructor(
    private api: ApiProvider,
    private state: AppStateProvider,
    private events: Events,
    private persistence: AppPersistenceProvider,
    private translateService : TranslateService
  ) {

    this.isIOS = this.state.isIOS();

    // get the actual neighborhood
    this.activeGroupId =  this.persistence.getAppDataCache().lastFocusGroupId;

  }

}
