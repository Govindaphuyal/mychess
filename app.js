const express=require("express");
const socket=require("socket.io");
const http=require("http");
const path=require("path")
const {Chess}=require("chess.js");
const app=express();
const server=http.createServer(app);
const io =socket(server);
const chess=new Chess();
let players={};
let currentPlayer="w";
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")))
app.get("/",(req,res)=>{
    res.render("index",{title:"Chess game"})
})
io.on("connection",function(socket){
    console.log("conn");
    if(!players.white){
        players.white=socket.id;
        socket.emit("PlayerRole","w");
    }
    else if(!players.black){
        players.black=socket.id;
        socket.emit("PlayerRole","b");
    }else{
        socket.emit("spectatorRole")
    }
    // socket.on("from broser to backend",function(){
    //     io.emit("connected from server")
    // })
    socket.on("disconnect",function(){
        if(socket.id==players.white){
          delete players.white;
        }else if(socket.id==players.black){
            delete players.black;
        }
    });
    socket.on("move",(move)=>{
        try{
          if(chess.turn()==="w"&&socket.id!==players.white)return;
          if(chess.turn()==="b"&&socket.id!==players.black)return;
             const result=chess.move(move);
          if(result){
            currentPlayer=chess.turn();
            io.emit("move",move);
            io.emit("boardState",chess.fen());
          }else{
              console.log('Invalid move:',move);
              socket.emit("invalid move",move)

          }
        }catch(err){
             console.log(err);
             socket.emit("Invalid move:",move)
        }
    })
})
server.listen(3000)


