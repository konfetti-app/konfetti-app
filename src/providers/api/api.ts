import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';

import { Observable } from 'rxjs/Observable';

// https://medium.com/@vipinswarnkar1989/socket-io-in-mean-angular4-todo-app-29af9683957f
import io from "socket.io-client";

/*
 * Interface to the Konfetti Backend API
 * https://github.com/konfetti-app/konfetti-backend
 */
@Injectable()
export class ApiProvider {

  private apiUrlBase : string = 'http://localhost:3000/';

  // temp storage of credentials
  private jsonWebToken : JsonWebToken;
  private user: string = null;
  private pass: string = null;

  // outside listeners
  private observerNewAccessToken : any = null;
  private observeNetworkProblem : any = null;

  // websocket for chat
  private socketChat = null;

  constructor(
    private http: HttpClient
  ) {

    // init JWT with outdated value
    this.jsonWebToken = new JsonWebToken();
    this.jsonWebToken.token = '';
    this.jsonWebToken.deadline = 0;
  }


  /**
   * Manually set API base URL
   * @param {string} baseURL e.g. 'http://localhost:3000/'
   */
  setApiBaseUrl(baseURL: string) : void {
    this.apiUrlBase = baseURL;
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
        this.jsonWebToken.deadline = Date.now() + ((secondsUntilTokenExpires-10) * 1000);

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

        // default error handling
        this.defaultHttpErrorHandling(error, observer, "refreshAccessToken", () => {
          this.refreshAccessToken(user, pass).subscribe((win) => {observer.next(win); observer.complete();}, (error) => {
            observer.error(error);
          });
        });

      });

    });

  }

  // trigger the password reset process
  resetPassword(user:string) : Observable<void> {

    return Observable.create((observer) => {

      // Basic Auth with username and password
      let headers =  new HttpHeaders();

      // get new JWT token
      this.http.get<any>(this.apiUrlBase+'api/users/'+user+'/resetPassword', {
        headers: headers
      }).subscribe( data => {

        /*
         * SUCCESS
         */

        // return success
        observer.next(null);
        observer.complete();

      }, (error) => {

        /*
         * ERROR
         */

        // default error handling
        this.defaultHttpErrorHandling(error, observer, "resetPassword", () => {
          this.resetPassword(user).subscribe((win) => {observer.next(win); observer.complete();}, (error) => {
            observer.error(error);
          });
        });

      });

    });

  }

  /**
   * Opens a WebSocket to revceive messages on a Chat.
   * @param chat the chat to connect to
   */
  initChatSocket(chat:Chat): Observable<Message> {
    return Observable.create( (observer ) => {
      this.socketChat = io.connect(this.apiUrlBase);
      this.socketChat.on('connect', () => {
        this.socketChat
        .emit('authenticate', {token: this.jsonWebToken.token})
        .on('authenticated', () => {
          console.log('SOCKETIO: User authenticated');
          this.socketChat.on('connection established', (data) => {
            console.log('SOCKETIO: chat connection established');
            this.socketChat.emit("room selection", {"roomID": chat._id});
            console.log('SOCKETIO: selected room '+chat._id);
            this.socketChat.on('chat message', (data:Message) => {
              console.log("SOCKETIO: Got message",data);
              observer.next(data);
            });
          });
        })
        .on('unauthorized', (msg) => {
          observer.error('unauthorized');
        })
      });
    });  
  };


  /**
   * Sends a text message on the actual connected chat.
   * @param text the text message to send to chat
   */
  sendChatSocket(text:string) : void {
    if (this.socketChat==null) return;
    this.socketChat.emit('chat message', text);
  }

  /**
   * Closes a socket channel.
   */
  closeChatSocket(): void {
    if (this.socketChat==null) return;
    this.socketChat.close();
    this.socketChat = null;
  }

  /*
   * Subscribe with deviceId at PushNotification Service.
   */
  subscribePushNotificationService(playerId:string) : Observable<void> {
    return Observable.create((observer) => {

      this.getJWTAuthHeaders().subscribe(headers => {

        // prepare header for json body data
        headers = headers.append('Content-Type', 'application/json');
        
        // make post request
        this.http.post<any>(
          this.apiUrlBase + 'api/users/addToken',
          '{"playerId" : "'+playerId+'"}',
          { headers: headers }).subscribe( resp => {

          observer.next();
          observer.complete();

        }, error => {

          // default error handling
          this.defaultHttpErrorHandling(error, observer, "subscribePushNotificationService", () => {
            this.subscribePushNotificationService(playerId).subscribe(
              (win) => {  observer.next(win); observer.complete(); },
              (error) => observer.error(error)
            );
          });

        });

      }, error => {
        observer.error(error)
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

  redeemAdditionalCode(code:string) : Observable<Code> {
    return Observable.create((observer) => {

      this.getJWTAuthHeaders().subscribe(headers => {

        this.http.post<any>(this.apiUrlBase + 'api/codes/' + code, '',{
          headers: headers
        }).subscribe( resp => {

          observer.next(resp.data.code as Code);
          observer.complete();

        }, error => {

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
          this.defaultHttpErrorHandling(error, observer, "redeemAdditionalCode", () => {
            this.redeemAdditionalCode(code).subscribe(
              (win) => {  observer.next(win); observer.complete(); },
              (error) => observer.error(error)
            );
          });

        });

      }, error => {
        observer.error(error)
      });

    });
  }

  subscribeChat(chatId:string) : Observable<void> {
    return Observable.create((observer) => {

      this.getJWTAuthHeaders().subscribe(headers => {

        // prepare header for json body data
        headers = headers.append('Content-Type', 'application/json');
        
        // make post request
        this.http.post<any>(
          this.apiUrlBase + 'api/chats/subscriptions/',
          '{"id" : "'+chatId+'"}',
          { headers: headers }).subscribe( resp => {

          observer.next();
          observer.complete();

        }, error => {

          // default error handling
          this.defaultHttpErrorHandling(error, observer, "subscribeChat", () => {
            this.subscribeChat(chatId).subscribe(
              (win) => {  observer.next(win); observer.complete(); },
              (error) => observer.error(error)
            );
          });

        });

      }, error => {
        observer.error(error)
      });

    });
  }

  unsubscribeChat(chatId:string) : Observable<void> {
    return Observable.create((observer) => {

      this.getJWTAuthHeaders().subscribe(headers => {
        
        this.http.delete<any>(
          this.apiUrlBase + 'api/chats/subscriptions/'+chatId,
          { headers: headers }).subscribe( resp => {

          observer.next();
          observer.complete();

        }, error => {

          // default error handling
          this.defaultHttpErrorHandling(error, observer, "unsubscribeChat", () => {
            this.unsubscribeChat(chatId).subscribe(
              (win) => {  observer.next(win); observer.complete(); },
              (error) => observer.error(error)
            );
          });

        });

      }, error => {
        observer.error(error)
      });

    });
  }

  getChats(groupId:String, context:String, userId:string=null, userName:string=null, avatarFilename:string=null) : Observable<Array<Chat>> {

  return Observable.create((observer) => {

    this.getJWTAuthHeaders().subscribe(headers => {

      this.http.get<any>(this.apiUrlBase + 'api/chats/'+groupId+"/"+context, {
        headers: headers
      }).subscribe((resp) => {

        /*
         * WIN
         */
        
        // client side process 
        let input:Array<Chat> = resp.data.chatChannels as Array<Chat>;
        let results:Array<Chat> = [];
        input.forEach(element => {
          results.push(this.addDisplayData(element, userId, userName, avatarFilename));
        });

        // return results
        observer.next(results);
        observer.complete();

      }, error => {
        // default error handling
        this.defaultHttpErrorHandling(error, observer, "getChat", () => {
          this.getChats(groupId, context).subscribe(
            (win) => {  observer.next(win); observer.complete(); },
            (error) => observer.error(error)
          );
        });

      });

    }, error => {
      observer.error(error)
    });

  });
 } 

 getChatMessages(chat:Chat, timestamp:number) : Observable<Array<Message>> {

    return Observable.create((observer) => {

      this.getJWTAuthHeaders().subscribe(headers => {
        
        this.http.get<any>(this.apiUrlBase + 'api/chats/channel/'+chat._id+'/since/'+timestamp, {
          headers: headers
        }).subscribe((resp) => {

          /*
           * WIN
           */
          chat.subscribed = resp.data.subscribed;
          observer.next(resp.data.chatMessages as Array<Message>);
          observer.complete();

        }, error => {

          // not found
          try {
            if (JSON.parse(error.error).errors[0].message === 'chat not found') {
              observer.error('NOTFOUND');
              return;
            }
          } catch (e) {}

          // default error handling
          this.defaultHttpErrorHandling(error, observer, "getChatMessages", () => {
            this.getChatMessages(chat, timestamp).subscribe(
              (win) => {  observer.next(win); observer.complete(); },
              (error) => observer.error(error)
            );
          });

        });

      }, error => {
        observer.error(error)
      });

    });
   }

   createChat(chat:Chat, userId:string=null, userName:string=null, avatarFilename:string=null) : Observable<Chat> {

    return Observable.create((observer) => {

      this.getJWTAuthHeaders().subscribe(headers => {

        // prepare header for json body data
        headers = headers.append('Content-Type', 'application/json');

        this.http.post<any>(this.apiUrlBase + 'api/chats/', JSON.stringify(chat),{
          headers: headers
        }).subscribe((resp) => {

          /*
           * WIN
           */

          // client side process 
          let newChat = resp.data.chatChannel as Chat;
          newChat = this.addDisplayData(newChat, userId, userName, avatarFilename);

          // return
          observer.next(newChat);
          observer.complete();

        }, error => {

          // default error handling
          this.defaultHttpErrorHandling(error, observer, "createChat", () => {
            this.createChat(chat).subscribe(
              (win) => {  observer.next(win); observer.complete(); },
              (error) => observer.error(error)
            );
          });

        });

      }, error => {
        observer.error(error)
      });

    });
  }

  deleteChat(chat:Chat) : Observable<void> {

    return Observable.create((observer) => {

      this.getJWTAuthHeaders().subscribe(headers => {

        // prepare header for json body data
        headers = headers.append('Content-Type', 'application/json');

        this.http.delete<any>(this.apiUrlBase + 'api/chats/channel/'+chat._id,{
          headers: headers
        }).subscribe((resp) => {

          /*
           * WIN
           */

          observer.next();
          observer.complete();

        }, error => {

          // default error handling
          this.defaultHttpErrorHandling(error, observer, "deleteChat", () => {
            this.deleteChat(chat).subscribe(
              (win) => {  observer.next(win); observer.complete(); },
              (error) => observer.error(error)
            );
          });

        });

      }, error => {
        observer.error(error)
      });

    });
  }

  // get the newsfeed for logged in user for one neighborhood
  getNewsFeedPosts(groupID:string) :  Observable<Array<Post>> {

    return Observable.create((observer) => {

      this.getJWTAuthHeaders().subscribe(headers => {

        this.http.get<any>(this.apiUrlBase + 'api/newsfeed/neighbourhood/' + groupID
        , {
          headers: headers
        }).subscribe((resp) => {

          if (resp.data.newsfeed == null) {
            observer.error("Got 200 - but resp.data.newsfeed is null")
            observer.complete();
          } else {
            observer.next(resp.data.newsfeed.posts as Array<Post>);
            observer.complete();
          }

        }, error => {

          // default error handling
          this.defaultHttpErrorHandling(error, observer, "getNewsFeedPosts", () => {
            this.getNewsFeedPosts(groupID).subscribe(
              (win) => {  observer.next(win); observer.complete(); },
              (error) => observer.error(error)
            );
          });

        });

      }, error => {
        observer.error(error)
      });

    });
  }

  deleteNewsFeedPost(id: string) : Observable<void> {
    return Observable.create((observer) => {

      this.getJWTAuthHeaders().subscribe(headers => {
        
        this.http.delete<any>(
          this.apiUrlBase + 'api/newsfeed/'+id,
          { headers: headers }).subscribe( resp => {

          observer.next();
          observer.complete();

        }, error => {

          // default error handling
          this.defaultHttpErrorHandling(error, observer, "deleteNewsFeedPost", () => {
            this.deleteNewsFeedPost(id).subscribe(
              (win) => {  observer.next(win); observer.complete(); },
              (error) => observer.error(error)
            );
          });

        });

      }, error => {
        observer.error(error)
      });

    });
  }

  getUser(id: string) : Observable<User> {

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

          // not found
          try {
            if (JSON.parse(error.error).errors[0].message === 'user not found') {
              observer.error('NOTFOUND');
              return;
            }
          } catch (e) {}

          // default error handling
          this.defaultHttpErrorHandling(error, observer, "getUser", () => {
            this.getUser(id).subscribe(
              (win) => {  observer.next(win); observer.complete(); },
              (error) => observer.error(error)
            );
          });

        });

      }, error => {
        observer.error(error)
      });

    });
   }

  updateUserInfo(id: string, userUpdate: UserUpdate) : Observable<User> {

    return Observable.create((observer) => {

      this.getJWTAuthHeaders().subscribe(headers => {

        // prepare header for json body data
        headers = headers.append('Content-Type', 'application/json');

        this.http.post<any>(this.apiUrlBase + 'api/users/'+id, JSON.stringify(userUpdate),{
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
            this.updateUserInfo(id, userUpdate).subscribe(
              (win) => {  observer.next(win); observer.complete(); },
              (error) => observer.error(error)
            );
          });

        });

      }, error => {
        observer.error(error)
      });

    });
  }

