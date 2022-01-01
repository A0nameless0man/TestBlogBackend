
module "express-session" {
  namespace session {
    interface SessionData {
      userId: number;
    }
  }
  export = session

declare function session(options?: session.SessionOptions): express.RequestHandler;
}
