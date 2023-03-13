import User from "../models/User";
import Video from "../models/Video";
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
    //User.exists()
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
            // set notification
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
                socialOnly: true,
                password: "",
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
export const getEdit = (req, res) => res.render("users/edit-profile", {pageTitle: "Edit Profile"});
export const postEdit = async (req, res) => {
    const {session: {user: {_id, avatarUrl}},
            body: {name, email, username, location},
            file} = req;
    //const id = req.session.user.id;
    //const {name, email, username, location} = req.body;
    
    console.log(file);
    //findByIdAndUpdate : 먼저 기존 데이터 반환후 업데이트
    //but! new:true 하면 업데이트 후의 데이터 반환
    const updateUser = await User.findByIdAndUpdate(_id, {
        avatarUrl : file? file.path : avatarUrl,
        name, 
        email, 
        username, 
        location}, {new:true});

     //session 저장
     //1. 
    //  req.session.user = {
    //     ...req.session.user,
    //     name,
    //     email,
    //     username,
    //     location,
    //  };
    //2. 
    req.session.user = updateUser;

    return res.redirect("/users/edit");
};

export const getChangePassword = (req, res) => {
    if(req.session.user.socialOnly) {
        return res.redirect("/");
    }
    return res.render("users/change-password", {pageTitle: "Change Password"});
}
export const postChangePassword = async (req, res) => {
    const {session: {user: {_id, password}},
            body: {oldPassword, newPassword, newPasswordConfirmation}} = req;
    const user = await User.findById(_id);
    const ok = await bcrypt.compare(oldPassword, user.password);
    if(!ok) {
        return res.status(400).render("users/change-password"
        , {pageTitle: "Change Password", errorMessage:"The current password is incorrect."});
    }

    if(newPassword !== newPasswordConfirmation) {
        return res.status(400).render("users/change-password"
        , {pageTitle: "Change Password", errorMessage:"The password does not match the confirmation."});
    }

    user.password = newPassword;
    await user.save();

    //send notification
    return res.redirect("/users/logout");
}

export const see = async (req, res) => {
    const {id} = req.params;
    const user = await User.findById(id).populate("videos");
    if(!user) {
        return res.status(404).render("404", {pageTItle: "User not found."})
    }
    //const videos = await Video.find({owner: user._id});
    return res.render("users/profile", {pageTitle: `${user.name}의 Profile`,
     user,
    });
}
//export const remove = (req, res) => res.send("Remove User");//delete 예약어
