function selectMen(gender) {
  localStorage.setItem('selectMen', gender);
  window.location.href = 'questionMen.html';
}
function selectGirl(gender) {
  localStorage.setItem('selectGirl', gender);
  window.location.href = 'questionGirl.html';
}