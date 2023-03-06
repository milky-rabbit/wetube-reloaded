import mongoose from "mongoose";

//2.export const
// export const formatHashtags = (hashtags) =>
//     hashtags.split(',').map(word=> word.startsWith('#')? word: `#${word}`)


//schema의 true 값은 자동으로 변경되어 저장. 
//uppercate:true(대문자로 변경되어 저장됨), trim:true(공백 제거되어 저장)
//string, number데이터 형 자동변환
const videoSchema = new mongoose.Schema({
    title: {type:String, required:true, trim:true, maxLength:80}, //title: {type:String}
    description: {type:String,  required:true, minLength: 20},
    createdAt: {type:Date, required:true, default: Date.now}, //Date.now() 는 즉시 실행시킴. video가 생성될 떄만 실행시켜야 함
    hashtags: [{type: String}],
    meta: {
        views: {type:Number, default:0, required:true},
        rating: {type:Number, default:0, required:true},
    },
});


//middleware는 무조건 model이 생성되기 전에 만들어져야 함
//----> intercepter
//1.
// videoSchema.pre('save', async function() {
//     //await doStuff();
//     //await doMoreStuff();
//     console.log("We are about to save: " , this);
//     this.hashtags = this.hashtags[0].split(',').map(word=> word.startsWith('#')? word: `#${word}`)
// });

//2.static
videoSchema.static('formatHashtags', function(hashtags) {
    return hashtags.split(',').map(word=> word.startsWith('#')? word: `#${word}`)
});

const Video = mongoose.model("Video", videoSchema);

export default Video;