// creates a konfetti idea and returns the ID of the new idea
createKonfettiIdea(idea:Idea): Observable<string> {

    return Observable.create((observer) => {

      this.getJWTAuthHeaders().subscribe(headers => {

        // prepare header for json body data
        headers = headers.append('Content-Type', 'application/json');

        this.http.post<any>(this.apiUrlBase + 'api/ideas/', JSON.stringify(idea),{
          headers: headers
        }).subscribe((resp) => {

          /*
           * WIN
           */

          observer.next(resp.data.idea._id);
          observer.complete();

        }, error => {

          // default error handling
          this.defaultHttpErrorHandling(error, observer, "createKonfettiIdea", () => {
            this.createKonfettiIdea(idea).subscribe(
              (win) => {  observer.next(win); observer.complete(); },
              (error) => observer.error(error)
            );
          });

        });

      }, error => {
        observer.error(error)
      });

    });
  }

// updates a konfetti idea
updateKonfettiIdea(idea:Idea): Observable<string> {
  return Observable.create((observer) => {
    this.getJWTAuthHeaders().subscribe(headers => {
      headers = headers.append('Content-Type', 'application/json');
      this.http.post<any>(this.apiUrlBase + 'api/ideas/'+idea._id, JSON.stringify(idea),{
        headers: headers
      }).subscribe((resp) => {
        // WIN
        observer.next(resp.data.idea._id);
        observer.complete();
      }, error => {
        // default error handling
        this.defaultHttpErrorHandling(error, observer, "updateKonfettiIdea", () => {
          this.updateKonfettiIdea(idea).subscribe(
            (win) => {  observer.next(win); observer.complete(); },
            (error) => observer.error(error)
          );
        });
      });
    }, error => {
      observer.error(error)
    });
  });
}

  getKonfettiIdeas(groupId:string, userId:string=null, userName:string=null, avatarFilename:string=null) : Observable<Array<Idea>> {
    return Observable.create((observer) => {
      this.getJWTAuthHeaders().subscribe(headers => {
        this.http.get<any>(this.apiUrlBase + 'api/ideas/neighbourhood/' + groupId
        , {
          headers: headers
        }).subscribe((resp) => {

          // client side process 
          let ideas:Array<Idea> = resp.data.ideas as Array<Idea>;
          let results:Array<Idea> = [];
          ideas.forEach(element => {
            if (element.reviewStatus==null) element.reviewStatus = "OK";
            if (element.konfettiTotal==null) element.konfettiTotal = 0;
            if (element.konfettiUser==null) element.konfettiUser = 0;
            if (element.userIsHelping==null) element.userIsHelping = element.helpers.indexOf(userId)>=0;
            if (element.userIsAttending==null) element.userIsAttending = element.subscribers.indexOf(userId)>=0;
            results.push(this.addDisplayData(element, userId, userName, avatarFilename));
          });

          observer.next(results);
          observer.complete();
        }, error => {
          // default error handling
          this.defaultHttpErrorHandling(error, observer, "getKonfettiIdeas", () => {
            this.getKonfettiIdeas(groupId, userId, userName, avatarFilename).subscribe(
              (win) => {  observer.next(win); observer.complete(); },
              (error) => observer.error(error)
            );
          });
        });
      }, error => {
        observer.error(error)
      });
    });
  }

  deleteKonfettiIdea(id:string) : Observable<void> {
    return Observable.create((observer) => {
      this.getJWTAuthHeaders().subscribe(headers => {
        headers = headers.append('Content-Type', 'application/json');
        this.http.delete<any>(this.apiUrlBase + 'api/ideas/'+id,{
          headers: headers
        }).subscribe((resp) => {
          observer.next();
          observer.complete();
        }, error => {
          // default error handling
          this.defaultHttpErrorHandling(error, observer, "deleteKonfettiIdea", () => {
            this.deleteKonfettiIdea(id).subscribe(
              (win) => {  observer.next(win); observer.complete(); },
              (error) => observer.error(error)
            );
          });
        });
      }, error => {
        observer.error(error)
      });
    });
  }

  voteKonfettiIdea(ideaID:string, count:number) : Observable<VoteResult> {
    return Observable.create((observer) => {
      setTimeout(()=>{
          let result:VoteResult = {} as VoteResult;
          result.konfettiIdea = 1;
          result.konfettiWallet = 0;
          observer.next(result);
          observer.complete();
      },200);
    });
  }

  joinKonfettiIdea(ideaID:string, attent:boolean, helping:boolean) : Observable<JoinResult> {
  return Observable.create((observer) => {
    this.getJWTAuthHeaders().subscribe(headers => {
      headers = headers.append('Content-Type', 'application/json');
      let input:JoinResult = {} as JoinResult;
      input.isAttending = attent;
      input.isHelping = helping;
      this.http.post<any>(this.apiUrlBase + 'api/ideas/'+ideaID+'/status', JSON.stringify(input),{
        headers: headers
      }).subscribe((resp) => {
        // WIN
        observer.next(input);
        observer.complete();
      }, error => {
        // default error handling
        this.defaultHttpErrorHandling(error, observer, "joinKonfettiIdea", () => {
          this.joinKonfettiIdea(ideaID, attent, helping).subscribe(
            (win) => {  observer.next(win); observer.complete(); },
            (error) => observer.error(error)
          );
        });
      });
    }, error => {
      observer.error(error)
    });
  });
  }

  setUserAvatarImage(file:any) : Observable<any> {
    return Observable.create((observer) => {

      this.getJWTAuthHeaders().subscribe(headers => {

        const formData: FormData = new FormData();
        formData.append('avatar', file, (file.name) ? file.name : 'upload.jpg');

        this.http.post<any>(this.apiUrlBase + 'api/assets/avatar', formData,{
          headers: headers
        }).subscribe( resp => {

          observer.next(resp.data);
          observer.complete();

        }, error => {

          // default error handling
          this.defaultHttpErrorHandling(error, observer, "setUserAvatarImage", () => {
            this.setUserAvatarImage(file).subscribe(
              (win) => {  observer.next(win); observer.complete(); },
              (error) => observer.error(error)
            );
          });

        });

      }, error => {
        observer.error(error)
      });

    });
  }

  /**
   * Get the URL where to load a uploaded image file (avatar or image content)
   * @param {string} filename
   * @returns {string} complete URL to be used in image tag src
   */
  buildImageURL(filename:string) : string {
    return this.apiUrlBase+'assets/'+filename;
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
    } else

    // SZENARIO: Renew JWT
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
        } else {
          // forward to original error callback
          errorObserver.error(error);
        }

      });
    } else {

      // forward to original error callback
      console.log("defaultHttpErrorHandling: Not able to handle error --> FORWARD ERROR");
      errorObserver.error(error);

    }

  }

  /**
   * Convert a image data url into a file object that works with upload.
   * @param {string} dataURI
   * @returns {any}
   */
  public dataURItoBlob(dataURI: string) : any{
    let byteString = atob(dataURI.split(',')[1]);
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeString});
  }

  private getJWTAuthHeaders() : Observable<HttpHeaders> {
    return Observable.create((observer) => {

      // initial header setting
      let headers =  new HttpHeaders();

      if ((!this.jsonWebToken) || (Date.now()>this.jsonWebToken.deadline)) {

        // JWT token need refresh
        this.refreshAccessToken(this.user, this.pass).subscribe((jwt: JsonWebToken) => {

          /*
           * WIN
           */

          // build header with new token
          headers = headers.append("Authorization", "Bearer " + jwt.token);
          headers = headers.append("Cache-Control", "no-cache, must-revalidate");
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
        headers = headers.append("Cache-Control", "no-cache, must-revalidate");
        observer.next(headers);
        observer.complete();

      }

    });
  }

  private addDisplayData(post:DisplayData, userId:string, userName:string, avatarFilename:string) : any {

    // check if user is admin
    post.userIsAdmin = false;
    if (post.created.byUser._id==userId) post.userIsAdmin = true;
  
    // set author image & name
    if (post.userIsAdmin) {
      post.displayName = userName;
      if (avatarFilename) {
        // user image
        post.displayImage = this.buildImageURL(avatarFilename);
      } else {
        // default image
        post.displayImage = "./assets/imgs/default-user.jpg";
      }
    } else {
      // set when other user
      post.displayName = post.created.byUser.nickname;
      if (post.created.byUser.avatar) {
        post.displayImage = this.buildImageURL(post.created.byUser.avatar.filename);
      } else {
        post.displayImage = "./assets/imgs/default-user.jpg";
      }
    }
  
    return post;
  }

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
  geoData: GeoData;
}

export interface GeoData {
  longitude: number;
  latitude: number;
  radius: number;
}

export class User {
  created: number;
  disabled: boolean;
  isAdmin: boolean;
  lastSeen: number;
  nickname: string;
  description: string;
  neighbourhoods: Array<Group>;
  spokenLanguages: Array<string>;
  avatar: Avatar;
}

export interface Message {

  // data from backend
  _id:string;
  channelName:string;
  date:number;
  parentUser:any;
  type:string;
  text:string;

  // local field (not part of backend data)
  belongsToUser?: boolean; 
  displayName?:string;
  displayImage?:string;
  displayTime?:string;
}

export interface Chat extends DisplayData {
  _id?: string;
  name: string;
  description: string;
  created:any;
  members:Array<any>;
  parentNeighbourhood:string;
  context:string;

  // local field (not part of backend data)
  subscribed?:boolean;
}

export interface Idea extends DisplayData {
  _id:string;
  parentNeighbourhood:string;
  title:string;
  description:string;
  address:string;
  geoData:any;
  date:number;
  wantsHelper:boolean;
  helpDescription:string;
  wantsGuest:boolean;
  reviewStatus:string;
  konfettiTotal:number;
  konfettiUser:number;
  userIsHelping:boolean;
  userIsAttending:boolean;
  orgaChatID:string;
  helpers:Array<string>;
  subscribers:Array<string>;
}

export interface VoteResult {
  konfettiIdea:number;    // the new balance on idea
  konfettiWallet:number;  // the new balance on user
}

export interface JoinResult {
  isAttending:boolean;
  isHelping:boolean;
}

export interface DisplayData {
  created:any;              // comes from server 
  userIsAdmin?:boolean;     // will get culculated on client side
  displayImage?:string;     // will get culculated on client side
  displayName?:string;      // will get culculated on client side
}

export interface Thread {
  _id: string;
  parentNeighbourhood : string;
  context: string
  author: string;
  data: any; 
  meta: any;
  ts: number; // for sorting
}

export interface Post {
  _id: string;
  parentThread: string;
  type: string; 
  data: any;
  meta: any;
  crreated: any; // ts =
}

// all notification data for opening a special 
// could come from a notification within newsfeed or thru a push notification
export interface PushNotification {
  pushIDs: Array<String>; // one notification can be related to multiple push messages
  groupId?: string; // the neighborhood 
  module: string; // the module 
  itemID: string; // item within module
  subID?: string;  // a sub item within that item
  data?: any; // optional extending data
}

export interface Code {
  actionType: string; // newNeighbour
  neighbourhood: string;
}

export interface Avatar {
  filename: string;
}

export class UserUpdate {
  nickname: string;
  username: string;
  preferredLanguage: string;
  spokenLanguages: Array<string>;
  description:string;
  password:string;
  email: string;
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
