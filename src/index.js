const express=require('express')
const http=require('http')
const socketio=require('socket.io')
const path=require('path')
const app=express()
const {generateMessage}= require('./utils/messages')
//This below code is by default done by express.
//But since we had to pass the server on io=societio(server) we created it by ourselves
const server=http.createServer(app)
app.use(express.json())
const Filter=require('bad-words') //Library to see if there are any bad words
const io=socketio(server)


const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')


const publicDirectory=path.join(__dirname,'../public')
app.use(express.static(publicDirectory))

io.on('connection',(socket)=>{
    socket.on('join',(options,callback)=>{
        const {error,user}=addUser({id:socket.id,...options})
        if(error){
            return callback(error)
        }
        //socket.emit,io.emit,socket.broadcast.emit-> for all users
        //io.to.emitm socket.broadcast.to.emit-> for room users
        socket.join(user.room) //to connect to specific room
        socket.emit('message',generateMessage('Welcome!'))
        //broadcast sends the message to everyone except the one whose socket it is
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined.`))

        io.to(user.room).emit('roomData',{
            room:user.room,
            users:getUsersInRoom(user.room)
        })


        callback()
    })
    socket.on('sendMessage',(message,callback)=>{
        const user=getUser(socket.id)
        const filter=new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed!')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        //This is called acknowledgement
        //which is basically a callback function that runs after the message is received by server
        // and vice versa
        callback()
    })

    //connect and disconnect are build-in socket event listeners
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage(`${user.username} has left.`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }

    })

    socket.on('sendLocation',(location,callback)=>{
        const user=getUser(socket.id)
        console.log(user.username)
        io.to(user.room).emit('locationMessage',generateMessage(user.username,location))
        callback()
    })

})
server.listen(process.env.PORT,()=>{
    console.log("Server is running at port "+process.env.PORT)
})








//Previous codes
// let count=0
// io.on('connection',(socket)=>{
//     //socket contains information about the new connection to a specific client
//     //Trasfering event to server- This called emiting an event
//     socket.emit('countUpdated',count)
//     socket.on('increment',()=>{
//         count++
//         io.emit('countUpdated',count) //This will emit the event to all the socket clients
//         // socket.emit('countUpdated',count)  //this emits the event only to a particular client
//     })

// })