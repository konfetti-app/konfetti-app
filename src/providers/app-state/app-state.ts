/*
 * Takes care about app state.
 * That's all global (app wide) data that is not part of the AppData which get stored to disk by AppPersistenceProvider.
 * Where AppPersistenceProvider is the long term memory, AppStateProvider is like the short term memory during one session.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';

@Injectable()
export class AppStateProvider {

  private availableLanguages: Array<LanguageInfo> = new Array();
  private lastSetLocale : string;

  constructor(
      private translateService : TranslateService,
      private platform: Platform
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
   * Takes an array of locale strings and returns a array of matching LanguageInfos.
   * @param {Array<string>} locales
   * @returns {Array<LanguageInfo>}
   */
  public fromLocaleArrayToLanguageInfos(locales:Array<string>) : Array<LanguageInfo> {
    let result : Array<LanguageInfo> = new Array<LanguageInfo>();
    locales.forEach( (locale) => {
      this.availableLanguages.forEach((info) => {
        if (info.locale===locale) result.push(info);
      })
    });
    return result;
  }

  /**
   * Changes the language displayed in the app.
   * (Dont forget to persist latest locale in an extra step.)
   * @param {string} locale
   */
  public updateActualAppLanguage(locale: string) : void {

    // check if the language is defined
    if ((typeof locale === "undefined") || (locale===null)) {

      // get locale from browser
      locale = this.translateService.getBrowserLang();

      // if browser locale is not supported - fallback to english
      if (this.getLangInfoByLocale(locale)===null) locale = "en";
    }

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
      // alternative way maybe platform.setDir('rtl', true) -> http://ionicframework.com/docs/theming/rtl-support/
      document.getElementById( 'rootHTML' ).dir = langInfo.direction;
    }

    // remember last set locale
    this.lastSetLocale = locale;
  }

  /**
   * Get the actual set Language info of app.
   * @returns {LanguageInfo}
   */
  getActualAppLanguageInfo() : LanguageInfo {
    if (this.lastSetLocale === null) return null;
    return this.getLangInfoByLocale(this.lastSetLocale);
  }

  /**
   * The height in pixel of app display.
   * @returns {number}
   */
  getDisplayHeight() : number {
    return this.platform.height();
  }

  /**
   * The width in pixel of app display,
   * @returns {number}
   */
  getDisplayWidth() : number {
    return this.platform.width();
  }

  /**
   * Detects if the app is running on a real or full simulated Android or iOS device.
   * This means that cordova plugins are available.
   * @returns {boolean}
   */
  isRunningOnRealDevice() : boolean {
    return this.platform.is('cordova');
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
