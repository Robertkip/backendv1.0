import fs from 'fs';
import path from 'path';

function deleteDirectory(directoryPath){
    if(fs.existsSync(directoryPath)){
      const files = fs.readdirSync(directoryPath);

      for(const file of files){
        const filePath = path.join(directoryPath, file);
        if (fs.lstatSync(filePath).isDirectory()) {
            deleteDirectory(filePath);
          } else {
            fs.unlinkSync(filePath);
          }
      }

    fs.rmdirSync(directoryPath);
    }
}

export default deleteDirectory;
