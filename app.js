const labels={price:'Цена',weight:'Вес',unitPrice:'Цена за кг'};
const units={price:'₽',weight:'г',unitPrice:'₽/кг'};
const key='kilogram.measurements.v2';
const seed=[{id:'seed-1',label:'Товар 1',price:159.9,weight:450,unitPrice:355.33},{id:'seed-2',label:'Товар 2',price:214,weight:700,unitPrice:305.71},{id:'seed-3',label:'Товар 3',price:92.5,weight:250,unitPrice:370}];
let mode='unitPrice';
let items=load();
const $=s=>document.querySelector(s);
const $$=s=>Array.from(document.querySelectorAll(s));
function clean(v){const n=String(v).replace(',','.').replace(/[^\d.]/g,'');const i=n.indexOf('.');return i<0?n:n.slice(0,i+1)+n.slice(i+1).replace(/\./g,'')}
function num(v){const n=parseFloat(String(v).replace(',','.'));return Number.isFinite(n)&&n>0?n:null}
function round(v){return Math.round(v*100)/100}
function fmt(v,d=2){return new Intl.NumberFormat('ru-RU',{maximumFractionDigits:d,minimumFractionDigits:v%1===0?0:Math.min(d,2)}).format(v)}
function money(v){return new Intl.NumberFormat('ru-RU',{maximumFractionDigits:2,minimumFractionDigits:v%1===0?0:2}).format(v)}
function weightLabel(v){return v>=1000?fmt(v/1000,3)+' кг':fmt(v)+' г'}
function load(){try{const saved=JSON.parse(localStorage.getItem(key)||'null');return Array.isArray(saved)&&saved.length?saved:seed.slice()}catch{return seed.slice()}}
function values(){return{price:num($('#price').value),weight:num($('#weight').value),unitPrice:num($('#unitPrice').value)}}
function snapshot(){const v=values();if(mode==='unitPrice'&&v.price&&v.weight)return{...v,unitPrice:round(v.price/v.weight*1000),ok:true};if(mode==='price'&&v.weight&&v.unitPrice)return{...v,price:round(v.unitPrice*v.weight/1000),ok:true};if(mode==='weight'&&v.price&&v.unitPrice)return{...v,weight:round(v.price/v.unitPrice*1000),ok:true};return{...v,ok:false}}
function setMode(next){mode=next;$$('.mode').forEach(b=>b.classList.toggle('active',b.dataset.mode===mode));['price','weight','unitPrice'].forEach(f=>{const input=$('#'+f);const field=document.querySelector(`[data-field="${f}"]`);const computed=f===mode;input.disabled=computed;field.classList.toggle('computed',computed);field.querySelector('small').textContent=computed?'вычисляется':'цифры'});render()}
function render(){const s=snapshot();if(s.ok){if(mode==='price')$('#price').value=String(s.price);if(mode==='weight')$('#weight').value=String(s.weight);if(mode==='unitPrice')$('#unitPrice').value=String(s.unitPrice)}$('#result-label').textContent=labels[mode];$('#result-unit').textContent=units[mode];$('#result-value').textContent=s[mode]?money(s[mode]):'0';$('#result-sub').textContent=s.ok?`Цена ${money(s.price)} ₽ за ${weightLabel(s.weight)}`:'Введите любые две цифры, третья появится сразу';$('#save').disabled=!s.ok;renderFeed()}
function renderFeed(){const sorted=items.slice().sort((a,b)=>a.unitPrice-b.unitPrice);$('#compare').innerHTML=sorted.slice(0,2).map((it,i)=>`<div class="tile ${i?'next':'best'}"><span>${i?it.label:'Лучшее'}</span><strong>${money(it.unitPrice)} ₽/кг</strong></div>`).join('');$('#rows').innerHTML=sorted.map((it,i)=>`<article class="row ${i?'':'best'}"><div class="lead"><div class="row-icon">${i?'✓':'✦'}</div><div><h3>${it.label}</h3><p>${money(it.price)} ₽ · ${weightLabel(it.weight)}</p></div></div><div class="row-val">${i?'':'<span>Лучшее</span>'}<strong>${money(it.unitPrice)} ₽/кг</strong></div><button class="delete" aria-label="Удалить ${it.label}" data-del="${it.id}">⌫</button></article>`).join('')}
$$('input').forEach(i=>i.addEventListener('input',e=>{e.target.value=clean(e.target.value);render()}));
$$('.mode').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
$$('.chip').forEach(b=>b.addEventListener('click',()=>{$('#weight').value=b.dataset.weight;if(mode==='weight')setMode('unitPrice');render()}));
$('#clear').onclick=()=>{$('#price').value='';$('#weight').value='';$('#unitPrice').value='';setMode('unitPrice')};
$('#save').onclick=()=>{const s=snapshot();if(!s.ok)return;items=[{id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),label:`Товар ${items.length+1}`,price:s.price,weight:s.weight,unitPrice:s.unitPrice},...items].slice(0,24);localStorage.setItem(key,JSON.stringify(items));renderFeed()};
$('#reset').onclick=()=>{items=seed.slice();localStorage.setItem(key,JSON.stringify(items));renderFeed()};
$('#rows').onclick=e=>{const b=e.target.closest('[data-del]');if(!b)return;items=items.filter(i=>i.id!==b.dataset.del);localStorage.setItem(key,JSON.stringify(items));renderFeed()};
if('serviceWorker'in navigator){addEventListener('load',()=>{const base=location.pathname.replace(/[^/]*$/,'');navigator.serviceWorker.register(base+'sw.js',{scope:base}).catch(console.warn)})}
render();
