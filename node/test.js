const data = {
  update_id: 542271472,
  callback_query: {
    id: '4130929955590645911',
    from: {
      id: 5256774376,
      is_bot: false,
      first_name: '科瑞思',
      username: 'Chris94694',
      language_code: 'zh-hans'
    },
    message: {
      message_id: 291,
      from: [Object],
      chat: [Object],
      date: 1696352189,
      text: '列出在用群组：',
      reply_markup: [Object]
    },
    chat_instance: '-6166686581095926741',
    data: '1'
  }
}

const data2 = {
  update_id: 542271473,
  message: {
    message_id: 296,
    from: {
      id: 5256774376,
      is_bot: false,
      first_name: '科瑞思',
      username: 'Chris94694',
      language_code: 'zh-hans'
    },
    chat: {
      id: 5256774376,
      first_name: '科瑞思',
      username: 'Chris94694',
      type: 'private'
    },
    date: 1696422411,
    text: '/grouplist',
    entities: [ [Object] ]
  }
}

const data3 = {

}

const getBaseMessageData = async (data) => {
    if (data.callback_query) {
        // console.log(1)
    } else if(data.message){
        // console.log(2)
    } else {
        //未知的类型
        throw error[406];
    }
}

const webhook = () => {
    getBaseMessageData()
}

webhook();


// const dat = {
//     chatType:1,
//     text:2,
//     fromid:3
// }


// let { chatType, text, fromid } = dat;
// chatType = 2
// console.log(chatType)
