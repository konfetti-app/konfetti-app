import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';

import { Observable } from 'rxjs/Observable';


/*
 * Interface to the Konfetti Backend API
 * https://github.com/konfetti-app/konfetti-backend
 */
@Injectable()
export class ApiProvider {

  // TODO: make flexible later on
  private apiUrlBase : string = 'http://localhost:3000/';

  // temp storage of credentials
  private jsonWebToken : JsonWebToken;
  private user: string = null;
  private pass: string = null;

  // outside listeners
  private observerNewAccessToken : any = null;
  private observeNetworkProblem : any = null;

  constructor(private http: HttpClient) {

    // init JWT with outdated value
    this.jsonWebToken = new JsonWebToken();
    this.jsonWebToken.token = '';
    this.jsonWebToken.deadline = 0;

  }

  /**
   * Manually set access credentials - from persistence
   * @param {JsonWebToken} token
   */
  setAccessCredentials(user: string, pass: string, token: JsonWebToken) {
    this.user = user;
    this.pass = pass;
    this.jsonWebToken = token;
  }

  /**
   * Subscribe if API refreshes JWT - use for persistence
   * @returns {Observable<JsonWebToken>}
   */
  setListenerOnNewAccessToken() : Observable<JsonWebToken> {
    return Observable.create((observer ) => {
      this.observerNewAccessToken = observer;
    });
  }

