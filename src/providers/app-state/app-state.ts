/*
 * Takes care about app state.
 * That's all global (app wide) data that is not part of the AppData which get stored to disk by AppPersistenceProvider.
 * Where AppPersistenceProvider is the long term memory, AppStateProvider is like the short term memory during one session.
 */

import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Platform } from 'ionic-angular';
import {Group, User} from './../../providers/api/api';
import {Observable} from "rxjs/Observable";

function getWindow (): any {
  return window;
}

@Injectable()
export class AppStateProvider {

  get nativeWindow (): any {
    return getWindow();
  }

  // i18n info
  private availableLanguages: Array<LanguageInfo> = new Array();
  private lastSetLocale : string;

  // user info
  private userInfo : User = null;
  private observerNewUserInfo : any = null;

  constructor(
      private translateService : TranslateService,
      private platform: Platform
    ) {
  }

  /**
   * Get neighborhood data by id
   * @param {string} id
   * @returns {Group}
   */
  public getNeighbourhoodById(id : string) : Group {
    if (this.userInfo==null) return null;
    if (this.userInfo.neighbourhoods==null) return null;
    let result = null;
    this.userInfo.neighbourhoods.forEach(hood => {
      if (hood._id==id) result = hood;
    });
    return result;
  }

  /**
   * Setter for User Info and let listeners know about update.
   * @param {User} user
   */
  setUserInfo(user: User) : void {
    this.userInfo = user;
    if (this.observerNewUserInfo!=null) this.observerNewUserInfo.next(user);
  }

  /**
   * Getter for User Info
   * @returns {User}
   */
  getUserInfo() : User {
    return  this.userInfo;
  }

  /**
   * Listen on updates on the user info object
   * @returns {Observable<User>}
   */
  listenOnNewUserInfo() : Observable<User> {
    return Observable.create((observer ) => {
      this.observerNewUserInfo = observer;
    });
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
      });
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

  getAppBuildTime() : string {
    return this.nativeWindow.appBuildTime;
  }

  /**
   * Find the zoom level that best for given radius.
   * @param {number} radiusInMeters
   * @returns {number} best fitting leaflet zoom level
   */
  convertRadiusToZoomLevel(radiusInMeters: number) : number {

    // according to leaflet docs with every zoom counted up
    // the with get divided by half ... see:
    // http://leafletjs.com/examples/zoom-levels/

    // the with in meters of zoom level 0 = erdumfang
    let zoomLevel = 0;
    let zoomWidth = 12742000;

    // find the zoom level/width that is just a bit smaller than given radius
    while ((radiusInMeters<zoomWidth) && (zoomLevel<20)) {
      zoomLevel++;
      zoomWidth = Math.round(zoomWidth / 2.0);
    }

    return (zoomLevel+1);
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
