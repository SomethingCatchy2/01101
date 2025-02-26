var clicks = 0;
var multiplier = 1;
let has_yes = false;
var divider = 2;

function foo() {
  clicks = clicks + 1 * multiplier;
  var buttontxt = document.getElementById("bar");
  buttontxt.innerHTML = "clicks = " + clicks;
};
function subtract() {
  clicks = clicks - 1 * multiplier;
  var buttontxt = document.getElementById("bar");
  buttontxt.innerHTML = "clicks = " + clicks;
};
function multiply() {
  multiplier++;
  document.getElementById("bak").innerHTML = "multiplier = " + multiplier;
};
function divi() {
  clicks = clicks / divider;
  var buttontxt = document.getElementById("bar");
  buttontxt.innerHTML = "clicks = " + clicks;
};
function prnt() {
  print("ha")
};
function Yes() {
  has_yes = true;
  has_yes = true;
  alert("Yes " + has_yes);
};
function redirect() {
  window.location.replace("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
};

function eror() {
  var img = document.getElementById("img")
  img.style.visibility = "visible"
}