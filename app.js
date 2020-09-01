const Telegraf = require('telegraf')
const Markup = require('telegraf/markup')
const axios = require('axios')
//const express = require('express');
//const app = express();


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

async function dataNormal(ctx, data, titulo, infos){

  let arrEps1 = []

  for(var i in data.eps.normal){
    
    let epName = data.eps.normal[i].ep.replace(':','')
    let epLink = data.eps.normal[i].link

    if(epLink === undefined){ break }

    let base64 = Buffer.from(epLink).toString('base64')

    epLink = `${siteApi}/torrent/${base64}`

    arrEps1.push(Markup.urlButton(epName, epLink))

  }

  let n1 = 0 
  let n2 = 3

  //console.log(arrEps)
  ctx.reply(`<b>${titulo}</b>\n\n${infos}\n\n<b>${data.parte}</b>`, {
    reply_markup: { inline_keyboard: [ arrEps1.slice(n1,n2), [{ text: '⬅', callback_data: 'voltar0', hide: false },{ text: '➡', callback_data: 'avancar0', hide: false }]] },
    parse_mode: 'HTML'
  })

  bot.action('voltar0', async(ctx) => {
    n1 -= 3
    n2 -= 3
    if (arrEps1.slice(n1,n2) && arrEps1.slice(n1,n2).length) {    
      await ctx.editMessageReplyMarkup(
        { inline_keyboard: [ arrEps1.slice(n1,n2), [{ text: '⬅', callback_data: 'voltar0', hide: false },{ text: '➡', callback_data: 'avancar0', hide: false }]] }
            ) 
   } else { 
    n1 += 3
    n2 += 3
   } 
  })

  bot.action('avancar0', async(ctx) => {
    
    n1 += 3
    n2 += 3
    if (arrEps1.slice(n1,n2) && arrEps1.slice(n1,n2).length) {    
      await ctx.editMessageReplyMarkup(
        { inline_keyboard: [ arrEps1.slice(n1,n2), [{ text: '⬅', callback_data: 'voltar0', hide: false },{ text: '➡', callback_data: 'avancar0', hide: false }]] }
            ) 
   } else { 
    n1 -= 3
    n2 -= 3
   }
    
  })

}

