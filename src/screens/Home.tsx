import { useEffect, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  query,
  where,
  addDoc,
  collection,
  orderBy,
  Timestamp,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import ChatList from "../components/ChatList";
import MessageItem from "../components/MessageItem";

interface Job {
  id: number;
  job_title: string;
  company_id: string;
}

export interface Chat {
  id: string;
  job_id: string;
  company_id: string;
  jobfinder_id: string;
  company_name: string;
  jobfinder_name: string;
  company_logo: string;
  jobfinder_profile_image: string;
  created_at: Timestamp;
  last_message: string;
  last_message_timestamp: Timestamp;
}

export interface User {
  id: string;
  m_basicinfos: {
    name: string;
    profile_path: string;
  };
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: number;
  content: string;
  timestamp: Timestamp;

}
// company id
const currentUser = {
  id: 1,
};
const parsedUser = {
  id : 21,
}

const parsedId = parsedUser.id

const Home = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [showJobForm, setShowJobForm] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState<number | 1>(1);

  // fetch chat room
  useEffect(() => {
    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("company_id", "==", parsedId), //company id
      orderBy("last_message_timestamp", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedChats: Chat[] = [];
        querySnapshot.forEach((doc) => {
          fetchedChats.push({ id: doc.id, ...doc.data() } as Chat);
        });
        setChats(fetchedChats);
      },
      (error) => {
        console.error("Error fetching chats:", error);
        setError("Failed to fetch chats. Please try again.");
      }
    );

    return () => unsubscribe();
  }, []);
  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
    const unsubscribe = fetchMessages(chat.id);

    // Clean up the listener when the component unmounts or when a new chat is selected
    return () => unsubscribe();
  };

  //fetch Messages
  const fetchMessages = (chatId: string) => {
    setError(null);
    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("chat_id", "==", chatId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const fetchedMessages: Message[] = [];
        querySnapshot.forEach((doc) => {
          fetchedMessages.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(fetchedMessages);
      },
      (error) => {
        console.error("Error fetching messages:", error);
        setError("Failed to fetch messages. Please try again.");
      }
    );

    // Return the unsubscribe function
    return unsubscribe;
  };

  //send message
  // Modify the handleSendMessage function:
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    setError(null);

    const messageData = {
      chat_id: selectedChat.id,
      sender_id: 21,
      content: newMessage.trim(),
      timestamp: Timestamp.now(),
      read : false
    };

    try {
      await addDoc(collection(db, "messages"), messageData);
      await setDoc(
        doc(db, "chats", selectedChat.id),
        {
          last_message: newMessage.trim(),
          last_message_timestamp: Timestamp.now(),
        },
        { merge: true }
      );
      setNewMessage("");
      // Remove this line as it's no longer needed:
      // fetchMessages(selectedChat.id);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
    }
  };

  //create job
  const createJobMutation = useMutation({
    mutationFn: async (jobData: { title: string }) => {
      const response = await fetch(
        "https://api.japanjob.exbrainedu.com/v1/job",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_title: jobData.title,
            company_id: 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // If the response is not OK, throw an error with the server message
        throw new Error(data.message || "Failed to create job");
      }

      return data;
    },
    onError: (error: Error) => {
      console.error("Error creating job:", error);
      setError(error.message || "Failed to create job. Please try again.");
    },
    onSuccess: () => {
      console.log("Job created successfully");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setShowJobForm(false);
      setNewJobTitle("");
    },
  });
  const handleCreateJob = () => {
    if (newJobTitle.trim()) {
      createJobMutation.mutate({ title: newJobTitle });
    }
  };

  //end create job

  //post match
  const { mutate: postMatchMutation } = useMutation({
    mutationFn: async ({
      jobId,
      userId,
      companyId,
    }: {
      jobId: number;
      userId: number;
      companyId: number;
    }) => {
      console.log(jobId+"jobId");
      console.log(userId+"userId");
      console.log(companyId+"companyId")
      
      
      const response = await fetch(
        `https://api.japanjob.exbrainedu.com/v1/job/match`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobs_id: jobId,
            user_id: userId,
            company_id: companyId,
          }),
        }
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create match");
      }

      return data;
    },
    onError: (error: Error) => {
      console.error("Error creating match:", error);
      setError(error.message || "Failed to create match. Please try again.");
    },
    onSuccess: () => {
      console.log("Match created successfully");
    },
  });

  const handlePostMatch = (userId: number) => {
    if (selectedJobId && currentUser.id) {
      postMatchMutation({
        jobId: selectedJobId,
        userId: userId,
        companyId: 1,
      });
    }
  };

  //fetch jobs
  // const { data: jobs, error: jobsError } = useQuery({
  //   queryKey: ["jobs"],
  //   queryFn: async () => {
  //     const response = await fetch(
  //       `https://api.japanjob.exbrainedu.com/v1/job`
  //     );
  //     if (!response.ok) {
  //       throw new Error("Failed to fetch jobs");
  //     }
  //     return response.json();
  //   },
  // });

  // console.log(jobs);

  //fetch users
  const {
    data: users,

    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await fetch(
        `https://api.japanjob.exbrainedu.com/v1/user/all`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
  });

  if (error || usersError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500 text-xl">
          {error ||
       
            usersError?.message ||
            "An error occurred. Please try again."}
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/4 bg-white p-4 border-r">
        <h2 className="text-2xl font-bold mb-4">Chats</h2>
        <ChatList chats={chats} onSelectChat={handleChatSelect} />
        <button
          onClick={() => setShowJobForm(true)}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create Job
        </button>
        {/* <div>
          <h1 className="text-2xl font-bold mb-4">Jobs</h1>
          <div className="flex overflow-x-auto pb-2">
            {jobs &&
              jobs.data.map((job: Job) => (
                <div
                  key={job.id}
                  className={`flex-shrink-0 px-4 py-3 bg-gray-100 border-r-2 last:border-r-0 whitespace-nowrap cursor-pointer ${
                    selectedJobId === job.id ? "text-blue-500" : ""
                  }`}
                  onClick={() => {
                    console.log("Selected job ID:", job.id);
                    setSelectedJobId(job.id);
                  }}
                >
                  {job.job_title}
                </div>
              ))}
          </div>
        </div> */}

        <div>
          <h1 className="text-2xl font-bold mb-4">Users</h1>
          {users &&
            users.data.map((user: User) =>
              user.m_basicinfos ? (
                <div
                  className="flex relative items-center px-5 py-5 bg-gray-100 border-b-2 gap-2"
                  key={user.id}
                >
                  <img
                    src={
                      "https://api.japanjob.exbrainedu.com/v1/file/photo/" +
                      user.m_basicinfos.profile_path
                    }
                    alt="profile"
                    className="w-10 h-10 rounded-full"
                  />
                  <p>{user.m_basicinfos.profile_path}</p>
                  <p>{user.m_basicinfos.name}</p>
                  <button
                    onClick={() => handlePostMatch(Number(user.id))}
                    className="bg-blue-500 absolute right-4 text-white px-4 py-2 rounded"
                  >
                    match
                  </button>
                </div>
              ) : (
                <div></div>
              )
            )}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            <div className="bg-white p-4 border-b">
              <h3 className="text-xl font-semibold">
                Chat for Job: {selectedChat.job_id}
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={message}
                  currentUser={currentUser}
                />
              ))}
            </div>
            <div className="bg-white p-4 border-t">
              <div className="flex">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 border rounded-l px-4 py-2"
                  placeholder="Type a message..."
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Select a chat to start messaging</p>
          </div>
        )}
      </div>
      {showJobForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Create New Job</h3>
            <input
              type="text"
              value={newJobTitle}
              onChange={(e) => setNewJobTitle(e.target.value)}
              className="w-full border rounded px-4 py-2 mb-4"
              placeholder="Enter job title"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowJobForm(false)}
                className="mr-2 px-4 py-2 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateJob}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                disabled={createJobMutation.isPending}
              >
                {createJobMutation.isPending ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
