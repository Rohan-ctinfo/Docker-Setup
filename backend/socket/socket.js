import { Server } from "socket.io";
import ChatModel from "../model/socket.model.js";
import { socketAuthGuard } from "../middlewares/guard.middleware.js";
import { CustomImagePath } from "../utils/misc.util.js";
import { ApiError, handleSocketError } from "../utils/api.util.js";

let onlineUsers = {};

export const initSocket = (server) => {
    const io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] },
    });

    console.log("Socket initialized");

    // Use the socket auth middleware
    io.use(socketAuthGuard);

    io.on("connection", async (socket) => {
        try {
            const user_id = socket.user.user_id;
            const sender_type = socket.user.role;
            let dbUser;
            if (socket.user.role == "ADMIN") {
                dbUser = await ChatModel.getAdminById(user_id);
            } else {
                dbUser = await ChatModel.getUserById(user_id);
            }

            socket.fullUser = dbUser;
            const sender = socket.fullUser;
            onlineUsers[user_id] = socket.id;

            console.log(`User connected: ${user_id} -> ${socket.id}`);

            // --- Send message event ---
            socket.on("send_message", async (data) => {
                try {
                    const { receiver_id, message, receiver_type, message_type, file } = data;
                    if (!receiver_id || !receiver_type) {
                        return handleSocketError(socket, new Error("Missing required fields"));
                    }

                    let otherUser;
                    if (receiver_type == "ADMIN") {
                        otherUser = await ChatModel.getAdminById(receiver_id);
                    } else {
                        otherUser = await ChatModel.getUserById(receiver_id);
                    }

                    if (!otherUser) {
                        return handleSocketError(socket, new Error("Other user not found"));
                    }

                    const messageId = await ChatModel.saveMessage({
                        sender_id: user_id,
                        receiver_id,
                        message,
                        sender_type,
                        file: file || null,
                        message_type,
                        receiver_type
                    });

                    const messageData = {
                        message_id: messageId,
                        sender_id: user_id,
                        receiver_id,
                        message,
                        sender_type,
                        receiver_type,
                        sender_name: sender.full_name,
                        sender_image: sender.profile_image,
                        sent_at: new Date().toISOString(),
                        file: file
                            ? file.split(",").map(f => CustomImagePath(f.trim()))
                            : [],
                        message_type,
                        created_at: new Date(),
                        receiver_name: otherUser.full_name,
                        receiver_image: otherUser.profile_image
                    };

                    // Send to receiver if online
                    if (onlineUsers[receiver_id]) {

                        io.to(onlineUsers[receiver_id]).emit("receive_message", messageData);


                        let otherChatList = await ChatModel.getChatList(receiver_id, receiver_type);
                        otherChatList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

                        io.to(onlineUsers[receiver_id]).emit("chat_list", otherChatList);


                    }

                    // Send back to sender as confirmation
                    socket.emit("receive_message", messageData);
                    let chatList = await ChatModel.getChatList(user_id, sender_type);
                    chatList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    socket.emit("chat_list", chatList);
                } catch (err) {
                    handleSocketError(socket, err);
                }
            });

            // --- Get previous chat ---
            socket.on("get_previous_chat", async ({ other_user_id }) => {
                try {
                    if (!other_user_id) {
                        return handleSocketError(socket, new Error("Missing required fields"));
                    }
                    const messages = await ChatModel.getChatBetweenUsers(user_id, other_user_id);

                    const read = await ChatModel.allChatMarkAsRead(user_id, sender_type, other_user_id);

                    socket.emit("previous_chat", messages);
                } catch (err) {
                    handleSocketError(socket, err);
                }
            });

            socket.on("get_chat_list", async () => {
                try {
                    let chatList = await ChatModel.getChatList(user_id, sender_type);
                    chatList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    socket.emit("chat_list", chatList);
                } catch (err) {
                    handleSocketError(socket, err);
                }
            });

            //Mark As Read 
            socket.on("mark_as_read", async ({ other_user_id }) => {
                try {
                    if (!other_user_id) {
                        return handleSocketError(socket, new Error("Missing required fields"));
                    }

                    const read = await ChatModel.allChatMarkAsRead(user_id, sender_type, other_user_id);

                    let chatList = await ChatModel.getChatList(user_id, sender_type);
                    chatList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    socket.emit("chat_list", chatList);

                } catch (err) {
                    handleSocketError(socket, err);
                }
            });

            // --- Disconnect ---
            socket.on("disconnect", () => {
                console.log(`User disconnected: ${user_id}`);
                delete onlineUsers[user_id];
            });

        } catch (err) {
            handleSocketError(socket, err);
        }
    });

    return io;
};
