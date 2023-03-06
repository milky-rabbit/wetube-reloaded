import mongoose from "mongoose"

mongoose.set('strictQuery', true);
mongoose.connect(process.env.DB_URL, {
    useNewUrlParser:true, 
    useUnifiedTopology: true,
});


const db = mongoose.connection;

const handleOpen= () => console.log("✅ Connected to DB");
const handlsError=  (error) => console.log("❌ DB Error", error);

db.on("error", handlsError);//발생할 떄마다
db.once("open", handleOpen);//한 번만