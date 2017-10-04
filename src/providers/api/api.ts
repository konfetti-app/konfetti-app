import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import './JsonWebToken';

/*
 * Interface to the Konfetti Backend API
 * https://github.com/konfetti-app/konfetti-backend
 */
@Injectable()
export class ApiProvider {

  private apiUrlBase : string = 'http://localhost:3000/';

  private serverTokenDuration : number = 15 * 60 * 1000; // 15min TODO: sync with server
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
        this.jsonWebToken.token = data.data.token;
        this.jsonWebToken.deadline = Date.now() + this.serverTokenDuration;

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
