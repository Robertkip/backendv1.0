let users = []; //


const EditData = (data, id, call) => {
    const newData = data.map(item =>
        item.id === id ? { ...item, call } : item
    );
    return newData;
}


const SocketServer = (socket) => {

    socket.on('joinUser', user => {
     users.push({   
        id: user._id,
        socketId: socket.id,
        connections: user.connections,
    });
});
    socket.on('disconnect', () => {
        const data = users.find(user => user.socketId === socket.id);
        if (data) {
            const clients = users.filter(user => data.connections.find(item => item.id === user.id));
   
        
        if(clients.length > 0){
            clients.forEach(client => {
                socket.to(`${client.socketId}`).emit('CheckUserOnline', data.id);
            }
            )
        }
    }
        users = users.filter(user => user.socketId !== socket.id);
    })

    //Notifications Socket
    socket.on('createNotify', msg => {
      const client = users.find(user =>  msg.recipients.includes(user.id));
      client && socket.to(`${client.socketId}`).emit('createNotifyToClient', msg);
    });

    socket.on('removeNotify', msg => {
      const client = users.find(user =>  msg.recipients.includes(user.id));
      client && socket.to(`${client.socketId}`).emit('removeNotifyToClient', msg);
    });

    //Message Socket
    socket.on('addMessage', msg => {
      const user = users.find(user =>  user.id === msg.receiverId);
      user && socket.to(`${user.socketId}`).emit('addMessageToClient', msg);
    });

    socket.on('removeMessage', msg => {
      const user = users.find(user =>  user.id === msg.receiverId);
      user && socket.to(`${user.socketId}`).emit('removeMessageToClient', msg);
    });

    //Check User Online / Offline
    socket.on('checkUserOnline', data => {
        const connections = users.filter(user => 
            data.connections.find(item => item.id === user.id)
        );
        socket.emit('checkUserOnlineToMe', connections);

        const clients = users.filter(user => 
            data.connections.find(item => item.id === user.id)
        );

        if(clients.length > 0){
            clients.forEach(client => {
                socket.to(`${client.socketId}`).emit('CheckUserOnlineToClient', data.id);
            }
            )
        }
    }) 
}

export default SocketServer;
