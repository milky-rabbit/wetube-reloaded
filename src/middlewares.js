export const localsMiddleware = (req, res, next) => {
    // locals : pug와 공유할 수 있음!!!!!!!!
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.siteName="Wetube";
    res.locals.loggedInUser = req.session.user;
    console.log(req.session.user);
    console.log(res.locals);
    next();
};

