// esc-to-index.js
// Press Escape to go to /index.html from any page
(function() {
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
      window.location.replace('/index.html');
    }
  }, {capture:true});
})();
