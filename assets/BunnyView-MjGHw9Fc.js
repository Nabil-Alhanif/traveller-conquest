import{A as s,a as o,S as i}from"./index-BCUWOVe7.js";import{a as c,c as r,o as d,b as p}from"./index-D6jliMHW.js";const l=p("div",{id:"game-container"},null,-1),m=[l],w={__name:"BunnyView",setup(u){return c(async()=>{const e=new s;await e.init({background:"#1099bb",resizeTo:window}),document.getElementById("game-container").appendChild(e.canvas);const n=await o.load("https://pixijs.com/assets/bunny.png"),t=new i(n);e.stage.addChild(t),t.anchor.set(.5),t.x=e.screen.width/2,t.y=e.screen.height/2,e.ticker.add(a=>{t.rotation+=.1*a.deltaTime})}),(e,n)=>(d(),r("main",null,m))}};export{w as default};
