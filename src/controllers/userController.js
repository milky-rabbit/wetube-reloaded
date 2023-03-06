import User from "../models/User";
import  bcrypt from "bcrypt";

export const getJoin = (req, res) => {
    return res.render("join", {pageTitle: "Create Account"});
}
export const postJoin = async(req, res) => {
    const pageTitle = "Join";
    const {name, username, email, password, password2, location} = req.body;
    
    if(password !== password2) {
        return res.status(400).render("join", {
            pageTitle,
            errorMessage : "Password confirmation does not match."
        });    
    }
    User.exists()
    const exists= await User.exists({$or:[{username}, {email}]});
    if(exists) {
        return res.status(400).render("join", {pageTitle, errorMessage: "This username/email is already taken."});
    }

    //username이 같은 것이 존재할 경우도 체크 필요
    try {
        await User.create({
            name,
            username,
            email,
            password,
            location
        });
            
        return res.redirect("/login");
    } catch(error) {
        console.log(error);
        return res.status(400).render("join", {pageTitle , errorMessage: error._message});
    }

}
export const getLogin = (req, res) => res.render("login", {pageTitle: "Login"});
export const postLogin = async(req, res) => {
    const pageTitle = "Login";
    const {username, password} = req.body;

    //check if account exists
    const user = await User.findOne({username, socialOnly: false});
    if(!user) {
        return res.status(400).render("login", {pageTitle, errorMessage : "An account with this username does not exist."});
    }

    //check kf password correct-
    //social login 분기 필요
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) {
        return res.status(400).render("login", {pageTitle, errorMessage : "Wrong password"});
    }
    
    //session 저장
    req.session.loggedIn = true;
    req.session.user = user;

    return res.redirect("/");
}
export const startGithubLogin = (req, res) => {
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config = {
        client_id:process.env.GH_CLIENT,
        allow_signup: false,
        scope: "read:user user:email"
    }
    //브라우저 테스트 후에..!
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    return res.redirect(finalUrl);
}
export const finishGithubLogin = async (req, res) => {
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id:process.env.GH_CLIENT,
        client_secret: process.env.GH_SECRET,
        code:req.query.code
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await (await fetch(finalUrl, {
        method:"POST",
        headers: {
            Accept: "application/json"
        }
    })).json();

    if("access_token" in tokenRequest) {
        // access api
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await(
            await fetch(`${apiUrl}/user`, {
                headers: {
                    Authorization: `token ${access_token}`,
                }
            })).json();
        console.log(userData); 
        const emailData = await(
            await fetch(`${apiUrl}/user/emails`, {
                headers: {
                    Authorization: `token ${access_token}`,
                }
            })).json();
        console.log(emailData);
        const emailObj = emailData.find((email) => email.primary === true && email.verified === true);
        if(!emailObj) {
            return res.redirect("/login");
        }
        let user = await User.findOne({email: emailObj.email});
        if(!user) {
             //create an account
             //username이 같은 것이 존재할 경우도 체크 필요
             user= await User.create({
                avatarUrl: userData.avatar_url,
                name:userData.name,
                username: userData.login,
                email:emailObj.email,
                password: "",
                socialOnly: true,
                location:userData.location,
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        return res.redirect("/");

    } else {
        return res.redirect("/login");
    }
}
export const logout = (req, res) => {
    req.session.destroy();
    return res.redirect("/");
}
export const see = (req, res) => res.send("See User");
export const edit = (req, res) => res.send("Edit User");
//export const remove = (req, res) => res.send("Remove User");//delete 예약어
