//Elememts
const $form=document.querySelector('form')
const $input=document.querySelector('input')
const $location_btn=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//Templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

// Options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true}) //QS-Query String
const autoscroll=()=>{
    //New message element
    const $newMessage=$messages.lastElementChild
    //Height of the new Message
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin
    //Visible Height
    const visibleHeight=$messages.offsetHeight
    //Height of messages container
    const containerHeight=$messages.scrollHeight
    //How far have I scrolled?
    const scrollOffet=$messages.scrollTop+visibleHeight
    if(containerHeight-newMessageHeight<=scrollOffet){
        $messages.scrollTop=$messages.scrollHeight
    }

}

//Socket used by client that is used by server to know the client
const socket=io()

socket.on('message',(message)=>{
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})
socket.on('locationMessage',(location)=>{
    const html=Mustache.render(locationTemplate,{
        username:location.username,
        location:location.text,
        createdAt:moment(location.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html
})



$form.addEventListener('submit',(event)=>{
    event.preventDefault()
    $form.setAttribute('disabled','disabled')
    const inpValue=$input.value
    if(!inpValue){
        return alert('Please Enter a message on the field')
    }
    socket.emit('sendMessage',inpValue,(error)=>{
        $form.removeAttribute('disabled')
        $input.value=''
        $input.focus()
        if(error){
            return console.log(error)
        }
        console.log("Message Delivred")
    })
})

$location_btn.addEventListener('click',()=>{
    $location_btn.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',`https://google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`,()=>{
            console.log('Location Delivred')
            $location_btn.removeAttribute('disabled')
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})




//Previous Code
//Receiving server event
//Must match with the emit method on the server side
// socket.on('countUpdated',(count)=>{
//     console.log('The count has been updated')
//     console.log('The value of count is '+count)
// })

// const button=document.querySelector('#increment')
// button.addEventListener('click',()=>{
//     socket.emit('increment')
// })