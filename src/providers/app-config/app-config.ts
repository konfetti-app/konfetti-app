import { Injectable } from '@angular/core';

@Injectable()
export class AppConfigProvider {

  private config:Config;

  constructor() {

    let win = (window as any);
    if (win.appConfig) {
      this.config = win.appConfig as Config;
    } else {
      console.log("FAIL: No App config available.");
      this.config = new Config();
      this.config.forceRealServer = false;
      this.config.realServer = "/";
    }

  }

  isForceRealServer(): boolean {
    return this.config.forceRealServer;
  }

  getRealServer(): string {
    return this.config.realServer;
  }

  getOneSignalAppId(): string {
    return this.config.oneSignalAppId;
  }

  getGoogleProjectNumber(): string {
    return this.config.googleProjectNumber;
  }

}

class Config {
  forceRealServer: boolean;
  realServer: string;
  googleProjectNumber: string;
  oneSignalAppId: string;
}
