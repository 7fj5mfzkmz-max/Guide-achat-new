(function(){
  'use strict';
  if (document.querySelector('.site-lava')) return;
  var d=document.createElement('div');
  d.className='site-lava';
  d.setAttribute('aria-hidden','true');
  d.innerHTML='<i></i><i></i><i></i><i></i>';
  document.body.insertBefore(d,document.body.firstChild);
})();
