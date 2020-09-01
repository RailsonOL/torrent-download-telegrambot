const Telegraf = require('telegraf')
const axios = require('axios')

const API_TOKEN = process.env.BOT_TOKEN
const siteApi = process.env.SITE_URL
const PORT = process.env.PORT
const URL = process.env.URL

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

function dataNormal(data){

  var Eps = ''
  var arrEps = []

  for(var i in data.eps.normal){
    
    var epName = data.eps.normal[i].ep
    var epLink = data.eps.normal[i].link
    if(epLink != undefined){ var base64 = Buffer.from(epLink).toString('base64') }else{ var base64 = 'SEM_LINK' }

    epLink = `${siteApi}/torrent/${base64}`

    if (Number(i) == data.eps.normal.length-1){
      Eps += `<b>${epName}</b> [ <a href="${epLink}">Baixar</a> ]\n\n`
      arrEps.push(Eps)
    }else if(Number.isInteger((Number(i)+1) / 2)){
      arrEps.push(Eps)
      Eps = ''
      Eps += `<b>${epName}</b> [ <a href="${epLink}">Baixar</a> ]\n\n`
    }else{
      Eps += `<b>${epName}</b> [ <a href="${epLink}">Baixar</a> ]\n\n`
    }
  }

  return arrEps
}

function dataVariosLinks(data){

  var Eps = ''
  var arrEps = []
  for(var i in data.eps.variosLinks){

    let epName = data.eps.variosLinks[i].ep.replace('<b>','').replace('</b>','').replace('<br>','')
    let dados = ''

    for(var ind in data.eps.variosLinks[i].links){
      let epLink = data.eps.variosLinks[i].links[ind].link
      let epValor = data.eps.variosLinks[i].links[ind].valor
      if(epLink != undefined){ var base64 = Buffer.from(epLink).toString('base64') }else{ var base64 = 'SEM_LINK' }
      epLink = `${siteApi}/torrent/${base64}`
      dados += `[<a href="${epLink}"> ${epValor} </a>] `
    }

    if (Number(i) == data.eps.variosLinks.length-1){
      Eps += `<b>${epName}</b>: ${dados}\n\n`
      arrEps.push(Eps)
    }else if(Number.isInteger((Number(i)+1) / 2)){
      arrEps.push(Eps)
      Eps = ''
      Eps += `<b>${epName}</b>: ${dados}\n\n`
    }else{
      Eps += `<b>${epName}</b>: ${dados}\n\n`
    }
  }
  return arrEps
}

//-------------------------------------------------------

bot.hears(/^@FilmesTorrent_bot \/baixar|\/baixar/g,  async(ctx) => {

  let response = ctx.match.input.split('/baixar ')

  let url = `${siteApi}/download/${response[1]}`

  console.log(url)

  try {
    const { data } = await axios.get(url)
  
      if(data.duasPartes === 1){
        let callParteParte1 = data.parte1.parte
        let callParteParte2 = data.parte2.parte
        ctx.reply(`<b>Escolha uma das partes:</b>`, {
          reply_markup: { inline_keyboard: [[{ text: callParteParte1, callback_data: 'call_parte1', hide: false },{ text: callParteParte2, callback_data: 'call_parte2', hide: false }]] },
          parse_mode: 'HTML'
        })      
  
        bot.action('call_parte1', (ctx) => {
          if (data.parte1.variosLinks === 1){ //varios links de download

            var arr = dataVariosLinks(data.parte1)
            
            ctx.reply(`<b>${data.titulo}</b>
            ${data.infos}
            <b>${data.parte1.parte}</b>`, { parse_mode: 'HTML' })

            for(var i in arr){
              if (arr[i] != ''){
                ctx.reply(`${arr[i]}`, { parse_mode: 'HTML' })
              }
            }

          }else{ //links de download unico
            var arr = dataNormal(data.parte1)

            ctx.reply(`<b>${data.titulo}</b>
            ${data.infos}
            <b>${data.parte1.parte}</b>`, { parse_mode: 'HTML' })

            for(var i in arr){
              if (arr[i] != ''){
                ctx.reply(`${arr[i]}`, { parse_mode: 'HTML' })
              }
            }
          }
        })

        bot.action('call_parte2', (ctx) => {

          if (data.parte2.variosLinks === 1){ //varios links de download

            var arr = dataVariosLinks(data.parte2)

            ctx.reply(`<b>${data.titulo}</b>
            ${data.infos}
            <b>${data.parte2.parte}</b>`, { parse_mode: 'HTML' })

            for(var i in arr){
              if (arr[i] != ''){
                ctx.reply(`${arr[i]}`, { parse_mode: 'HTML' })
              }
            }

          }else{ //links de download unico
            var arr = dataNormal(data.parte2)

            ctx.reply(`<b>${data.titulo}</b>
            ${data.infos}
            <b>${data.parte2.parte}</b>`, { parse_mode: 'HTML' })

            for(var i in arr){
              if (arr[i] != ''){
                ctx.reply(`${arr[i]}`, { parse_mode: 'HTML' })
              }
            }

          }
        })
    
      }else{
    
        if (data.parte1.variosLinks === 1){ //varios links de download

          var arr = dataVariosLinks(data.parte1)
            
          ctx.reply(`<b>${data.titulo}</b>
          ${data.infos}
          <b>${data.parte1.parte}</b>`, { parse_mode: 'HTML' })

          for(var i in arr){
            if (arr[i] != ''){
              ctx.reply(`${arr[i]}`, { parse_mode: 'HTML' })
            }
          }

        }else{ //links de download unico
          var arr = dataNormal(data.parte1)

          ctx.reply(`<b>${data.titulo}</b>
          ${data.infos}
          <b>${data.parte1.parte}</b>`, { parse_mode: 'HTML' })

          for(var i in arr){
            if (arr[i] != ''){
              ctx.reply(`${arr[i]}`, { parse_mode: 'HTML' })
            }
          }
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

bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
bot.startWebhook(`/bot${API_TOKEN}`, null, PORT)

//bot.launch()