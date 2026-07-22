let allWords=[];
let currentWords=[];
let turn=1;
const turnNum=document.getElementById("turn-num");
const wordsLeft=document.getElementById("words-left");
const suggestedWord=document.getElementById("suggested-word");
const typedWord=document.getElementById("typed-word");
const submitBtn=document.getElementById("submit-btn");
const resetBtn=document.getElementById("reset-btn");
const letters=document.querySelectorAll(".letter");
fetch("words.txt")
.then(response=>response.text())
.then(text=>{
allWords=text.split(/\r?\n/)
.map(w=>w.trim().toLowerCase())
.filter(w=>/^[a-z]{5}$/.test(w));
startGame();
})
.catch(()=>{
suggestedWord.textContent="ERROR";
});
function shakeLetters(){
for(let i=0;i<letters.length;i++)
letters[i].classList.add("shake");
setTimeout(()=>{
for(let i=0;i<letters.length;i++)
letters[i].classList.remove("shake");
},350);
}
function winAnimation(){
for(let i=0;i<letters.length;i++)
letters[i].classList.add("win");
suggestedWord.textContent="SOLVED!";
setTimeout(()=>{
for(let i=0;i<letters.length;i++)
letters[i].classList.remove("win");
startGame();
},1000);
}
function startGame(){
currentWords=[...allWords];
turn=1;
nextTurn();
}
function nextTurn(){
if(currentWords.length===0){
suggestedWord.textContent="-----";
wordsLeft.textContent="0";
shakeLetters();
return;
}
turnNum.textContent=turn;
wordsLeft.textContent=currentWords.length;
let guess=pickWord(currentWords);
suggestedWord.textContent=guess.toUpperCase();
typedWord.value=guess;
updateLetters();
}
typedWord.addEventListener("input",updateLetters);
function updateLetters(){
let word=typedWord.value.toUpperCase();
for(let i=0;i<5;i++){
letters[i].textContent=word[i]||"";
letters[i].dataset.state=0;
letters[i].className="letter grey";
}
}
for(let i=0;i<letters.length;i++){
letters[i].addEventListener("click",()=>{
let state=Number(letters[i].dataset.state);
state=(state+1)%3;
letters[i].dataset.state=state;
if(state===0)
letters[i].className="letter grey";
else if(state===1)
letters[i].className="letter yellow";
else
letters[i].className="letter green";
});
}
function checkWord(word,guess,fb){
let result=["0","0","0","0","0"];
let used=[false,false,false,false,false];
for(let i=0;i<5;i++){
if(word[i]===guess[i]){
result[i]="2";
used[i]=true;
}
}
for(let i=0;i<5;i++){
if(result[i]==="2")
continue;
for(let j=0;j<5;j++){
if(!used[j]&&guess[i]===word[j]){
result[i]="1";
used[j]=true;
break;
}
}
}
return result.join("")===fb;
}
function pickWord(list){
if(turn===1){
let startWords=list.filter(word=>{
return new Set(word).size===5;
});
return startWords[Math.floor(Math.random()*startWords.length)];
}
let freq=new Array(26).fill(0);
for(let word of list){
let used=new Array(26).fill(false);
for(let j=0;j<5;j++)
used[word.charCodeAt(j)-97]=true;
for(let j=0;j<26;j++)
if(used[j])
freq[j]++;
}
let bestWord=list[0];
let bestScore=0;
for(let word of list){
let used=new Array(26).fill(false);
let score=0;
for(let j=0;j<5;j++){
let x=word.charCodeAt(j)-97;
if(!used[x]){
used[x]=true;
score+=freq[x];
}
}
if(score>bestScore){
bestScore=score;
bestWord=word;
}
}
return bestWord;
}
submitBtn.addEventListener("click",()=>{
let guess=typedWord.value.toLowerCase().trim();
if(guess.length!==5){
shakeLetters();
return;
}
if(!allWords.includes(guess)){
suggestedWord.textContent="INVALID WORD";
shakeLetters();
return;
}
let fb="";
for(let i=0;i<letters.length;i++)
fb+=letters[i].dataset.state;
if(fb==="22222"){
winAnimation();
return;
}
currentWords=currentWords.filter(word=>{
return checkWord(word,guess,fb);
});
turn++;
nextTurn();
});
resetBtn.addEventListener("click",()=>{
startGame();
});
