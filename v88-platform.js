(function(){
  'use strict';
  var box=document.querySelector('.v88-platform-choice');
  if(!box)return;
  var buttons=[].slice.call(box.querySelectorAll('button'));
  var key='guideAchatPlatform';
  var saved='auto'; try{saved=localStorage.getItem(key)||'auto'}catch(e){}
  function set(v){buttons.forEach(function(b){var on=b.dataset.platform===v;b.classList.toggle('is-active',on);b.setAttribute('aria-pressed',String(on));});try{localStorage.setItem(key,v)}catch(e){};document.documentElement.dataset.platform=v;}
  buttons.forEach(function(b){b.addEventListener('click',function(){set(b.dataset.platform)})});
  set(saved);
})();