  /**
   * Subscribe if API has any Networkwork problems
   * @returns {Observable<NetworkProblem>}
   */
  setListenerOnNetworkProblems() : Observable<NetworkProblem> {
    return Observable.create((observer ) => {
      this.observeNetworkProblem = observer;
    });
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
        headers: headers
      }).subscribe( data => {

        /*
         * SUCCESS
         */

        // remember access tokens
        this.user = user;
        this.pass = pass;
        this.jsonWebToken = new JsonWebToken();
        this.jsonWebToken.token = data.data.token;

        // decode JWT
        let base64Url = data.data.token.split('.')[1];
        let base64 = base64Url.replace('-', '+').replace('_', '/');
        let tokenObject = JSON.parse(window.atob(base64));

        // calculate token timeout timestamp ba
        let secondsUntilTokenExpires = tokenObject.exp - tokenObject.iat;
        this.jsonWebToken.deadline = Date.now() + (secondsUntilTokenExpires * 1000);

        // if listener set, inform about new access token
        if (this.observerNewAccessToken!=null) {
          this.observerNewAccessToken.next(this.jsonWebToken);
        }

        // return success
        observer.next(this.jsonWebToken);
        observer.complete();

      }, (error) => {

        /*
         * ERROR
         */

        // username wrong
        try {
          if (JSON.parse(error.error).errors[0].message === 'user not found.') {
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

  /**
   * SignUp and join a group by sending a code token to he server.
   * @param {string} code number code
   * @returns {Observable<RedeemCodeRepsonse>}
   */
  redeemCodeAnonymous(code: string, locale: string) : Observable<UserCredentials> {
    return Observable.create((observer) => {

      // Basic Auth with username and password
      let headers =  new HttpHeaders();
      headers = headers.append('Content-Type', 'application/json');

      let body = `{"locale": "${locale}"}`;
      this.http.post<any>(this.apiUrlBase + 'api/codes/'+code+'/anonymous',body, { headers: headers}).subscribe( (resp) => {

        /*
         * WIN
         */

        // remember user/pass and make instant JWT auth
        this.user = resp.data.user.username;
        this.pass = resp.data.clearPassword;

        // prepare result data
        let result : UserCredentials = new UserCredentials();
        result.id = resp.data.user._id;
        result.user = this.user;
        result.pass = this.pass;

        // return data
        observer.next(result);
        observer.complete();

      }, (error) => {

        /*
         * FAIL
         */

        console.dir(error);

        // code invalid
        try {
          if (JSON.parse(error.error).errors[0].message === 'token not found') {
            observer.error('INVALID');
            return;
          }
        } catch (e) {}

        // code already redeemed
        try {
          if (JSON.parse(error.error).errors[0].message === 'token is already redeemed') {
            observer.error('REDEEMED');
            return;
          }
        } catch (e) {}

        // default error handling
        this.defaultHttpErrorHandling(error, observer, "redeemCodeAnonymous", () => {
          this.redeemCodeAnonymous(code, locale).subscribe((win) => {observer.next(win); observer.complete();}, (error) => {
            observer.error(error);
          });
        });

      });

    });
  }

  getUser(id: string) : Observable<any> {

    return Observable.create((observer) => {

      this.getJWTAuthHeaders().subscribe(headers => {

        this.http.get<any>(this.apiUrlBase + 'api/users/'+id, {
          headers: headers
        }).subscribe((resp) => {

          /*
           * WIN
           */

          observer.next(resp.data.user as User);
          observer.complete();

        }, error => {

          // user not found
          try {
            if (JSON.parse(error.error).errors[0].message === 'user not found') {
              observer.error('NOTFOUND');
              return;
            }
          } catch (e) {}

          // default error handling
          this.defaultHttpErrorHandling(error, observer, "getUser", () => {
            this.getUser(id).subscribe((win) => {observer.next(win); observer.complete();}, (error) => {
              observer.error(error);
            });
          });

        });

      }, error => observer.error(error));

    });
   }

  private defaultHttpErrorHandling(error, errorObserver, debugTag:string, retryCallback) : void {

    // SZENARIO: Client is Offline
    if (error.status==0) {
      // forward to app
      if (this.observeNetworkProblem != null) {
        let problem = new NetworkProblem();
        problem.id = "OFFLINE";
        problem.retryCallback = retryCallback;
        this.observeNetworkProblem.next(problem);
        return;
      }
    }

    // try to renew JWT
    if (error.status==401) {
      this.refreshAccessToken(this.user, this.pass).subscribe((newJWT) => {

        /*
         * WIN - retry request
         */

        retryCallback();


      }, (error) => {

        /*
         * FAIL
         */

        // forward to app
        if (this.observeNetworkProblem != null) {
          let problem = new NetworkProblem();
          problem.id = "AUTHFAIL";
          problem.retryCallback = retryCallback;
          this.observeNetworkProblem.next(problem);
          return;
        } else {
          // forward to original error callback
          errorObserver.error(error);
        }

      });
    }

    // forward to original error callback
    errorObserver.error(error);

  }

  private getJWTAuthHeaders() : Observable<HttpHeaders> {
    return Observable.create((observer) => {

      // initial header setting
      let headers =  new HttpHeaders();

      if (Date.now()>this.jsonWebToken.deadline) {

        // JWT token need refresh
        this.refreshAccessToken(this.user, this.pass).subscribe((jwt: JsonWebToken) => {

          /*
           * WIN
           */

          // build header with new token
          headers = headers.append("Authorization", "Bearer " + jwt.token);
          observer.next(headers);
          observer.complete();

        }, (error) => {

          /*
           * FAIL
           */

          // just forward error
          observer.error(error);

        });

      } else {

        // build header with existing token
        headers = headers.append("Authorization", "Bearer " + this.jsonWebToken.token);
        observer.next(this.jsonWebToken);
        observer.complete();

      }

    });
  }

  /*
  private isAccessTokenStillValid() : boolean {
      if (this.accessTokenDeadline == null) return false;
      return ( this.accessTokenDeadline < Date.now());
  }
  */

}

/***************************************
 * PUBLIC Data Classes/Interfaces
 **************************************/

export class UserCredentials {

  id: string;
  user: string;
  pass: string;

}

export interface Group {
  _id: string;
  name: string;
  threads: Array<any>;
  activeModules: Array<any>;
}

export class User {
  created: number;
  disabled: boolean;
  isAdmin: boolean;
  lastSeen: number;
  name: string;
  description: string;
  neighbourhoods: Array<Group>;
  spokenLanguages: Array<string>;
}

export class JsonWebToken {

  // the base64 JWT
  token : string;

  // timestamp when token expires (in milliseconds, already corrected to client time)
  deadline : number;

}

export class NetworkProblem {
  id : string;
  retryCallback : any;
}

/***************************************
 * PRIVATE Data Classes/Interface
 **************************************/

interface JsonWebTokenResponse {
  code : number;
  data : JsonWebTokenData;
  status : string;
}

interface JsonWebTokenData {
  token : string;
}
