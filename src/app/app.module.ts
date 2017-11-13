import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { MainPage } from '../pages/main/main';
import { InitPage } from '../pages/init/init';
import { IntroPage } from '../pages/intro/intro';
import { ProfilePage } from '../pages/profile/profile';
import { LoginPage } from '../pages/login/login';
import { SettingsPage } from '../pages/settings/settings';
import { CodeRedeemPage } from '../pages/code-redeem/code-redeem';
import { LengthBreakPipe } from "../pipes/length-break/length-break";

import { ApiProvider } from '../providers/api/api';

import { AppVersion } from '@ionic-native/app-version';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpClientModule } from '@angular/common/http';

// http://ionicframework.com/docs/developer-resources/ng2-translate/
import { TranslateModule } from '@ngx-translate/core';

// http://ionicframework.com/docs/native/native-storage/
import { NativeStorage } from '@ionic-native/native-storage';

import { AppStateProvider } from '../providers/app-state/app-state';
import { AppPersistenceProvider } from '../providers/app-persistence/app-persistence';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { MainPageModule } from '../pages/main/main.module'

@NgModule({
  declarations: [
    MyApp,
    InitPage,
    IntroPage,
    LoginPage,
    ProfilePage,
    SettingsPage,
    CodeRedeemPage,
    LengthBreakPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    IonicModule.forRoot(MyApp),
    BrowserAnimationsModule,
    MainPageModule

  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    InitPage,
    MainPage,
    IntroPage,
    ProfilePage,
    CodeRedeemPage,
    LoginPage,
    SettingsPage
  ],
  providers: [
    AppVersion,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ApiProvider,
    NativeStorage,
    AppPersistenceProvider,
    AppStateProvider,
    BarcodeScanner
  ]
})
export class AppModule {}
