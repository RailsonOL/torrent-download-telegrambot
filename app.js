const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')
const axios = require('axios')
const Extra = require('telegraf/extra')

const API_TOKEN = process.env.BOT_TOKEN || '1287259512:AAEyQsPaBs0oa_wvDgiJ4V-cbz1hikgATfE'
const siteApi = process.env.SITE_URL || 'https://torrentdownloadapi.herokuapp.com'
//const PORT = process.env.PORT
//const URL = process.env.URL

const bot = new Telegraf(API_TOKEN)

const helpMsg =   `Você pode usar os comando:
/p - Pesquisar alguma coisa
/baixar - Download por link (/p mostra os links)
/help - Exibe esses comando novamente
/about - Mostra um pouco sobre mim`

const aboutMsg = 'Não tem muito aqui, um bot simples, feito por RaiOL com intenção de aprendizado'

bot.command('help', ctx => {
  ctx.reply(helpMsg);
});

bot.command('about', ctx => {
  ctx.reply(aboutMsg);
});

bot.command('start', ctx => {
  var m = `Oi 😸, Seja bem vindo!
  Você pode usar os comando:
  /p - Pesquisar alguma coisa
  /baixar - Download por link (/p mostra os links)
  /help - Exibe esses comando novamente
  /about - Mostra um pouco sobre mim`
  ctx.reply(m)
})

bot.command('stop', ctx => {
  var m = '🙀! Mas já?';
  ctx.reply(m);
})

//---------------------------------------------------
bot.command('p', async(ctx) => {
  
  try {
    let pes = ctx.update.message.text.replace('/p ', '').replace('/p', '')
    console.log(pes)
    if(pes === ''){
      ctx.reply('❌ - Está vazio!\nuse por exemplo: /p Nome do Filme')
    }else{
      const { data } = await axios.get(siteApi + '/s/?pesquisar=' + pes)
      if (data.filme && data.filme.length) {
        for(var i in data.filme){
  
          ctx.replyWithPhoto(
            data.filme[i].img,
            {'reply_markup':{'inline_keyboard':[[{ text: 'Baixar', switch_inline_query_current_chat: `/baixar ${data.filme[i].link}`, hide: false }]]}, caption: `Titulo: ${data.filme[i].titulo}\n\nInformações: ${data.filme[i].informacoes}\nLink: (${data.filme[i].link})\n\nApós clicar em baixar, envie a mensagem que receber`}
          ).catch(function(e) {
            //console.log(e.description,e.on.method)
          })
        }
      }else{
        ctx.reply('Não achei nada 😿\ntente usar outras palavras')
      }
    }

  } catch (e) { 
    ctx.reply('❌ - Algo deu errado, não consigo pesquisar 😿')
    console.log(`Erro no comando /p: ${e.message}`) 
  }

})

//-------------------------------------------------------

bot.hears(/^@FilmesTorrent_bot \/baixar|\/baixar/g, async(ctx) => {
  let response = ctx.match.input.split('/baixar ')

  let url = `${siteApi}/download/${response[1]}`

  console.log(url)

  try {
      const { data } = await axios.get(url)
  
      if(data.duasPartes === 1){
    
        if (data.parte1.variosLinks === 1){ //varios links de download
         // dataVariosLinks(ctx, data.parte1, data.titulo, data.infos)
        }else{ //links de download unico
          dataNormal(ctx, data.parte1, data.titulo, data.infos)
        }
        
        if (data.parte2.variosLinks === 1){ //varios links de download
         //dataVariosLinks(ctx, data.parte2, data.titulo, data.infos)
        }else{ //links de download unico
          dataNormal(ctx, data.parte2, data.titulo, data.infos)
        }
    
      }else{
    
        if (data.parte1.variosLinks === 1){ //varios links de download
          dataVariosLinks(ctx, data.parte1, data.titulo, data.infos)
        }else{ //links de download unico
          dataNormal(ctx, data.parte1, data.titulo, data.infos)
        }
    
      }

  } catch (e) {
    switch (e.message) {
      case 'Request failed with status code 404':
        ctx.reply('❌ Ops! link não encontrado 😿')
        break;
    
      default: ctx.reply('❌ Algo deu errado 😿')
        break;
    }
    console.log(e.message)
  }
})

//bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`)
//bot.startWebhook(`/bot${API_TOKEN}`, null, PORT)

bot.launch()