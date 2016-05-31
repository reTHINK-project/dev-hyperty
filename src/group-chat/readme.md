#Group-Chat hyperty 

##1. Group-Chat hyperty functionality description.
The Group-Chat hyperty allows to exchange chat messages amongst defined group of users. This hyperty has been developed as a App Hyperty. It means it is executed in the same sandbox as the main web application which uses it.

##1.1 Data-schema used.
It uses the Communication Data schema so it is compatible with any hyperty using the same data schema.

##2. Exposed API. 

###create
Create a new chat group

####Syntax
    create (name, participants)

####Params
*name*

 Chat name

*participants*

 List of hyperties urls.

####Returned value
Returns a [group chat](#2.1-group-chat-api) instance

####How to use it.
    groupchatHy.create('name', [<hyperty-runtime-url>,...])
        .then((groupChat)=>{
            console.log(groupChat)
        })
        
###onInvite
Call a callback function when receives a group chat invitation

####Syntax
    onInvite (callback)

####Params
*callback*

 Callback function to call when a request invitation is received. A [group chat](#2.1-group-chat-object) instance is passed into this function.

####How to use it.
    groupChatHy.onInvite((groupChat)=>{
        console.log(groupChat)
    })

### 2.1 Group Chat object

####Exposed API

#####sendMessage
Send a message

######Syntax
    sendMessage(message, [distance])
    
######Params
*message*
 Message text

*distance*
 Optional parameter. If you set it, the message will only reach participants inside this radio.

######Returned value
Returns an object that represents the message

######How to use it.
    groupChat.sendMessage('hi')
        .then((message)=>{
            console.log(message)
        })

#####onMessage
Receive a new message

######Syntax
    onMessage(callback)

######Params
*callback*
 Callback function to call when a new message is received

######How to use it.
    groupChat.onMessage((message)=>{
        console.log(message)
    })
    
##3. Framework improvement proposals derived from Hyperty Group-Chat development.
When the Registry is checked to obtain the hyperties registered by a user only the last one was provided. So it was necessary to ask for to get the full list of hyperties registered for a user. (Maybe this may be moved to the Dev-Participate My City part).

