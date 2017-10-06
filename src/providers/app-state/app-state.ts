/*
 * Takes care about app state.
 * That's all global (app wide) data that is not part of the AppData which get stored to disk by AppPersistenceProvider.
 * Where AppPersistenceProvider is the long term memory, AppStateProvider is like the short term memory during one session.
 */

import { Injectable } from '@angular/core';

@Injectable()
export class AppStateProvider {

  private availableLanguages: Array<LanguageInfo> = new Array();

  constructor() {
  }

  public addLanguage(lang: LanguageInfo) : void {
    this.availableLanguages.push(lang);
  }

  public getAllAvailableLanguages() : Array<LanguageInfo> {
    return this.availableLanguages;
  }

}

/*
 *  Data Objects
 */

export class LanguageInfo {
  locale: string;
  displayname: string;
  direction: string;
}
