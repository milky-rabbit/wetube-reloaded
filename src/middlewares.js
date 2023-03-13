import multer from "multer";

export const localsMiddleware = (req, res, next) => {
    // locals : pug와 공유할 수 있음!!!!!!!!
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName="Wetube";
    res.locals.loggedInUser = req.session.user || {};
    next();
};

export const protectorMiddleware = (req, res, next) => {
    if(req.session.loggedIn) {
        next();
    } else {
        return res.redirect("/login");
    }
}

export const publicOnlyMiddleware = (req, res, next) => {
    if(!req.session.loggedIn) {
        return next();
    } else {
        return res.redirect("/");
    }
}

//깃허브 로그인 하지 않은 사람의 middleware 생성도 가능
//비밀번호 변경 url 같은..(passwordUsersOnlyMiddleware)

export const avatarUpload = multer({ dest: 'uploads/avatars/', limits: {fileSize:300000}});
export const videoUpload = multer({ dest: 'uploads/videos/', limits: {fileSize:100000000} });