import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { MainPage } from '../pages/main/main';
import { InitPage } from '../pages/init/init';
import { IntroPage } from '../pages/intro/intro';
import { ProfilePage } from '../pages/profile/profile';
import { LoginPage } from '../pages/login/login';
import { ChatPage } from '../pages/chat/chat';
import { IdeaPage } from '../pages/idea/idea';
import { IdeaEditPage } from '../pages/idea-edit/idea-edit';
import { ChatEditPage } from '../pages/chat-edit/chat-edit';
import { SettingsPage } from '../pages/settings/settings';
import { CodeRedeemPage } from '../pages/code-redeem/code-redeem';
import { DistributionPage } from '../pages/distribution/distribution';
import { LocationPickerPage } from '../pages/location-picker/location-picker';

import { ApiProvider } from '../providers/api/api';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HttpClientModule } from '@angular/common/http';

// http://ionicframework.com/docs/developer-resources/ng2-translate/
import { TranslateModule } from '@ngx-translate/core';

// http://ionicframework.com/docs/native/native-storage/
import { NativeStorage } from '@ionic-native/native-storage';

// https://ionicframework.com/docs/native/camera/
import { Camera } from '@ionic-native/camera';

// https://ionicframework.com/docs/native/keyboard/
import { Keyboard } from '@ionic-native/keyboard';

import { ParticlesProvider } from '../providers/particles/particles';
import { AppStateProvider } from '../providers/app-state/app-state';
import { AppPersistenceProvider } from '../providers/app-persistence/app-persistence';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// https://github.com/konfetti-app/konfetti-app/issues/20
// import { BarcodeScanner } from '@ionic-native/barcode-scanner';

import { MainPageModule } from '../pages/main/main.module';
import { ChatPageModule } from '../pages/chat/chat.module';
import { IdeaPageModule } from '../pages/idea/idea.module';
import { IdeaEditPageModule } from '../pages/idea-edit/idea-edit.module';
import { ChatEditPageModule } from '../pages/chat-edit/chat-edit.module';
import { CodeRedeemPageModule } from '../pages/code-redeem/code-redeem.module';
import { IntroPageModule } from '../pages/intro/intro.module';
import { ProfilePageModule } from '../pages/profile/profile.module';
import { SettingsPageModule } from '../pages/settings/settings.module';
import { LoginPageModule } from '../pages/login/login.module';
import { InitPageModule } from '../pages/init/init.module';
import { DistributionPageModule } from '../pages/distribution/distribution.module';
import { LocationPickerPageModule } from '../pages/location-picker/location-picker.module';

import { AppConfigProvider } from '../providers/app-config/app-config';

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    TranslateModule.forRoot(),
    IonicModule.forRoot(MyApp, {
      iconMode: 'md',
      mode: 'md'
    }),
    BrowserAnimationsModule,
    MainPageModule,
    CodeRedeemPageModule,
    IntroPageModule,
    ChatPageModule,
    ChatEditPageModule,
    IdeaPageModule,
    ProfilePageModule,
    SettingsPageModule, 
    LoginPageModule,
    InitPageModule,
    IdeaEditPageModule,
    DistributionPageModule,
    LocationPickerPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    InitPage,
    MainPage,
    IntroPage,
    ProfilePage,
    CodeRedeemPage,
    DistributionPage,
    LoginPage,
    ChatPage,
    IdeaPage,    
    IdeaEditPage,
    ChatEditPage,
    SettingsPage,
    LocationPickerPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    ApiProvider,
    NativeStorage,
    Camera,
    Keyboard,
    AppPersistenceProvider,
    AppStateProvider,
    //BarcodeScanner,
    ParticlesProvider,
    AppConfigProvider,
    AppConfigProvider
  ]
})
export class AppModule {}
