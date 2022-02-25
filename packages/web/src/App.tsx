import { SocketContext, socket } from "./context/socket";
import { Room } from "./room/room";

const App = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 top-0">
      <SocketContext.Provider value={socket}>
        <Room />
      </SocketContext.Provider>
    </div>
  )
};

export default App;
