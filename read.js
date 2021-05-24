const Discord = require('discord.js')
const client = new Discord.Client()

const axios = require('axios')
const got = require("got");
require('dotenv').config();

const mongo = require('./mongo');
const userSchema = require('./schemas/user-schema')

const config = require('./config.json')
const command = require('./command.js')

var arr ;

client.on('ready', async () => {
    console.log('Notification script is ready !');

    async function calls(){


        await mongo().then(async mongoose => {
            try{
                arr = await userSchema.find({})
            }finally{
                mongoose.connection.close()
            }
        })
 
        if (arr)
        {
        for(var i = 0; i < arr.length; i++){
            const moment = require('moment');
            var created = moment().format('DD/MM/YY');
            let res = await axios
                .get(
                    `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByDistrict?district_id=${arr[i].districtid}&date=${created}`,
                    {
                        headers: {
                            'User-Agent':
                            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:89.0) Gecko/20100101 Firefox/89.0',
                        },
                    },
                )
                .then(async (response) => {
                    var array = response.data;
                    var slot = false;

                    for(var j = 0; j < array.sessions.length; j++)
                    {
                        if(array.sessions[j].available_capacity>0)
                        {
                            if(array.sessions[j].min_age_limit <= arr[i].age){
                                slot=true;
                            }
                        }
                    }
                    

                    if(slot===true){

                        if(arr[i].mute > 0){
                            var user;
                            await mongo().then(async mongoose => {
                                try{
                                    arr[i].mute = arr[i].mute - 1;
                                    user = await userSchema.findOneAndUpdate({ discordid: arr[i].discordid },{ $set: { mute: arr[i].mute } })
                                }finally{
                                    mongoose.connection.close()
                                }
                            })
                        }else{

                            //dm
                            client.users.fetch(`${arr[i].discordid}`, false).then((user) => {
                                // user.send("Vaccine is available now!");
                                // user.send(" Visit https://www.cowin.gov.in/home to get more info.");
                                user.send({embed: {
                                    author: {
                                        name : 'Cobot',
                                    },
                                    color: 	3066993,
                                    description : `${user} , Vaccines are available now in your district !\n \nVisit https://www.cowin.gov.in/home to get more info.>`,
                                    timestamp: new Date(),
                                    footer: {
                                    icon_url: 'https://i.imgur.com/nnKLeNU.png',
                                    text: "©"
                                    }
                                }})
                            });

                        }
                        
                    }
                               
                }).catch((error) => {
                    console.log("Hi");
                    console.log(error);
                })
        }
        arr = []
        }
    }    

    var checkhours = 1, checkminutes = checkhours * 60, checkthe_interval =    checkminutes * 60 * 1000;
    setInterval(function() {
        calls()
    }, checkthe_interval);

})

client.login(process.env.TOKEN)
