function upload_image(url, base64) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    
    socket.onopen = () => {
      const message = JSON.stringify({ data: base64 });
      socket.send(message);
    };
  
    socket.onmessage = (event) => {
      const result = event.data;
      resolve(result);
      socket.close();
    };
  
    socket.onerror = (error) => {
      reject(error);
      socket.close();
    };
  });
}
function getHostname(link){
  let e=document.createElement("a");
  e.setAttribute("href",link)
  return e.hostname
}
function bind_event() {
  var chatInput = document.getElementById('chatinput');
  chatInput.addEventListener('paste', function(event) {
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      if (item.type.indexOf('image') !== -1) {
        event.preventDefault()
        var file = item.getAsFile();
        var reader = new FileReader();
        reader.onload = function(event) {
          var base64 = event.target.result;
          if(typeof localStorage["img-endpoint"] == "undefined"){
            pushMessage({nick:"!",text:"You must config an image endpoint to use fast image-sending."})
            return 1
          }
          pushMessage({nick:"*",text:"Uploading image..."})
          upload_image(localStorage["img-endpoint"],base64).then((result)=>{
            if(result.startsWith("!")){
              pushMessage({nick:"*",text:"Upload success."})
            insertAtCursor(result)}else{pushMessage({nick:"!",text:result})}
          }).catch((error)=>{
            pushMessage({nick:"!",text:`Cannot upload: ${error}`})
          })
        };
        reader.readAsDataURL(file);
      }
    }
  });
  if(typeof localStorage["img-endpoint"] != "undefined"){
    // Whitelist itself
    imgHostWhitelist.push(getHostname())
  }
}

run["set-img-endpoint"]=function(){
  localStorageSet("img-endpoint",arguments[0])
}
bind_event()
