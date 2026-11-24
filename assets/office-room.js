/* Load the existing room when it approaches the viewport. */
(() => {
 const host=document.querySelector('.office-room[data-world]');
 if(!host)return;
 const moduleURL=new URL('./aiforeu-gallery/gallery.js?v=office-single-20261117',document.currentScript.src);
 let started=false;
 const mount=async()=>{
  if(started)return;started=true;
  try{
   const {mountWorld}=await import(moduleURL.href);
   const room=mountWorld(host,{plainRoom:true,selected:'voice'});
   if(!room||!await room.ready)host.setAttribute('data-gallery-static','');
  }catch{host.setAttribute('data-gallery-static','');}
 };
 if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{
   if(entries.some(entry=>entry.isIntersecting)){observer.disconnect();mount();}
  },{rootMargin:'300px 0px'});
  observer.observe(host);
 }else mount();
})();
