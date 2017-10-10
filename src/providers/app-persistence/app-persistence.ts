/*
 * Takes care about app persistence.
 *
 * The idea is: On read you get the complete AppData object.
 * To change values use the public methods on this provider.
 * That way we wil make sure that no module try to store inconsistent versions of app state.
 *
 * Uses for persistence: http://ionicframework.com/docs/native/native-storage/
 */

import { Injectable } from '@angular/core';
import { NativeStorage } from '@ionic-native/native-storage';
import { Observable } from "rxjs/Observable";

const STORAGE_KEY_V1 : string = 'AppData';

/*
 * App Data DEFAULT values (APP PERSISTENCE OBJECT)
 *
 * About adding and removing data fields:
 * - new data fields can be added and will be initialized in app start with default value
 * - keep in mind: if you extend second level data objects in AppData you may deal with typeof 'undefined'
 * - if you remove a data field it will also just disappear in the persistence object
 */
export class AppData {

  // the language locale the user has set the app to
  i18nLocale : string = null;

  // user credentials
  username : string = null;
  password : string = null;

  // store the session with the server
  jsonWebtoken : JsonWebToken = null;

}

@Injectable()
export class AppPersistenceProvider {

  // once app data is loaded from persistence - keep in chache
  private appDataCache : AppData = null;

  // if no cordova is available use LocalStorage instead of NativeStorage
  private useLocalStorage : boolean = false;

  constructor(
    private nativeStorage: NativeStorage
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

      let processAfterLoad  = (data : AppData) => {
        this.appDataCache = this.initDefaultValues(data);
        if (this.appDataCache == null) this.appDataCache = new AppData();
        this.persistAppData();
        observer.next(this.appDataCache);
        observer.complete();
      };

      // when no cache then read fresh from storage
      this.nativeStorage.getItem(STORAGE_KEY_V1).then(
        data => {

          processAfterLoad( data );
          return;

        },
        error => {

          if (error == "cordova_not_available") {

            // fallback to HTML5 LocalStorage if Cordova is not available
            this.useLocalStorage = true;

            processAfterLoad( this.getAppDataFromLocalStorage() );
            return;

          } else {

            // init with default
            this.appDataCache = new AppData();

            try {

              // in case AppData can not be found ... do init
              if (error.code == 2) {

                console.log('Initializing Native Storage');
                processAfterLoad(null);
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

  /**
   * Set and store the App wide locale used for language shown in the app.
   * @param {string} locale
   */
  setLocale(locale : string) : void {
    this.appDataCache.i18nLocale = locale;
    this.persistAppData();
  }

  /**
   * Store the user account and password.
   * @param {string} user
   * @param {string} pass
   */
  setUsercredentials(user: string, pass: string) : void {
    this.appDataCache.username = user;
    this.appDataCache.password = pass;
    this.persistAppData();
  }

  /**
   * Store the last session token given by the server.
   * @param {JsonWebToken} token
   */
  setJsonWebToken(token: JsonWebToken) : void {
    this.appDataCache.jsonWebtoken = token;
    this.persistAppData();
  }

  /*
   * PRIVATE METHODS
   */

  private initDefaultValues(fromPersitence: AppData ) : AppData {

    // if persistence does not exist yet create
    if (typeof fromPersitence === 'undefined') new AppData();
    if (fromPersitence === null) return new AppData();

    // if persistence exists update data fields
    let defaultAppData : AppData = new AppData();
    for (var key in defaultAppData) {

      // check if data field needs to get added
      if (typeof fromPersitence[key] === "undefined") {
        fromPersitence[key] = defaultAppData[key];
      }

    }
    return fromPersitence;
  }

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

