const express =require('express')
const socketio=require('socket.io');
const http=require('http')
const cors = require('cors');
const PORT=process.env.PORT || 5000

const {adduser,removeUser,getUsers,getUsersInRoom} = require('./user')

const router=require('./router')

const app=express();//this we not doing
const server=http.createServer(app);

const io=socketio(server)
app.use(cors())
app.use(router)

io.on('connection',(socket)=>{
    // console.log('We have a new user');
    
    socket.on('join',({name,room},callback)=>{
        const { error , user } =adduser({id: socket.id,name,room});
        if(error) return callback(error)

        socket.emit('message',{user:'admin',text:`${user.name},welcome to the ${user.room}`})
        socket.broadcast.to(user.room).emit('message',{user:'admin',text:`${user.name}, has joined`})

        socket.join(user.room)
        callback();
        // console.log(name,room)
        // const err=true;
        // if(err)
        // {                
        //     callback({error:'error'})
        // }
       
    })
    //user generated messages 
    socket.on('sendMessage',(message,callback)=>{
        const user =getUsers(socket.id)
        console.log(user ,'me in room of user')

        io.to(user.room).emit('message',{user:user.name,text:message})
        callback();
    })
    socket.on('disconnect', ()=>{
        console.log('user has Left')
    })

})

server.listen(PORT,()=>console.log(`server running on ${PORT}`))