import User from "../models/authModel.js";

async function chatTemplatePlaceholder(type, template, messageData, senderId) {
    const userDetails = await User.findById(senderId);
    const senderName = userDetails.username;

    const replaceTemplate = template.replace(/{%username%}/g, senderName);

    let replaceMessageTemplate;
    
    if(messageData) {
        replaceMessageTemplate = replace(/{%messageData%}/g, messageData);
    } else if(messageData == null) {
        replaceMessageTemplate = template;
    }

const chatTemplateData = [replaceTemplate, replaceMessageTemplate];

return chatTemplateData;    
}

export default chatTemplatePlaceholder;
