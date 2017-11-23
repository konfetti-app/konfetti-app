import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';

import { Observable } from 'rxjs/Observable';


class JsonWebToken {

  // the base64 JWT
  token : string;

  // timestamp when token expires (in milliseconds, already corrected to client time)
  deadline : number;

}

interface JsonWebTokenResponse {
  code : number;
  data : JsonWebTokenData;
  status : string;
}

interface JsonWebTokenData {
  token : string;
}

/*
 * Interface to the Konfetti Backend API
 * https://github.com/konfetti-app/konfetti-backend
 */
@Injectable()
export class ApiProvider {

  private apiUrlBase : string = 'http://localhost:3000/';

  private jsonWebToken : JsonWebToken;

  constructor(private http: HttpClient) {
    console.log('Hello ApiProvider Provider');
  }

  // set if available on local storage
  setAccessToken(token:string) {
  }

  /**
   * Refresh Json Web Token (JWT) with username and password.
   * @param {string} user
   * @param {string} pass
   * @returns {Observable<void>}
   */
  refreshAccessToken(user:string, pass:string) : Observable<JsonWebToken> {

    return Observable.create((observer) => {

      // Basic Auth with username and password
      let headers =  new HttpHeaders();
      headers = headers.append("Authorization", "Basic " + btoa(user+":"+pass));

      // get new JWT token
      this.http.post<JsonWebTokenResponse>(this.apiUrlBase+'api/authenticate','', {
        headers: headers,
      }).subscribe( data => {

        /*
         * SUCCESS
         */

        // remember token
        this.jsonWebToken = new JsonWebToken();
        this.jsonWebToken.token = data.data.token;

        // decode JWT
        let base64Url = data.data.token.split('.')[1];
        let base64 = base64Url.replace('-', '+').replace('_', '/');
        let tokenObject = JSON.parse(window.atob(base64));

        // calculate token timeout timestamp ba
        let secondsUntilTokenExpires = tokenObject.exp - tokenObject.iat;
        this.jsonWebToken.deadline = Date.now() + (secondsUntilTokenExpires * 1000);

        // return success
        observer.next(this.jsonWebToken);
        observer.complete();

      }, (error) => {

        /*
         * ERROR
         */

        // username wrong
        try {
          if (JSON.parse(error.errors).errors[0].message === 'user not found.') {
            observer.error('USER');
            return;
          }
        } catch (e) {}

        // password wrong
        try {
          if (JSON.parse(error.error).errors[0].message === 'wrong password.') {
            observer.error('PASSWORD');
            return;
          }
        } catch (e) {}

        // unknown
        observer.error('UNKNOWN');
        return;

      });

    });

  }

  /*
  private isAccessTokenStillValid() : boolean {
      if (this.accessTokenDeadline == null) return false;
      return ( this.accessTokenDeadline < Date.now());
  }
  */

}
