//for addbtn
let addbtn = document.querySelector(".add-btn");
//for removebtn
let removebtn = document.querySelector(".remove-btn");
let modalcont =document.querySelector(".modal-cont");
let maincont = document.querySelector(".main-cont");
let textareacont = document.querySelector(".textarea-cont");
let allPriorityColors = document.querySelectorAll(".priority-color");
let toolBoxColors = document.querySelectorAll(".color");


//array me dalke uske baad jo last color hoga  modal container  ka usko priority bana dega
let colors = ["lightpink","lightblue","lightgreen","lightyellow" ];
let modalPriorityColor = colors[colors.length-1];

let addFlag =false;

let removeFlag=false;

let lockClass = "fa-lock";
let unlockClass = "fa-unlock";

let ticketsArr= [];

if(localStorage.getItem("jira_tickets")){
   //Retrive and display tickets
   ticketsArr = JSON.parse(localStorage.getItem("jira_tickets"));
   ticketsArr.forEach((ticketObj) => {
      createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketID);
   })

}

 for(let i=0; i < toolBoxColors.length; i++) {
   toolBoxColors[i].addEventListener("click",(e) => {
     let currentToolBoxColor = toolBoxColors[i].classList[0];

    let filteredTickets = ticketsArr.filter((ticketObj,idx) => {
         return currentToolBoxColor === ticketObj.ticketColor;
     })

       //remove previous tickets
     let allTicketsCont = document.querySelectorAll(".ticket-cont");
     for(let i=0;i<allTicketsCont.length;i++){
      allTicketsCont[i].remove();
     }

     
     //display new filtered tickets
     
       filteredTickets.forEach((ticketObj,idx) =>{
         createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketID);
       })
   })
          
   ///yeah double click karne pe saare ticket ko wapas le aayega
   toolBoxColors[i].addEventListener('dblclick',(e) =>{
      //remove filtered tickets
      let allTicketsCont = document.querySelectorAll(".ticket-cont");
      for(let i=0;i<allTicketsCont.length;i++){
       allTicketsCont[i].remove();
      }
      ticketsArr.forEach((ticketObj,idx) =>{
       createTicket(ticketObj.ticketColor,ticketObj.ticketTask,ticketObj.ticketID);
      })
   })
 }
 
//Listner for modal priority coloring
allPriorityColors.forEach((colorElem , idx) => {
colorElem.addEventListener("click" , (e) => {
 allPriorityColors.forEach((prioritycolorElem,idx) => {
   prioritycolorElem.classList.remove("border");
        }) 
       colorElem.classList.add("border"); 

       modalPriorityColor= colorElem.classList[0];
    })

 })

///yeah saare addbtn ka remove ka bhi milta julta hoga
addbtn.addEventListener("click",(e) => {
//display modal
//generate ticket
//add flag - true hua to modal display karna padega.
//add flag hua toh modal none ya remove karna padega.
addFlag=!addFlag;
if(addFlag){
 modalcont.style.display="flex";
 } else {
    modalcont.style.display="none";
 }
})

removebtn.addEventListener("click",(e) => {
   removeFlag = !removeFlag;
})

modalcont.addEventListener("keydown",(e) =>{
     let key = e.key; 
   if(key === "Shift"){
   createTicket(modalPriorityColor,textareacont.value);
    addFlag=false; 
    setModalToDefault()
}
})

function createTicket(ticketColor,ticketTask,ticketID) {
   let id =ticketID || shortid();
   let ticketCont = document.createElement("div");
   ticketCont.setAttribute("class","ticket-cont");
   ticketCont.innerHTML= `
   <div class="ticket-color ${ticketColor}"></div>
   <div class="ticket-id">#${ticketID}</div>
   <div class="task-area">${ticketTask}</div>
   <div class="ticket-lock">
   <i class="fa-solid fa-lock"></i>
</div> 
`;
maincont.appendChild(ticketCont);
//create object of ticket add to array
if(!ticketID){
   ticketsArr.push({ ticketColor , ticketTask , ticketID:id});
   localStorage.setItem("jira_tickets",JSON.stringify(ticketsArr));
} 

      handleRemoval(ticketCont, id);
      handleLock(ticketCont, id);
      handleColor(ticketCont, id);

}
function handleRemoval(ticket,id) {
   //remove flag -> true -> remove
   ticket.addEventListener("click", (e) => {
   if(!removeFlag) return; 
   
  let idx = getTicketIdx(id);

  //  DB Removal
  ticketsArr.splice(idx,1);
  let strticketsArr = JSON.stringify(ticketsArr);
  localStorage.setItem("jira_tickets",strticketsArr);

   ticket.remove(); //UI Removal
  })

}

function handleLock(ticket, id){
   let ticketLockElem = ticket.querySelector(".ticket-lock");
   let ticketLock = ticketLockElem.children[0];
   let ticketTaskarea = ticket.querySelector(".task-area");
   ticketLock.addEventListener("click", (e) => {
      let ticketIdx = getTicketIdx(id);


      if(ticketLock.classList.contains(lockClass)){
         ticketLock.classList.remove(lockClass);
         ticketLock.classList.add(unlockClass);
         
         ticketTaskarea.setAttribute("contenteditable","true");
          //this is for content editing in that task area
          // when it is not locked 
      }
      else {
         ticketLock.classList.remove(unlockClass);
         ticketLock.classList.add(lockClass);
         //this next line is also for that purpose but false for locked version.
         ticketTaskarea.setAttribute("contenteditable","false");
      }
      //modify data in local storage(ticketTask)
       ticketsArr[ticketIdx].ticketTask = ticketTaskarea.innerText;
       localStorage.setItem("jira_tickets",JSON.stringify(ticketsArr));
   })

}
function handleColor(ticket, id){
   let ticketColor  = ticket.querySelector(".ticket-color");
  ticketColor.addEventListener("click",(e) => {
   
   //get ticketIdx from ticket Array
   let ticketIdx = getTicketIdx(id);

   let currentTicketColor = ticketColor.classList[1];
   //get ticket color index
   let currentTicketColorIdx=colors.findIndex((color) => {
      return currentTicketColor === color;
   })
   console.log(currentTicketColor,currentTicketColorIdx);
   currentTicketColorIdx++;
   let newTicketColorIdx = currentTicketColorIdx % colors.length;
   let newticketColor = colors[newTicketColorIdx];
   ticketColor.classList.remove(currentTicketColor);
   ticketColor.classList.add(newticketColor);

   //modify data in local storage  (priority color change)
   ticketsArr[ticketIdx].ticketColor = newticketColor;
   localStorage.setItem("jira_tickets",JSON.stringify(ticketsArr));
})
}

function getTicketIdx(id){
let ticketIdx = ticketsArr.findIndex((ticketObj) =>{
   return ticketObj.ticketID === id;
})
return ticketIdx;
}


function setModalToDefault(){
   modalcont.style.display="none";
   textareacont.value= "";
   modalPriorityColor =colors[colors.length-1];
   allPriorityColors.forEach((prioritycolorElem,idx) => {
      prioritycolorElem.classList.remove("border");
   })
   allPriorityColors[allPriorityColors.length-1].classList.add(".border");
}