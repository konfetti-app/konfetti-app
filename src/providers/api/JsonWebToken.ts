interface JsonWebToken {

  // the base64 JWT
  token : string;

  // timestamp when token expires (in milliseconds)
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
