//import Video, {formatHashtags} from "../models/Video"
import Video from "../models/Video"


const fakeUser ={
    username:"Earl",
    loggedIn : false
}

// fake database
// let videos = [
//     {
//         title:"First video",
//         rating: 5,
//         comments:2,
//         createdAt : "2 minutes ago",
//         views: 59,
//         id: 1
//     },
//     {
//         title:"Second video",
//         rating: 5,
//         comments:2,
//         createdAt : "2 minutes ago",
//         views: 1,
//         id: 2
//     },
//     {
//         title:"Third video",
//         rating: 5,
//         comments:2,
//         createdAt : "2 minutes ago",
//         views: 59,
//         id: 3
//     }
// ];

export const  home = async(req, res) => {  
    //database 연결 방식
    //1. callback
    //2. promise

    //1. callback
    //{} serch terms, 비어있으면 모든 형식을 검색
    // Video.find({}, (error, videos) => {
    //      res.render("home", {pageTitle:"Home", fakeUser, videos});
    //     //return res.render("home", {pageTitle:"Home", fakeUser, videos});
    // });

    //2. promise
    try {
        const videos = await Video.find({}).sort({createdAt:"asc"});
        return res.render("home", {pageTitle:"Home", fakeUser, videos});
        //return res.render("home", {pageTitle:"Home", fakeUser, videos});
    } catch (error){
        return res.render("server-error", {error});
    }
}
export const watch = async(req, res) => {
    //findById() : Id, findOne() : 어떠한 조건
    console.log(`Watch Video #${req.params.id}`);
    const {id} = req.params;
    const video = await Video.findById(id);
    //const video = videos[id-1];
    //return res.render("watch", {pageTitle:`Watching: ${video.title}` , fakeUser, video});
    
    if(!video) {
        return res.render("404", {pageTitle: "Video not found.", fakeUser});
    } 
    return res.render("watch", {pageTitle: video.title , fakeUser, video});
 }
export const getEdit = async(req, res) => {
    console.log(`Edit Video #${req.params.id}`);
    const {id} = req.params;
    const video = await Video.findById(id);
    //const video = videos[id-1];
    //return res.render("edit", {pageTitle:`Editing: ${video.title}`, fakeUser, video});
   
    if(!video) {
        return res.status(404).render("404", {pageTitle: "Video not found.", fakeUser});
    } 
    return res.render("edit", {pageTitle: `Edit: ${video.title}` , fakeUser, video});
}
export const postEdit = async(req, res) => {
    console.log(req.body);
    const {id} = req.params;
    const {title, description, hashtags} = req.body;
    const video = await Video.exists({_id:id});
    //videos[id -1].title = title;
    if(!video) {
        return res.render("404", {pageTitle: "Video not found.", fakeUser});
    } 
    await Video.findByIdAndUpdate(id, {
        title,
        description,
        //hashtags : formatHashtags(hashtags)
        hashtags: Video.formatHashtags(hashtags)
    });
    return res.redirect(`/videos/${id}`);
}
export const getUpload = (req, res) => {
    return res.render("upload", {pageTitle:`Upload Video` , fakeUser});
}
export const postUpload = async(req, res) => {
    // here we will add a video to the videos array.
    const {title, description, hashtags} = req.body;
    // const newVideo = {
    //     title,
    //     rating: 0,
    //     comments:0,
    //     createdAt : "just now",
    //     views: 0,
    //     id: videos.length + 1
    // };
    // videos.push(newVideo);

    //1. 
    // const video = new Video ({//mogoose 자동 datatype validation check
    //     title,
    //     description,
    //     createdAt : Date.now(),
    //     hashtags : hashtags.split(',').map(word=>`#${word}`),
    //     meta: {
    //         views: 0,
    //         rating: 0
    //     },
    // });
    // //mongoose 가 자동으로 _id 부여

    // const dbVideo = await video.save();
    // console.log(dbVideo);


    //2.
    try {
        await Video.create({//mogoose 자동 datatype validation check
            title,
            description,
            //createdAt : Date.now(),  model default 값 설정
            //hashtags : formatHashtags(hashtags)
            hashtags: Video.formatHashtags(hashtags)
            //model default 값 설정
            // meta: {
            //     views: 0,
            //     rating: 0
            // },
        });
        return res.redirect("/");
    } catch(error) {
        console.log(error);
        return res.status(400).render("upload", {pageTitle:`Upload Video` , fakeUser, errorMessage: error._message});
    }
}
export const deleteVideo = async(req, res) => {
    const {id} = req.params;
    //delete video:
    //findOneAndDelete :  이걸로 사용하도록 
    //findOneAndRemove
    await Video.findByIdAndDelete(id); 
    return res.redirect("/");
}
export const search = async(req, res) => {
    const {keyword} = req.query;
    console.log("should search for ", keyword);
    let videos = [];
    if(keyword) {
         videos = await Video.find({
            title: {
                $regex: new RegExp(keyword, "i"),
                //$regex: new RegExp(`^$ {keyword}`, "i"),
            }
         });
    }
    return res.render("search",  {pageTitle:`Search`, fakeUser, videos});
}
 