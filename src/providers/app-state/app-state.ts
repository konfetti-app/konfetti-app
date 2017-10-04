/*
 * Takes care about app state and persistence.
 *
 * The idea is on read you get the complete AppData object.
 * To change state just single methods can change single fields.
 * That way we wil make sure that no module try to store inconsistent versions of app state.
 *
 * Uses for persistence: http://ionicframework.com/docs/native/native-storage/
 */

import {TranslateService} from "@ngx-translate/core";
import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { Observable } from "rxjs/Observable";

const STORAGE_KEY_V1 : string = 'AppData';

/*
 * App Data DEFAULT values
 */
export class AppData {

  // the language locale the user has set the app to
  i18nLocale : string = 'en';

  // TODO more AppData fields and test/document how it reacts if persistent data extends

}

@Injectable()
export class AppStateProvider {

  // once app data is loaded from persistence - keep in chache
  private appDataCache : AppData = null;

  // if no cordova is available use LocalStorage instead of NativeStorage
  private useLocalStorage : boolean = false;

  constructor(
    private nativeStorage: NativeStorage,
    private translateService : TranslateService
  ) {}

  /**
   * Gets the AppData fresh from persistence if needed.
   * @returns {Observable<AppData>}
   */
  getAppDataAsync() : Observable<AppData> {
    return new Observable<AppData>( (observer) => {

      // use cache if available
      if (this.appDataCache!=null) {
        observer.next(this.appDataCache);
        observer.complete();
        return;
      }

      // when no cache then read fresh from storage
      this.nativeStorage.getItem(STORAGE_KEY_V1).then(
        data => {
          this.appDataCache = data;
          if (this.appDataCache==null) this.appDataCache = new AppData();
          observer.next(this.appDataCache);
          observer.complete();
         },
        error => {

          if (error == "cordova_not_available") {

            // fallback to HTML5 LocalStorage if Cordova is not available
            this.useLocalStorage = true;
            this.appDataCache = this.getAppDataFromLocalStorage();
            if (this.appDataCache ==null) this.appDataCache = new AppData();
            observer.next(this.appDataCache);
            observer.complete();
            return;

          } else {

            // init with default
            this.appDataCache = new AppData();

            try {

              // in case AppData can not be found ... do init
              if (error.code == 2) {
                console.log('Initializing Native Storage');
                this.persistAppData();
                observer.next(this.appDataCache);
                observer.complete();
                return;
              }

            } catch (e) { console.error(e); }

            // throw error in any other case

            console.error("**** ERROR ON NATIVE STORAGE ****");
            console.dir(error);
            console.log(JSON.stringify(error));

            observer.error(error);

          }
        }
      );

    });
  }

  /**
   * Gets the AppData quick from cache once loaded.
   * @returns {AppData}
   */
  getAppDataCache() : AppData {
    if (this.appDataCache==null) throw new Error('use getAppDataAsync first');
    return this.appDataCache;
  }

  setLocale(locale : string) : void {
    this.appDataCache.i18nLocale = locale;
    this.translateService.setDefaultLang(locale);
    this.persistAppData();
  }

  /*
   * PRIVATE METHODS
   */

  // fallback when Cordova Native Storage is not available
  private getAppDataFromLocalStorage() : AppData {
    let jsonStr : string = localStorage.getItem(STORAGE_KEY_V1);
    if (jsonStr===null) return null;
    return JSON.parse(jsonStr);
  }

  // just use private in methods that change single values
  private persistAppData() : void {

    if (this.appDataCache==null) throw new Error('use getAppDataAsync first');

    if (!this.useLocalStorage) {

      // Cordova Native Storage (fire and forget)
      this.nativeStorage.setItem(STORAGE_KEY_V1, this.appDataCache);

    } else {

      // HTML5 Local Storage (WebBrowser)
      localStorage.setItem(STORAGE_KEY_V1, JSON.stringify(this.appDataCache));

    }

  }

}
