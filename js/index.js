// index.html용 JavaScript
// PWA 서비스 워커 등록
(function(){
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function(){
      navigator.serviceWorker.register('/sw.js').catch(function(err){
        console.log('SW 등록 실패:', err);
      });
    });
  }
})();