import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { MainPage } from '../pages/main/main';
import { InitPage } from '../pages/init/init';
import { IntroPage } from '../pages/intro/intro';
import { ProfilePage } from '../pages/profile/profile';
import { LoginPage } from '../pages/login/login';

import { ApiProvider } from '../providers/api/api';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpClientModule } from '@angular/common/http';

// http://ionicframework.com/docs/developer-resources/ng2-translate/
import { TranslateModule } from '@ngx-translate/core';

// http://ionicframework.com/docs/native/native-storage/
import { NativeStorage } from '@ionic-native/native-storage';

import { AppStateProvider } from '../providers/app-state/app-state';
import { AppPersistenceProvider } from '../providers/app-persistence/app-persistence';



@NgModule({
  declarations: [
    MyApp,
    InitPage,
    IntroPage,
    LoginPage,
    ProfilePage,
    MainPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    IonicModule.forRoot(MyApp),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    InitPage,
    MainPage,
    ProfilePage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ApiProvider,
    NativeStorage,
    AppPersistenceProvider,
    AppStateProvider
  ]
})
export class AppModule {}
