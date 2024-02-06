import { useDeepCompareEffect, useFocusWithin, useHover, useInterval, useMount, useSetState, useSize } from 'ahooks';
import { Button, Input } from 'antd';
import io from 'socket.io-client';
import { useEffect, useRef, useState } from 'react';
import service from './http';
import Editor from './Editor';

const socket = io(
  import.meta.env.MODE === 'development'
    ? 'http://localhost:3000'
    : 'https://ndzy-service-89589-7-1307521321.sh.run.tcloudbase.com',
);

const App = () => {
  const messagesEndRef = useRef<any>(null);
  const chatContainerRef = useRef<any>(null);
  const chatMainRef = useRef(null);
  const isHovering = useHover(chatMainRef);
  const size = useSize(chatMainRef);
  const [room, setRoom] = useState('');
  const [msg, setMsg] = useState(undefined);
  const [t, seT] = useState<any>(undefined);
  const [s, setS] = useSetState<{ room: string; user: any; rooms: any[]; members: any[]; messages: any[] }>({
    room: '',
    user: undefined,
    rooms: [],
    members: [],
    messages: [],
  });

  const loginInfo = () => {
    service({ url: '/users/loginInfo', method: 'GET' }).then((res: any) => {
      setS({ user: res.data });
    });
  };

  const getAllRooms = () => {
    service({ url: '/chats/rooms', method: 'GET' }).then((res: any) => {
      setS({ rooms: res.data });
    });
  };

  const getAllMessages = (params: { name?: string }) => {
    if (!params?.name) return;
    service({ url: '/chats', method: 'GET', params }).then((res: any) => {
      setS({ messages: res.data });
    });
  };

  const getMembers = (params: { name?: string }) => {
    if (!params?.name) return;
    service({ url: '/chats/room/members', method: 'GET', params }).then((res: any) => {
      setS({ members: res.data });
    });
  };

  useMount(() => {
    loginInfo();
    getAllRooms();
  });

  useFocusWithin(() => document.getElementById('chat-input'), {
    onFocus: () => {
      seT(1500);
    },
    onBlur: () => {
      seT(undefined);
    },
  });

  useInterval(() => {
    getAllMessages({ name: s.room });
    getMembers({ name: s.room });
  }, t);

  useEffect(() => {
    if (isHovering) {
      seT(1500);
    } else {
      seT(undefined);
    }
  }, [isHovering]);

  useDeepCompareEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [s.messages]);

  return !s.room ? (
    <>
      <div className="create-room">
        <h2>创建新聊天室</h2>

        <Input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="输入聊天室名称" />

        <Button
          onClick={() => {
            if (s.user && room) {
              socket.emit('createRoom', { roomName: room, userId: s.user.id });
              getAllRooms();
              setRoom('');
            }
          }}
        >
          创建聊天室
        </Button>
      </div>
      <div className="room-selection">
        <h2>选择聊天室</h2>
        <div className="room-list">
          {s.rooms.map((item) => {
            return (
              <button
                key={item.id}
                className="room-button"
                onClick={() => {
                  if (!s.user) return;
                  socket.emit('joinRoom', { roomName: item.name, userId: s.user.id });
                  setS({ room: item.name, messages: [], members: [] });
                  getAllMessages({ name: item.name });
                  getMembers({ name: item.name });
                }}
              >
                {item.name}
              </button>
            );
          })}
        </div>
      </div>
    </>
  ) : (
    <div className="chat-container" ref={chatContainerRef}>
      {Number(size?.width) > 800 && (
        <div className="user-list">
          {s.members.map((item) => (
            <div key={item.id} className="user">
              {item.name}
            </div>
          ))}
        </div>
      )}

      <div className="chat-main" ref={chatMainRef}>
        <div className="chat-header">
          <h3>{s.room}</h3>
          <Button
            onClick={() => {
              setS({ room: '' });
              seT(undefined);
            }}
          >
            返回
          </Button>
        </div>
        <div className="message-list">
          {s.messages.map((item) => {
            return (
              <div
                key={item.id}
                className="chat-messages"
                style={{ textAlign: s.user.id === item.sender.id ? 'right' : 'left' }}
              >
                <div className="message">
                  <div>
                    <span className="meta">
                      {item.sender.name} <span className="timestamp">{item.createdAt}</span>
                    </span>
                  </div>
                  <div className="text" style={{ padding: '0 8px' }} dangerouslySetInnerHTML={{ __html: item.text }} />
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <Editor value={msg} onChange={(v: any) => setMsg(v)} />
          <Button
            style={{ marginLeft: 16 }}
            onClick={() => {
              if (!msg) return;
              if (!s.room) return;
              if (!s.user) return;
              socket.emit('sendMessageToRoom', {
                roomName: s.room,
                message: msg,
                userId: s.user.id,
              });
              getAllMessages({ name: s.room });
              setMsg(undefined);
            }}
            type="primary"
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};

export default App;
