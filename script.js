// прості утиліти для всіх сторінок
document.addEventListener('DOMContentLoaded', ()=> {
  // підсвітка активного посилання
  document.querySelectorAll('.main-nav .nav-link').forEach(a=>{
    if(a.href === location.href || a.href === location.pathname.split('/').pop()){
      a.classList.add('active');
    }
  });
});