async function dataVariosLinks(ctx, data, titulo, infos){

  let arrEps = []
  let epsLinks = []
  for(var i in data.eps.variosLinks){

    let epName = data.eps.variosLinks[i].ep.replace('<b>','').replace('</b>','').replace('<br>','')
    let dados = []

    for(var ind in data.eps.variosLinks[i].links){

      let epLink = data.eps.variosLinks[i].links[ind].link
      let epValor = data.eps.variosLinks[i].links[ind].valor
      epLink = `${siteApi}/torrent/${Buffer.from(epLink).toString('base64')}`
      dados.push(Markup.urlButton(epValor, epLink))

    }
    
    epsLinks.push(dados)

    arrEps.push(Markup.callbackButton(epName.replace(':',''), `ep-${i}`))

  }

  let n1 = 0 
  let n2 = 3

  ctx.reply(`<b>${titulo}</b>\n\n${infos}\n\n<b>${data.parte}</b>`, {
    reply_markup: { inline_keyboard: [ arrEps.slice(n1,n2), [{ text: '⬅', callback_data: 'voltar', hide: false },{ text: '➡', callback_data: 'avancar', hide: false }]] },
    parse_mode: 'HTML'
  })

  bot.action('voltar', async(ctx) => {
    n1 -= 3
    n2 -= 3
    if (arrEps.slice(n1,n2) && arrEps.slice(n1,n2).length) {    
      await ctx.editMessageReplyMarkup(
        { inline_keyboard: [ arrEps.slice(n1,n2), [{ text: '⬅', callback_data: 'voltar', hide: false },{ text: '➡', callback_data: 'avancar', hide: false }]] }
            ) 
   } else { 
    n1 += 3
    n2 += 3
   } 
  })

  bot.action('avancar', async(ctx) => {
    
    n1 += 3
    n2 += 3
    if (arrEps.slice(n1,n2) && arrEps.slice(n1,n2).length) {    
      await ctx.editMessageReplyMarkup(
        { inline_keyboard: [ arrEps.slice(n1,n2), [{ text: '⬅', callback_data: 'voltar', hide: false },{ text: '➡', callback_data: 'avancar', hide: false }]] }
            ) 
   } else { 
    n1 -= 3
    n2 -= 3
   }
    
  })

//------------------------------------------------

  let n3 = 0 
  let n4 = 3

  let index = ''
  let nome = ''
  bot.action(/^ep-/g, async(ctx) => {
    index = ctx.match.input.replace('ep-','')
    nome = arrEps[index].text

    //console.log(ctx)

    await ctx.editMessageText(`<b>${titulo}</b>\n\n${infos}\n\n<b>${data.parte}</b>\n<b>${nome}:</b>`, {
      reply_markup: { inline_keyboard: [ epsLinks[index].slice(n3,n4), [{ text: '⬅', callback_data: 'voltar2', hide: false },{ text: '↩️ voltar', callback_data: 'voltartudo', hide: false },{ text: '➡', callback_data: 'avancar2', hide: false }]] },
      parse_mode: 'HTML'
    })
  })

  bot.action('voltar2', async(ctx) => {
    n4 -= 3
    n3 -= 3
    if (epsLinks[index].slice(n3,n4) && epsLinks[index].slice(n3,n4).length) {    
      await ctx.editMessageText(`<b>${titulo}</b>\n\n${infos}\n\n<b>${data.parte}</b>\n<b>${nome}:</b>`, {
        reply_markup: { inline_keyboard: [ epsLinks[index].slice(n3,n4), [{ text: '⬅', callback_data: 'voltar2', hide: false },{ text: '↩️ voltar', callback_data: 'voltartudo', hide: false },{ text: '➡', callback_data: 'avancar2', hide: false }]] },
        parse_mode: 'HTML'
      })
   } else { 
    n3 += 3
    n4 += 3
   } 
  })

  bot.action('voltartudo', async(ctx) => {

  ctx.editMessageText(`<b>${titulo}</b>\n\n${infos}\n\n<b>${data.parte}</b>`, {
    reply_markup: { inline_keyboard: [ arrEps.slice(n1,n2), [{ text: '⬅', callback_data: 'voltar', hide: false },{ text: '➡', callback_data: 'avancar', hide: false }]] },
    parse_mode: 'HTML'
  })
  })

  bot.action('avancar2', async(ctx) => {
    n3 -= 3
    n4 -= 3

    if (epsLinks[index].slice(n3,n4) && epsLinks[index].slice(n3,n4).length) {    
      await ctx.editMessageText(`<b>${titulo}</b>\n\n${infos}\n\n<b>${data.parte}</b>\n<b>${nome}:</b>`, {
        reply_markup: { inline_keyboard: [ epsLinks[index].slice(n3,n4), [{ text: '⬅', callback_data: 'voltar2', hide: false },{ text: '↩️ voltar', callback_data: 'voltartudo', hide: false },{ text: '➡', callback_data: 'avancar2', hide: false }]] },
        parse_mode: 'HTML'
      })
   } else { 
    n3 += 3
    n4 += 3
   } 
  })
}

//-------------------------------------------------------

bot.hears(/^@FilmesTorrent_bot \/baixar|\/baixar/g,  async(ctx) => {
  let response = ctx.match.input.split('/baixar ')

  let url = `${siteApi}/download/${response[1]}`

  console.log(url)

  try {
    const { data } = await axios.get(url)
  
      if(data.duasPartes === 1){
    
        if (data.parte1.variosLinks === 1){ //varios links de download
          dataVariosLinks(ctx, data.parte1, data.titulo, data.infos)
        }else{ //links de download unico
          dataNormal(ctx, data.parte1, data.titulo, data.infos)
        }
        
        if (data.parte2.variosLinks === 1){ //varios links de download
          dataVariosLinks(ctx, data.parte2, data.titulo, data.infos)
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

bot.telegram.setWebhook(`${URL}/bot${API_TOKEN}`);
bot.startWebhook(`/bot${API_TOKEN}`, null, PORT)

//bot.launch()