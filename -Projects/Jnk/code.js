// esc-to-index.js
// Type the tower of gable shorthand to find the second hidden page
(function () {
  let keyBuffer = "";
  const targetSequence = "tog";

  window.addEventListener('keydown', function (e) {
    const key = e.key.toLowerCase();
    keyBuffer += key;

    if (keyBuffer.length > targetSequence.length) {
      keyBuffer = keyBuffer.slice(-targetSequence.length);
    }

    if (keyBuffer === targetSequence) {
      window.location.replace('./Jnk/teo.html');
      keyBuffer = ""; // Clear the buffer after successful match
    } else if (!targetSequence.startsWith(keyBuffer)) {
      keyBuffer = ""; // Clear the buffer if the sequence is broken
    }
  }, { capture: true });
})();
