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
function getHostname(link) {
    let e = document.createElement("a");
    e.setAttribute("href", link)
    return e.hostname
}
function selectImage(callback) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // 仅允许选择图片文件

    // 添加事件监听器以侦听文件选择
    input.addEventListener('change', function () {
        var file = input.files[0];
        var reader = new FileReader();

        // 读取文件并将其转换为base64数据
        reader.addEventListener('load', function () {
            var base64Data = reader.result;
            // 调用callImgAPI函数并传递base64数据
            callback(base64Data)
        });

        if (file) {
            reader.readAsDataURL(file);
        } else {
            callback(undefined);
        }
    });

    // 触发文件选择对话框
    input.click();
}
function bind_event() {
    var chatInput = document.getElementById('chatinput');
    chatInput.addEventListener('paste', function (event) {
        var items = (event.clipboardData || event.originalEvent.clipboardData).items;
        for (var i = 0; i < items.length; i++) {
            var item = items[i];
            if (item.type.indexOf('image') !== -1) {
                event.preventDefault()
                var file = item.getAsFile();
                var reader = new FileReader();
                reader.onload = function (event) {
                    var base64 = event.target.result;
                    if (typeof localStorage["img-endpoint"] == "undefined") {
                        pushMessage({ nick: "!", text: "You must config an image endpoint to use fast image-sending." })
                        return 1
                    }
                    pushMessage({ nick: "*", text: "Uploading image..." })
                    upload_image(localStorage["img-endpoint"], base64).then((result) => {
                        if (result.startsWith("!")) {
                            pushMessage({ nick: "*", text: "Upload success." })
                            insertAtCursor(result)
                        } else { pushMessage({ nick: "!", text: result }) }
                    }).catch((error) => {
                        pushMessage({ nick: "!", text: `Cannot upload: ${error}` })
                    })
                };
                reader.readAsDataURL(file);
            }
        }
    });
    // Add sidebar button
    let btn = document.createElement("p");
    let sidebarbtn = document.createElement("button");
    sidebarbtn.setAttribute("type", "button")
    sidebarbtn.setAttribute("tr", "")
    sidebarbtn.innerText = "Upload image"
    btn.appendChild(sidebarbtn)
    sidebarbtn.onclick = function (event) {
        selectImage(
            function (base64) {
                if (!base64) {
                    pushMessage({ nick: "!", text: "Uploading Canceled." })
                    return
                }
                pushMessage({ nick: "*", text: "Uploading image..." })
                upload_image(localStorage["img-endpoint"], base64).then((result) => {
                    if (result.startsWith("!")) {
                        pushMessage({ nick: "*", text: "Upload success." })
                        insertAtCursor(result)
                    } else { pushMessage({ nick: "!", text: result }) }
                }).catch((error) => {
                    pushMessage({ nick: "!", text: `Cannot upload: ${error}` })
                })
            })
    };
    $("#plugin-buttons").appendChild(btn)
    if (typeof localStorage["img-endpoint"] != "undefined") {
        // Whitelist itself
        imgHostWhitelist.push(getHostname())
    }
}

run["set-img-endpoint"] = function () {
    localStorageSet("img-endpoint", arguments[0])
}
bind_event()
