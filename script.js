let prompt=document.querySelector("#prompt")
let submitbtn=document.querySelector("#submit")
let chatContainer=document.querySelector(".chat-container")
let imagebtn=document.querySelector("#image")
let image=document.querySelector("#image img")
let imageinput=document.querySelector("#image input")

const API_KEY="AIzaSyA3VO6v62i5wMFSukqE_4LpHSQ2pR5525M"
const Api_Url=`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`
const STORAGE_KEY = "ai_chat_history_v1"

let user={
    message:null,
    file:{
        mime_type:null,
        data: null
    }
}
 
async function generateResponse(aiChatBox) {

let text=aiChatBox.querySelector(".ai-chat-area")
    let RequestOption={
        method:"POST",
        headers:{'Content-Type' : 'application/json'},
        body:JSON.stringify({
            "contents":[
                {"parts":[{text:user.message},(user.file.data?[{inline_data:user.file}]:[])

                ]
            }]
        })
    }
    try{
        let response= await fetch(Api_Url,RequestOption)
        let data=await response.json()
        let apiResponse = (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) ? data.candidates[0].content.parts[0].text : ""
        if(!apiResponse) apiResponse = "Sorry, I couldn't generate a response."
        text.innerHTML = formatMessage(apiResponse)
        // persist AI message
        saveMessage("ai", apiResponse, null)
    }
    catch(error){
        console.log(error);
        
    }
    finally{
        chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior:"smooth"})
        image.src=`img.svg`
        image.classList.remove("choose")
        user.file={}
    }
}



function createChatBox(html,classes){
    let div=document.createElement("div")
    div.innerHTML=html
    div.classList.add(classes)
    return div
}

function scrollToBottom(){
    chatContainer.scrollTo({top:chatContainer.scrollHeight,behavior:"smooth"})
}

function escapeHtml(text){
    return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function formatMessage(text){
    let escaped = escapeHtml(text)
    return escaped.replace(/\*\*([\s\S]+?)\*\*/g, "<strong>$1</strong>")
}

function saveMessage(role, text, file){
    try{
        let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
        history.push({ role, text, file: file && file.data ? { mime_type: file.mime_type, data: file.data } : null })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    }catch(e){
        console.log(e)
    }
}

function renderMessage(entry){
    if(entry.role === "user"){
        // user bubble
        let wrapper = document.createElement("div")
        wrapper.classList.add("user-chat-box")

        let avatar = document.createElement("img")
        avatar.src = "user.png"
        avatar.alt = ""
        avatar.id = "userImage"
        avatar.width = 8
        avatar.setAttribute("width","8%")

        let area = document.createElement("div")
        area.classList.add("user-chat-area")
        area.innerHTML = formatMessage(entry.text || "")

        wrapper.appendChild(avatar)
        wrapper.appendChild(area)

        if(entry.file && entry.file.data){
            let img = document.createElement("img")
            img.classList.add("chooseimg")
            img.src = `data:${entry.file.mime_type};base64,${entry.file.data}`
            area.appendChild(img)
        }

        chatContainer.appendChild(wrapper)
    } else {
        // ai bubble
        let wrapper = document.createElement("div")
        wrapper.classList.add("ai-chat-box")

        let avatar = document.createElement("img")
        avatar.src = "ai.png"
        avatar.alt = ""
        avatar.id = "aiImage"
        avatar.setAttribute("width","10%")

        let area = document.createElement("div")
        area.classList.add("ai-chat-area")
        area.innerHTML = formatMessage(entry.text || "")

        wrapper.appendChild(avatar)
        wrapper.appendChild(area)
        chatContainer.appendChild(wrapper)
    }
}

function renderHistory(){
    try{
        let history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
        chatContainer.innerHTML = ""
        if(!history.length){
           
            renderMessage({ role: "ai", text: "Hello ! How Can I Help you Today?" })
            return
        }
        history.forEach(renderMessage)
        scrollToBottom()
    }catch(e){
        console.log(e)
    }
}


function handlechatResponse(userMessage){
    if(!userMessage || !userMessage.trim()) return
    user.message=userMessage


    renderMessage({ role: "user", text: user.message, file: user.file && user.file.data ? user.file : null })
   
    saveMessage("user", user.message, user.file)

    prompt.value=""
    scrollToBottom()

   
    setTimeout(()=>{
        let wrapper = document.createElement("div")
        wrapper.classList.add("ai-chat-box")

        let avatar = document.createElement("img")
        avatar.src = "ai.png"
        avatar.alt = ""
        avatar.id = "aiImage"
        avatar.setAttribute("width","10%")

        let area = document.createElement("div")
        area.classList.add("ai-chat-area")
        let loader = document.createElement("img")
        loader.src = "loading.webp"
        loader.alt = ""
        loader.classList.add("load")
        loader.setAttribute("width","50px")
        area.appendChild(loader)

        wrapper.appendChild(avatar)
        wrapper.appendChild(area)
        chatContainer.appendChild(wrapper)
        generateResponse(wrapper)
    },600)

}


prompt.addEventListener("keydown",(e)=>{
    if(e.key=="Enter"){
       handlechatResponse(prompt.value)

    }
})

submitbtn.addEventListener("click",()=>{
    handlechatResponse(prompt.value)
})
imageinput.addEventListener("change",()=>{
    const file=imageinput.files[0]
    if(!file) return
    let reader=new FileReader()
    reader.onload=(e)=>{
       let base64string=e.target.result.split(",")[1]
       user.file={
        mime_type:file.type,
        data: base64string
    }
    image.src=`data:${user.file.mime_type};base64,${user.file.data}`
    image.classList.add("choose")
    }
    
    reader.readAsDataURL(file)
})


imagebtn.addEventListener("click",()=>{
    imagebtn.querySelector("input").click()
})

renderHistory()