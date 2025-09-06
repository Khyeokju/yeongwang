function selectMen(gender) {
  localStorage.setItem('selectMen', gender);
  window.location.href = 'egenman.html';
}
function selectGirl(gender) {
  localStorage.setItem('selectGirl', gender);
  window.location.href = 'egengirl.html';
}