(function(){
  'use strict';
  var root=document.querySelector('[data-amazon-guide]');
  if(!root)return;
  var steps=[].slice.call(root.querySelectorAll('[data-amazon-step]'));
  var deviceSteps=[].slice.call(root.querySelectorAll('.amazon-step'));
  var next=root.querySelector('[data-amazon-next]');
  var current=0;
  var timer=null;
  function render(n){
    current=n;
    steps.forEach(function(s,i){s.classList.toggle('is-active',i===n);s.setAttribute('aria-current',i===n?'step':'false')});
    deviceSteps.forEach(function(s,i){s.classList.toggle('is-active',i===n)});
    if(next){next.disabled=n<steps.length-1;next.textContent=n===steps.length-1?'Voir les caractéristiques ↓':'Étape suivante →'}
  }
  function advance(){
    if(current<steps.length-1){render(current+1);return}
    var target=document.getElementById('amazon-characteristics-target');
    if(target)target.scrollIntoView({behavior:'smooth',block:'start'});
  }
  steps.forEach(function(s,i){s.addEventListener('click',function(){render(i);reset()})});
  if(next)next.addEventListener('click',advance);
  function reset(){clearInterval(timer);timer=setInterval(function(){render((current+1)%steps.length)},4200)}
  render(0);reset();
  root.addEventListener('mouseenter',function(){clearInterval(timer)});
  root.addEventListener('mouseleave',reset);
  root.addEventListener('focusin',function(){clearInterval(timer)});
  root.addEventListener('focusout',function(e){if(!root.contains(e.relatedTarget))reset()});
})();
