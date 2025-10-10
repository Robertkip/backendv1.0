import path from "path";

import deleteDirectory from "./DeleteDirectory.js";

function getSubfolderPath(roomCode) {
    const subfolderPath = path.join(__dirname, `../uploads/${roomCode}`);
    return subfolderPath;
  }

  function deleteScheduler(data) {
    const subfolderPath = getSubfolderPath(data.ROOM_CODE);
  
    const twoHours = 2 * 60 * 60 * 1000; 
  
    setTimeout(() => {
      deleteDirectory(subfolderPath);
    }, twoHours);
  }

export default deleteScheduler;
