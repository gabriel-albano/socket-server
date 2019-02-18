# socketio-chat
A multi-room example using nodejs and socket.io

Each client will connect to a 3 Rooms: General, Group and Individual

General is a receive only room, to get messages broadcasted to all clients
Group is a read & write room to communicate with clients is the same group
Individual is a read & write prive channel for clients to communicate to each other

Based on https://github.com/mmukhin/psitsmike_example_2
