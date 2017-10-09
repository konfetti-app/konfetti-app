/*
 * Takes care about app state.
 * That's all global (app wide) data that is not part of the AppData which get stored to disk by AppPersistenceProvider.
 * Where AppPersistenceProvider is the long term memory, AppStateProvider is like the short term memory during one session.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class AppStateProvider {

  private availableLanguages: Array<LanguageInfo> = new Array();
  private lastSetLocale : string;

  constructor(
      private translateService : TranslateService
    ) {
  }

  /**
   * Add metadata set of a language manual added to ngx-translate.
   * @param {LanguageInfo} lang
   */
  public addLanguage(lang: LanguageInfo) : void {
    this.availableLanguages.push(lang);
  }

  /**
   * Array of all available language data sets.
   * @returns {Array<LanguageInfo>}
   */
  public getAllAvailableLanguages() : Array<LanguageInfo> {
    return this.availableLanguages;
  }

  /**
   * Changes the language displayed in the app.
   * (Dont forget to persist latest locale in an extra step.)
   * @param {string} locale
   */
  public updateActualAppLanguage(locale: string) : void {

    // check if the language is really changing
    locale = locale.toLowerCase();
    if (locale===this.lastSetLocale) return;

    // check if language is available
    let langInfo : LanguageInfo = this.getLangInfoByLocale(locale);
    if (langInfo === null) throw `Given locale(${locale}) is not available in language metadata set.`;

    // set the locale on ngx-translate service
    this.translateService.setDefaultLang(locale);

    // set the left-to-right and right-to-left direction directly on HTML element
    if (typeof document != 'undefined') {
      document.getElementById( 'rootHTML' ).dir = langInfo.direction;
    }

    // remember last set locale
    this.lastSetLocale = locale;
  }

  /**
   * Get the locale of the
   * @returns {string}
   */
  getActualAppLanguageInfo() : LanguageInfo {
    if (this.lastSetLocale === null) return null;
    return this.getLangInfoByLocale(this.lastSetLocale);
  }

  /***************************************
   * Private Methods
   */

  private getLangInfoByLocale(locale : string ) {
    let result : LanguageInfo = null;
    this.availableLanguages.forEach(lang => {
      if (lang.locale === locale) {
        result = lang;
      }
    });
    return result;
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
