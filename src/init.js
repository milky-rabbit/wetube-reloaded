//require('dotenv').config();//제일 맨 처음에!!!!
import "dotenv/config"
import "./db"; //파일 import
import "./models/Video";//model을 미리 compile(create) 사용
import "./models/User";//model을 미리 compile(create) 사용
import app from "./server"

const PORT = 4000; 

/*
 * listener
 */
const handleListening = () => console.log(`✅ Server listening on port http://localhost:${PORT}✨`);
app.listen(PORT, handleListening);//Listening port, callback function
