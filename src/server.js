/*
Router
- controller와 url 관리 용이
- mini-application
- 작업중인 주제를 기반으로 URL 그룹화

view engine - pug
- views 안의 파일을  pug가 랜더링하여 html로 변환

mixins
- 같은 형태의 구조(block)의 다른 데이터 일 때, 사용
- cf) partials

mongo DB https://www.mongodb.com/
- document-based, 분산형 DB
- object 저장. JSON-like-documents
- 설치
1) Resources-Documentation-server-Installation-community edition(무료)
2) chocolatey 설치 (https://chocolatey.org/) 후 명령어 실행
 ㄱ) PowerShell 최신 버전 검색 winget search Microsoft.PowerShell
 ㄴ)PowerShell 설치 winget install --id Microsoft.Powershell --source winget
 ㄷ)powershell 실행 - 
    - 개인용으로 Chocolatey 설치
      Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
 ㄹ)chocolatey를 이용한 mongoDB 설치
    - choco install mongodb
3) 확인 및 실행
> mongod --version
> mongod
4) mongo shell 실행
   - Resources-Documentation-server-Installation-MongoDB Shell (mongosh)

monoose https://mongoosejs.com/
- nodeJS와 mongoDB 연결


webpack 설치
1. webpack CLI설치
npm i webpack webpack-cli --save-dev or npm i webpack webpack-cli -D
2. webpack.config.js 파일 생성
3. babel-loader 설치
npm install -D babel-loader
4. scss-loader 설치 : scss를 css로 변환
npm install sass-loader sass webpack --save-dev
5. css-loader 설치 : @import, url() 해석
npm install --save-dev css-loader
6. style-loader 설치 : css를 DOM에 주입
npm install --save-dev style-loader
7. MiniCssExtractPlugin : 해당 코드를 다른 파일로 분리
npm install --save-dev mini-css-extract-plugin
*/
import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import rootRouter from "./routers/rootRouter"
import videoRouter from "./routers/videoRouter"
import userRouter from "./routers/userRouter"
import {localsMiddleware} from "./middlewares"

const app = express();//express application
const logger = morgan("dev");

app.set("view engine", "pug");
app.set("views", process.cwd() + '/src/views');
app.set("x-powered-by", false);

/*
 * middleware
 */
app.use(logger);
app.use(express.urlencoded({extended : true}));

/*
 * session middleware
 * 들어오는 모든 요청 기억
 * 쿠키는 session Id만 저장, session data는 저장하지 않음
 * 개발자모드 Application 
 * - Domain : backend가 누구인지 noti, 어디서 와서 어디로 가는지
 * - Path :  경로
 * - Expires : 만료날짜. 만료날짜를 지정하지 않으면 session cookie(브라우저를 닫으면 끝)로 저장
 * - Max-Age : 언제 세션이 만료되는지
 */
app.use(session({
   //쿠키에 sign할 때 사용하는 string
   //쿠키에 sign 하는 이유 : backend가 쿠키를 줬다는 걸 보여주기 위함
   //길게 무작위 생성, 이 stringㅇ로 쿠키를 sign하고 우리가 만든 것임을 증명 
   secret:process.env.COOKIE_SECRET,
   resave: false,
   //session이 새로 만들어지고 수정된 적이 없을 때를 "uninitialized" 라고 부름.
   //(ex. 로그인 할 때 수정됨)
   //session을 수정할 때만 session을 DB에 저장하고 쿠키를 넘겨주는 옵션.
   //IOS, 안드로이드 앱 같은 경우 token 사용
   saveUninitialized: false,
   //session expired Max-age 설정ㄴ
   // cookie: {
   //    maxAge: 20000, //20초
   // },
   //session이 server에 저장되지 않고 db에 저장되도록!! db.sessions.find();
   store: MongoStore.create({mongoUrl: process.env.DB_URL}),
}));

app.use(localsMiddleware);//순서 중요. session 다음이어야 함.
// app.use((req, res, next)=>{
//    res.locals.siteName = "Wetube";  // pug와 공유할 수 있음!!!!!!!!
//    req.sessionStore.all((error, sessions) => {
//       console.log(sessions);
//       next();
//    })
// });

// app.get("/add-one", (req, res, next)=> {
//    req.session.potato += 1;
//    return res.send(`${req.session.id}\n${req.session.potato}`);
// });


/*
 * router call 
 */
//argument : 디렉토리 이름, 이 ㄷ렉토리 안에 있는 파일들의 접근가능하도록.
app.use("/uploads", express.static("uploads"));
app.use("/static", express.static("assets"));
app.use("/", rootRouter);
app.use("/videos", videoRouter);
app.use("/users", userRouter);

export default app;