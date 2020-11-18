//CORE LIBRARIES
const Discord = require("discord.js");
const client = new Discord.Client();
const prompts = require("prompts")
const fs = require('fs')
const http = require('https')

let user

var download = function(url, dest, cb) { // Needed to avoid ERR_STREAM_WRITE_AFTER_END
    var file = fs.createWriteStream(dest);
    http.get(url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        file.close(cb);
      });
    });
}

async function getToken() {
    let tokenprompt = await prompts({
        type: 'text',
        name: 'response',
        message: 'What is your bot token? This is used to request the Discord API. You can create an application and then a bot to get a bot token at https://discord.com/developers/applications.'
    })

    try {
        await client.login(tokenprompt.response);
    } catch(e) {
        console.log('\nError occured logging in with your token, please try again!\n')
        getToken()
        return;
    }

    console.log('\nLogged into ' + client.user.username + ' successfully!\n')
    getUser()
}

async function getUser() {
    let useridprompt = await prompts({
        type: 'text',
        name: 'response',
        message: `What is the ID of the user to grab data for? You can get this by right clicking on a user and pressing 'Copy ID', if Copy ID is not there, you need to turn on Developer Mode in Appearance Settings.`
    })

    try {
        user = await client.users.fetch(useridprompt.response)
    } catch (e) {
        console.log('\nCould not find that user, please check that the ID is correct and try again.\n')
        getUser()
        return
    }

    console.log(user.tag + ' found! Processing...\n')
    await process(user)
    console.log(`Done! Output can be found at /output/` + user.tag + '!')

    let anotheruserprompt = await prompts({
        type: 'confirm',
        name: 'response',
        message: `Do you want to fetch data for another user?`
    })
    
    if (anotheruserprompt.response == true) {
        console.log('\n')
        getUser()
        return
    }
}

async function process(user) {
    const outputfolder = './output/' + user.tag
    let jsonuser = new Object
    let cleanoutput = ''
    try {
        if (!fs.existsSync('./output')){
            fs.mkdirSync('./output');
        }  
    } catch (e) {
        console.log(`Can't find or make output folder, please create an 'output' folder in the directory with index.js`)
        return
    }
    try {
        if (!fs.existsSync(outputfolder)){
            fs.mkdirSync(outputfolder);
        }
    } catch (e) {
        console.log(`Can't make folder for user data, please create a folder in 'output' named the tag (user#9999) of the user you are requesting data for.`)
        return
    }
    try {
        url = user.avatarURL()
        let dest = (outputfolder + '/pfp.webp')
        download(url,dest)
    } catch(e) {
        console.log(`Failed to get profile picture.`)
    }
    try {
        url = user.defaultAvatarURL
        let dest = (outputfolder + '/defaultavatar.webp')
        download(url,dest)
    } catch(e) {
        console.log(`Failed to get default avatar.`)
    }
    try {
        jsonuser.username = user.username
        cleanoutput = cleanoutput + 'Username: ' + user.username + '\n'
    } catch(e) {
        console.log(`Failed to get username.`)
    }
    try {
        jsonuser.tag = user.tag
        cleanoutput = cleanoutput + 'Tag: ' + user.tag + '\n'
    } catch(e) {
        console.log(`Failed to get tag.`)
    }
    try {
        jsonuser.id = user.id
        cleanoutput = cleanoutput + 'ID: ' + user.id + '\n'
    } catch(e) {
        console.log(`Failed to get id.`)
    }
    try {
        jsonuser.bot = user.bot
        cleanoutput = cleanoutput + 'Bot: ' + user.bot + '\n'
    } catch(e) {
        console.log(`Failed to get bot.`)
    }
    try {
        jsonuser.system = user.system
        cleanoutput = cleanoutput + 'System: ' + user.system + '\n'
    } catch(e) {
        console.log(`Failed to get system.`)
    }
    try {
        jsonuser.createdAt = user.createdAt
        cleanoutput = cleanoutput + 'Created At: ' + user.createdAt + '\n'
    } catch(e) {
        console.log(`Failed to get createdAt.`)
    }
    try {
        jsonuser.createdTimestamp = user.createdTimestamp
        cleanoutput = cleanoutput + 'Created Timestamp: ' + user.createdTimestamp + '\n'
    } catch(e) {
        console.log(`Failed to get createdTimestamp.`)
    }
    try {
        if (user.flags == null) {
            jsonuser.flags = null
            jsonuser.flagsbits = null
            cleanoutput = cleanoutput + 'Flags: None\nFlags Bits: None\n'
        } else {
            jsonuser.flags = user.flags.toArray()
            jsonuser.flagsbits = user.flags
            cleanoutput = cleanoutput + 'Flags: ' + user.flags.toArray() + '\nFlags Bits: ' + user.flags + '\n'
        }
    } catch(e) {
        console.log(`Failed to get flags.`)
    }
    try {
        jsonuser.lastMessage = user.lastMessage
        cleanoutput = cleanoutput + 'Last Message: ' + user.lastMessage + '\n'
    } catch(e) {
        console.log(`Failed to get lastMessage.`)
    }
    try {
        jsonuser.lastMessageChannelID = user.lastMessageChannelID
        cleanoutput = cleanoutput + 'Last Message Channel ID: ' + user.lastMessageChannelID + '\n'
    } catch(e) {
        console.log(`Failed to get lastMessageChannelID.`)
    }
    try {
        jsonuser.lastMessageID = user.lastMessageID
        cleanoutput = cleanoutput + 'Last Message ID: ' + user.lastMessageID + '\n'
    } catch(e) {
        console.log(`Failed to get lastMessageID.`)
    }
    try {
        jsonuser.locale = user.locale
        cleanoutput = cleanoutput + 'Locale: ' + user.locale + '\n'
    } catch(e) {
        console.log(`Failed to get locale.`)
    }
    try {
        jsonuser.discriminator = user.discriminator
        cleanoutput = cleanoutput + 'Discriminator: ' + user.discriminator
    } catch(e) {
        console.log(`Failed to get discriminator.`)
    }
    try {
        fs.writeFileSync((outputfolder + '/user.json'), JSON.stringify(jsonuser, null, " "))
    } catch (e) {
        console.log(`Error outputting to JSON file.`)
    }
    try {
        fs.writeFileSync((outputfolder + '/user.txt'), cleanoutput, 'utf-8')
    } catch (e) {
        console.log(`Error outputting to txt file.`)
    }
}

getToken()